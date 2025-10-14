import { getPool } from '@/lib/db'
import { hashPassword, verifyPassword, signJwt } from '@/lib/auth'

// Shared types
export type UserRole = 'customer' | 'admin' | 'employee' | 'tourguide' | 'driver'

export interface LoginResult {
  userID: number
  username: string
  role: UserRole
}

export interface CustomerSignupInput {
  username: string
  password: string
  email: string
  phoneNo?: string | null
  address?: string | null
  DOB?: string | null
  firstName?: string | null
  lastName?: string | null
}

export interface AdminRegisterInputBase {
  username: string
  password: string
  email: string
  name: string
  phoneNo?: string | null
  address?: string | null
  DOB?: string | null
}

export interface AdminRegisterAdmin extends AdminRegisterInputBase {
  role: 'admin'
  adminLevel: string
}

export interface AdminRegisterEmployee extends AdminRegisterInputBase {
  role: 'employee'
  position: string
  department: string
}

export interface AdminRegisterTourGuide extends AdminRegisterInputBase {
  role: 'tourguide'
  licenseNo: string
  experience: number
  specialization?: string | null
}

export interface AdminRegisterDriver extends AdminRegisterInputBase {
  role: 'driver'
  licenseNo: string
  vehicleType?: string | null
  picture?: string | null // New field per requirement (not persisted unless a column exists)
}

export type AdminRegisterInput =
  | AdminRegisterAdmin
  | AdminRegisterEmployee
  | AdminRegisterTourGuide
  | AdminRegisterDriver

// Utility validators
export class Validators {
  static isValidEmail(email: string): boolean {
    // Simple RFC5322-ish
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  static isStrongPassword(pw: string): boolean {
    // Min 8, upper, lower, number, special
    const lengthOK = pw.length >= 8
    const upper = /[A-Z]/.test(pw)
    const lower = /[a-z]/.test(pw)
    const digit = /\d/.test(pw)
    const special = /[!@#$%^&*(),.?":{}|<>]/.test(pw)
    return lengthOK && upper && lower && digit && special
  }
}

// Core auth facade
export class AuthService {
  static async login(emailOrUsername: string, password: string): Promise<LoginResult | null> {
    const res = await this.loginDetailed(emailOrUsername, password)
    return res.ok ? res.result : null
  }

  static async loginDetailed(
    emailOrUsername: string,
    password: string
  ): Promise<
    | { ok: true; result: LoginResult; rehashed?: boolean }
    | { ok: false; reason: 'NOT_FOUND' | 'INVALID_PASSWORD' | 'DB_ERROR' }
  > {
    try {
      const pool = getPool()
      const id = (emailOrUsername || '').trim()
      const [rows] = (await pool.query(
        'SELECT user_id, username, email, password_hash, role FROM users WHERE email = ? OR username = ? LIMIT 1',
        [id, id]
      )) as any

      if (!rows || rows.length === 0) return { ok: false, reason: 'NOT_FOUND' }
      const user = rows[0]
      const stored: string | null = user.password_hash ?? null

      let valid = false
      let rehashed = false

      // If stored looks like bcrypt, verify normally; otherwise treat as legacy/plain
      if (stored && /^\$2[aby]\$/.test(stored)) {
        valid = await verifyPassword(password, stored)
      } else {
        // Legacy or plaintext fallback
        valid = stored === password
        if (valid) {
          try {
            const newHash = await hashPassword(password)
            await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [newHash, user.user_id])
            rehashed = true
          } catch {
            // Ignore rehash failures; login can still proceed
          }
        }
      }

      if (!valid) return { ok: false, reason: 'INVALID_PASSWORD' }

      return {
        ok: true,
        result: { userID: user.user_id, username: user.username, role: user.role as UserRole },
        rehashed,
      }
    } catch (e) {
      return { ok: false, reason: 'DB_ERROR' }
    }
  }

  static async ensureUniqueUsernameEmail(conn: any, username: string, email: string) {
    const [existing] = (await conn.query(
      'SELECT user_id FROM users WHERE email = ? OR username = ? LIMIT 1',
      [email, username]
    )) as any
    if (existing.length > 0) {
      const err: any = new Error('Email or username already exists')
      err.code = 'DUPLICATE'
      throw err
    }
  }

  static splitName(name?: string | null): { first: string; last: string } {
    const trimmed = (name || '').trim()
    if (!trimmed) return { first: '', last: '' }
    const parts = trimmed.split(/\s+/)
    const first = parts.shift() || ''
    const last = parts.join(' ')
    return { first, last }
  }
}

// Guest: signup and login
export class Guest {
  static async guestSignup(input: CustomerSignupInput): Promise<{ user_id: number; username: string; email: string; role: 'customer' }>
  {
    const { username, password, email, phoneNo, address, DOB, firstName, lastName } = input

    if (!username || !password || !email) throw new Error('Missing required fields')
    if (!Validators.isValidEmail(email)) throw new Error('Invalid email format')
    if (!Validators.isStrongPassword(password)) throw new Error('Weak password')

    const pool = getPool()
    const conn = await pool.getConnection()
    try {
      await AuthService.ensureUniqueUsernameEmail(conn, username, email)

      const password_hash = await hashPassword(password)
      const fName = firstName ?? ''
      const lName = lastName ?? ''

      const [result] = (await conn.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, phone_number, address, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, email, password_hash, fName, lName, phoneNo || null, address || null, 'customer']
      )) as any

      // Note: DOB is collected but there is no column in schema; intentionally ignored for persistence.

      const userId = result.insertId as number
      return { user_id: userId, username, email, role: 'customer' }
    } finally {
      conn.release()
    }
  }

  static async guestLogin(emailOrUsername: string, password: string) {
    return AuthService.login(emailOrUsername, password)
  }
}

// Customer-specific
export class Customer {
  constructor(public readonly userID: number) {}

  static async login(emailOrUsername: string, password: string) {
    const res = await AuthService.login(emailOrUsername, password)
    if (!res || res.role !== 'customer') return null
    return res
  }

  // Change assigned driver for a booking the customer owns.
  // Implementation updates the vehicle associated with the booking.
  async changeDrivers(bookingId: number, newDriverId: number): Promise<boolean> {
    const pool = getPool()
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      const [rows] = (await conn.query(
        'SELECT vehicle_id FROM bookings WHERE booking_id = ? AND user_id = ? LIMIT 1',
        [bookingId, this.userID]
      )) as any
      if (!rows || rows.length === 0) throw new Error('Booking not found for this customer')
      const vehicleId = rows[0].vehicle_id as number | null
      if (!vehicleId) throw new Error('No vehicle assigned to this booking')

      await conn.query('UPDATE vehicles SET driver_id = ? WHERE vehicle_id = ?', [newDriverId, vehicleId])
      await conn.commit()
      return true
    } catch (e) {
      try { await (conn as any).rollback() } catch {}
      throw e
    } finally {
      conn.release()
    }
  }

  // Change assigned tour guide for the booked tour.
  // Note: bookings refer to tours; schema does not have per-booking guide override.
  // This method updates the tour's tour_guide_id as a simplification.
  async changeGuide(bookingId: number, newTourGuideId: number): Promise<boolean> {
    const pool = getPool()
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      const [rows] = (await conn.query(
        'SELECT tour_id FROM bookings WHERE booking_id = ? AND user_id = ? LIMIT 1',
        [bookingId, this.userID]
      )) as any
      if (!rows || rows.length === 0) throw new Error('Booking not found for this customer')
      const tourId = rows[0].tour_id as number | null
      if (!tourId) throw new Error('No tour associated with this booking')

      await conn.query('UPDATE tours SET tour_guide_id = ? WHERE tour_id = ?', [newTourGuideId, tourId])
      await conn.commit()
      return true
    } catch (e) {
      try { await (conn as any).rollback() } catch {}
      throw e
    } finally {
      conn.release()
    }
  }
}

// Admin-specific
export class Admin {
  constructor(public readonly userID: number) {}

  static async login(emailOrUsername: string, password: string) {
    const res = await AuthService.login(emailOrUsername, password)
    if (!res || res.role !== 'admin') return null
    return res
  }

  static async registerEmployee(adminUserId: number, input: AdminRegisterInput) {
    // Ensure caller is an admin
    const pool = getPool()
    const conn = await pool.getConnection()
    try {
      // Verify admin
      const [adminRows] = (await conn.query(
        'SELECT role FROM users WHERE user_id = ? LIMIT 1',
        [adminUserId]
      )) as any
      if (!adminRows || adminRows.length === 0 || adminRows[0].role !== 'admin') {
        const err: any = new Error('Unauthorized')
        err.status = 403
        throw err
      }

      const { username, password, email, name, phoneNo, address } = input

      if (!username || !password || !email || !name) throw new Error('Missing required fields')
      if (!Validators.isValidEmail(email)) throw new Error('Invalid email format')
      if (!Validators.isStrongPassword(password)) throw new Error('Weak password')

      await conn.beginTransaction()

      await AuthService.ensureUniqueUsernameEmail(conn, username, email)

      const password_hash = await hashPassword(password)
      const { first, last } = AuthService.splitName(name)

      const [userResult] = (await conn.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name, phone_number, address, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, email, password_hash, first, last, phoneNo || null, address || null, input.role]
      )) as any

      const userId = userResult.insertId as number

      // Insert role-specific data
      switch (input.role) {
        case 'admin': {
          const payload = input as AdminRegisterAdmin
          await conn.query('INSERT INTO admins (admin_id, admin_level) VALUES (?, ?)', [userId, payload.adminLevel])
          break
        }
        case 'employee': {
          const payload = input as AdminRegisterEmployee
          await conn.query(
            'INSERT INTO employees (employee_id, position, department) VALUES (?, ?, ?)',
            [userId, payload.position || 'Employee', payload.department || 'General']
          )
          break
        }
        case 'tourguide': {
          const payload = input as AdminRegisterTourGuide
          // Also register as employee
          await conn.query(
            'INSERT INTO employees (employee_id, position, department) VALUES (?, ?, ?)',
            [userId, 'Tour Guide', 'Guides']
          )
          await conn.query(
            'INSERT INTO tourguides (tour_guide_id, license_number, experience_years, specialization) VALUES (?, ?, ?, ?)',
            [userId, payload.licenseNo, payload.experience, payload.specialization || null]
          )
          break
        }
        case 'driver': {
          const payload = input as AdminRegisterDriver
          // Also register as employee
          await conn.query(
            'INSERT INTO employees (employee_id, position, department) VALUES (?, ?, ?)',
            [userId, 'Driver', 'Transport']
          )
          await conn.query(
            'INSERT INTO drivers (driver_id, license_number, vehicle_type) VALUES (?, ?, ?)',
            [userId, payload.licenseNo, payload.vehicleType || null]
          )
          // Note: Driver.picture is accepted by API but not persisted due to missing column in current schema.
          break
        }
      }

      await conn.commit()

      // Verify persistence across expected tables
      const [userRows] = (await conn.query(
        'SELECT user_id, username, role FROM users WHERE user_id = ? LIMIT 1',
        [userId]
      )) as any
      if (!userRows || userRows.length === 0) {
        throw new Error('Persistence verification failed: users row missing after commit')
      }

      if (input.role === 'employee') {
        const [empRows] = (await conn.query(
          'SELECT employee_id FROM employees WHERE employee_id = ? LIMIT 1',
          [userId]
        )) as any
        if (!empRows || empRows.length === 0) {
          throw new Error('Persistence verification failed: employees row missing')
        }
      } else if (input.role === 'tourguide') {
        const [empRows] = (await conn.query(
          'SELECT employee_id FROM employees WHERE employee_id = ? LIMIT 1',
          [userId]
        )) as any
        const [tgRows] = (await conn.query(
          'SELECT tour_guide_id FROM tourguides WHERE tour_guide_id = ? LIMIT 1',
          [userId]
        )) as any
        if (!empRows || empRows.length === 0 || !tgRows || tgRows.length === 0) {
          throw new Error('Persistence verification failed: employees or tourguides row missing')
        }
      } else if (input.role === 'driver') {
        const [empRows] = (await conn.query(
          'SELECT employee_id FROM employees WHERE employee_id = ? LIMIT 1',
          [userId]
        )) as any
        const [drvRows] = (await conn.query(
          'SELECT driver_id FROM drivers WHERE driver_id = ? LIMIT 1',
          [userId]
        )) as any
        if (!empRows || empRows.length === 0 || !drvRows || drvRows.length === 0) {
          throw new Error('Persistence verification failed: employees or drivers row missing')
        }
      } else if (input.role === 'admin') {
        const [admRows] = (await conn.query(
          'SELECT admin_id FROM admins WHERE admin_id = ? LIMIT 1',
          [userId]
        )) as any
        if (!admRows || admRows.length === 0) {
          throw new Error('Persistence verification failed: admins row missing')
        }
      }

      return { user_id: userId, role: input.role }
    } catch (e) {
      try { await (conn as any).rollback() } catch {}
      throw e
    } finally {
      conn.release()
    }
  }
}

// Employee/TourGuide/Driver thin logins
export class Employee {
  static async login(emailOrUsername: string, password: string) {
    const res = await AuthService.login(emailOrUsername, password)
    if (!res || res.role !== 'employee') return null
    return res
  }
}

export class TourGuide {
  static async login(emailOrUsername: string, password: string) {
    const res = await AuthService.login(emailOrUsername, password)
    if (!res || res.role !== 'tourguide') return null
    return res
  }
}

export class Driver {
  // New fields per requirement: picture and name
  picture?: string | null
  name?: string | null

  constructor(init?: Partial<Driver>) {
    Object.assign(this, init)
  }

  static async login(emailOrUsername: string, password: string) {
    const res = await AuthService.login(emailOrUsername, password)
    if (!res || res.role !== 'driver') return null
    return res
  }
}

// Other domain classes (lightweight definitions to reflect the model)
export class Trip {
  constructor(
    public readonly id: number,
    public customerId: number,
    public tourId: number,
    public startDate: Date,
    public endDate: Date
    // Note: status removed per requirement
  ) {}
}

export class Booking {
  constructor(
    public readonly id: number,
    public userId: number,
    public tourId: number | null,
    public vehicleId: number | null,
    public startDate: Date,
    public endDate: Date,
    public totalPrice: number,
    public bookingDate: Date
    // Note: status removed per requirement
  ) {}
}

export class Payment {
  constructor(
    public readonly id: number,
    public bookingId: number,
    public amount: number,
    public paymentDate: Date,
    public method?: string,
    public transactionId?: string
  ) {}
}

export class Rating {
  constructor(
    public readonly id: number,
    public subjectType: 'driver' | 'tourguide' | 'tour',
    public subjectId: number,
    public rating: number,
    public comment?: string,
    public avgRating?: number // New field per requirement
  ) {}
}

export class Vehicle {
  constructor(
    public readonly id: number,
    public driverId: number | null,
    public make: string,
    public model: string,
    public year: number,
    public licensePlate: string,
    public capacity?: number | null,
    public dailyRate?: number | null,
  ) {}
}
