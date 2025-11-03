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

      let result: any
      try {
        // Discover available columns to avoid schema mismatches (best-effort)
        const [userColsRows] = (await conn.query(
          `SELECT column_name FROM information_schema.columns
           WHERE table_schema = DATABASE() AND table_name = 'users'`
        )) as any
        const availableCols = new Set((userColsRows || []).map((r: any) => String(r.column_name)))

        const cols: string[] = []
        const vals: any[] = []

        const push = (col: string, val: any) => { cols.push(col); vals.push(val) }

        push('username', username)
        push('email', email)
        push('password_hash', password_hash)
        if (availableCols.has('first_name')) push('first_name', fName)
        if (availableCols.has('last_name')) push('last_name', lName)
        if (availableCols.has('phone_number')) push('phone_number', phoneNo || null)
        push('role', 'customer')

        const placeholders = cols.map(() => '?').join(', ')
        const [ins] = (await conn.query(
          `INSERT INTO users (${cols.join(', ')}) VALUES (${placeholders})`,
          vals
        )) as any
        result = ins
      } catch {
        // Fallback to known schema from tes_tour.sql
        const [ins] = (await conn.query(
          `INSERT INTO users (username, email, password_hash, first_name, last_name, phone_number, role)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [username, email, password_hash, fName, lName, phoneNo || null, 'customer']
        )) as any
        result = ins
      }

      const userId = result.insertId as number

      // Insert into customers table (create table if it doesn't exist)
      try {
        await conn.query(
          `CREATE TABLE IF NOT EXISTS customers (
            customer_id int(11) NOT NULL,
            address varchar(255) DEFAULT NULL,
            date_of_birth date DEFAULT NULL,
            PRIMARY KEY (customer_id),
            FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`
        )

        await conn.query(
          `INSERT INTO customers (customer_id, address, date_of_birth)
           VALUES (?, ?, ?)`,
          [userId, address || null, DOB || null]
        )
      } catch (customerError) {
        console.error('Error creating customer record:', customerError)
        // Continue without failing the signup if customers table creation fails
      }

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

          // Ensure drivers table has correct picture column type
          try {
            await conn.query('ALTER TABLE drivers MODIFY COLUMN picture TEXT DEFAULT NULL')
          } catch (alterError: any) {
            console.log('Drivers table alter warning (may already be correct):', alterError?.message || 'Unknown error')
          }

          // Truncate picture if too long (base64 images can be very long)
          let pictureData = payload.picture || null
          if (pictureData && pictureData.length > 65535) {
            console.warn('Picture data too long, truncating...')
            pictureData = pictureData.substring(0, 65535)
          }

          await conn.query(
            'INSERT INTO drivers (driver_id, license_number, vehicle_type, picture) VALUES (?, ?, ?, ?)',
            [userId, payload.licenseNo, payload.vehicleType || null, pictureData]
          )
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

      // determine position for response
      let respPosition: string | null = null
      if (input.role === 'employee') {
        respPosition = (input as AdminRegisterEmployee).position || 'Employee'
      } else if (input.role === 'tourguide') {
        respPosition = 'Tour Guide'
      } else if (input.role === 'driver') {
        respPosition = 'Driver'
      } else if (input.role === 'admin') {
        respPosition = 'Admin'
      }

      return { user_id: userId, role: input.role, position: respPosition }
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

    // Fetch employee details (position, department) to allow role-based UI/server checks
    try {
      const pool = getPool()
      const [rows] = (await pool.query('SELECT employee_id, position, department FROM employees WHERE employee_id = ? LIMIT 1', [res.userID])) as any
      const emp = rows && rows.length > 0 ? rows[0] : null
      return {
        ...res,
        position: emp ? emp.position : null,
        department: emp ? emp.department : null,
      }
    } catch (e) {
      // If employee row not found or DB error, still return basic auth result
      return res
    }
  }

  static async isHR(userID: number): Promise<boolean> {
    try {
      const pool = getPool()
      const [rows] = (await pool.query('SELECT position FROM employees WHERE employee_id = ? LIMIT 1', [userID])) as any
      if (!rows || rows.length === 0) return false
      const pos = (rows[0].position || '').toLowerCase()
      const hrTitles = ['hr', 'human resources', 'hr manager', 'hr officer', 'hr specialist']
      return hrTitles.includes(pos)
    } catch (e) {
      return false
    }
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

// Payment Service for handling payment operations
export class PaymentService {
  static async createPayment(input: {
    bookingId: number
    amount: number
    paymentMethod: string
    transactionId?: string
  }): Promise<{ payment_id: number }> {
    const pool = getPool()
    const conn = await pool.getConnection()

    try {
      await conn.beginTransaction()

      const { bookingId, amount, paymentMethod, transactionId } = input

      // Check if booking exists and doesn't already have a payment
      const [bookingRows] = (await conn.query(
        'SELECT booking_id FROM bookings WHERE booking_id = ? LIMIT 1',
        [bookingId]
      )) as any

      if (!bookingRows || bookingRows.length === 0) {
        throw new Error('Booking not found')
      }

      const [existingPayment] = (await conn.query(
        'SELECT payment_id FROM payments WHERE booking_id = ? LIMIT 1',
        [bookingId]
      )) as any

      if (existingPayment && existingPayment.length > 0) {
        throw new Error('Payment already exists for this booking')
      }

      // Create payment
      const [result] = (await conn.query(
        `INSERT INTO payments (booking_id, amount, payment_date, payment_method, transaction_id, status)
         VALUES (?, ?, NOW(), ?, ?, 'completed')`,
        [bookingId, amount, paymentMethod, transactionId || null]
      )) as any

      const paymentId = result.insertId as number

      // Update booking status to confirmed
      await conn.query(
        'UPDATE bookings SET status = "confirmed" WHERE booking_id = ?',
        [bookingId]
      )

      // Get booking details to check if it has a tour
      const [bookingDetails] = (await conn.query(
        'SELECT tour_id FROM bookings WHERE booking_id = ? LIMIT 1',
        [bookingId]
      )) as any

      // Create custom itinerary from tour default if tour exists
      if (bookingDetails && bookingDetails.length > 0 && bookingDetails[0].tour_id) {
        await ItineraryService.createCustomItineraryFromTour(bookingId, bookingDetails[0].tour_id)
      }

      await conn.commit()
      return { payment_id: paymentId }
    } catch (e) {
      try { await conn.rollback() } catch {}
      throw e
    } finally {
      conn.release()
    }
  }

  static async getPaymentByBookingId(bookingId: number): Promise<any | null> {
    const pool = getPool()
    const [rows] = (await pool.query(
      'SELECT * FROM payments WHERE booking_id = ? LIMIT 1',
      [bookingId]
    )) as any

    return rows && rows.length > 0 ? rows[0] : null
  }

  static async getPaymentById(paymentId: number): Promise<any | null> {
    const pool = getPool()
    const [rows] = (await pool.query(
      'SELECT * FROM payments WHERE payment_id = ? LIMIT 1',
      [paymentId]
    )) as any

    return rows && rows.length > 0 ? rows[0] : null
  }
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
    public imageUrl?: string | null,
  ) {}
}

export class Tour {
  constructor(
    public readonly id: number,
    public tourGuideId: number | null,
    public name: string,
    public description: string | null,
    public destination: string,
    public durationDays: number | null,
    public price: number,
    public availability: boolean = true
  ) {}
}

// Booking Service for handling booking operations
export class BookingService {
  static async createBooking(input: {
    userId: number
    tourId?: number | null
    vehicleId?: number | null
    driverId?: number | null
    startDate: string
    endDate: string
    totalPrice: number
    peopleCount: number
    specialRequests?: string
    customerName?: string
    customerPhone?: string
    idPictures?: string | null
  }): Promise<{ booking_id: number }> {
    const pool = getPool()
    const conn = await pool.getConnection()

    try {
      await conn.beginTransaction()

      const { userId, tourId, vehicleId, driverId, startDate, endDate, totalPrice, peopleCount, specialRequests, customerName, customerPhone, idPictures } = input

      // Validate dates
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start >= end) {
        throw new Error('End date must be after start date')
      }

      // Check tour availability if tour is specified
      if (tourId) {
        const [tourRows] = (await conn.query(
          'SELECT availability FROM tours WHERE tour_id = ? LIMIT 1',
          [tourId]
        )) as any
        if (!tourRows || tourRows.length === 0 || !tourRows[0].availability) {
          throw new Error('Tour is not available')
        }
      }

      // Check vehicle availability if vehicle is specified
      if (vehicleId) {
        const [vehicleRows] = (await conn.query(
          'SELECT status FROM vehicles WHERE vehicle_id = ? LIMIT 1',
          [vehicleId]
        )) as any
        const vehicleStatus = (vehicleRows && vehicleRows[0] ? String(vehicleRows[0].status || '') : '').toLowerCase()
        if (!vehicleRows || vehicleRows.length === 0 || vehicleStatus !== 'available') {
          throw new Error('Vehicle is not available')
        }
      }

      // Check driver availability if driver is specified
      if (driverId) {
        const [driverRows] = (await conn.query(
          `SELECT COUNT(*) as active_bookings FROM bookings
           WHERE driver_id = ? AND status IN ('confirmed', 'in-progress')
           AND ((start_date <= ? AND end_date >= ?) OR (start_date <= ? AND end_date >= ?))`,
          [driverId, startDate, startDate, endDate, endDate]
        )) as any
        if (driverRows && driverRows[0] && driverRows[0].active_bookings > 0) {
          throw new Error('Driver is not available for the selected dates')
        }
      }

      // Update user information if provided
      if (customerName || customerPhone) {
        const updateFields = []
        const updateValues = []
        
        if (customerName) {
          const { first, last } = AuthService.splitName(customerName)
          updateFields.push('first_name = ?, last_name = ?')
          updateValues.push(first, last)
        }
        
        if (customerPhone) {
          updateFields.push('phone_number = ?')
          updateValues.push(customerPhone)
        }
        
        if (updateFields.length > 0) {
          updateValues.push(userId)
          await conn.query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE user_id = ?`,
            updateValues
          )
        }
      }

      // Create booking (match existing schema - no special_requests column)
      const [result] = (await conn.query(
        `INSERT INTO bookings (user_id, tour_id, vehicle_id, driver_id, start_date, end_date, total_price, number_of_people, booking_date, status, id_picture)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'pending', ?)`,
        [userId, tourId || null, vehicleId || null, driverId || null, startDate, endDate, totalPrice, peopleCount || 1, idPictures || null]
      )) as any

      const bookingId = result.insertId as number

      await conn.commit()
      return { booking_id: bookingId }
    } catch (e) {
      try { await conn.rollback() } catch {}
      throw e
    } finally {
      conn.release()
    }
  }

  static async getUserBookings(userId: number): Promise<any[]> {
    const pool = getPool()
    const [rows] = (await pool.query(
      `SELECT
        b.booking_id,
        b.tour_id,
        b.vehicle_id,
        b.driver_id,
        b.tour_guide_id,
        b.start_date,
        b.end_date,
        b.total_price,
        b.booking_date,
        b.status,
        t.name as tour_name,
        t.destination,
        t.duration_days,
        v.make as vehicle_make,
        v.model as vehicle_model,
        v.capacity as vehicle_capacity,
        p.amount as payment_amount,
        p.status as payment_status,
        p.payment_method,
        tg.first_name as tour_guide_first_name,
        tg.last_name as tour_guide_last_name,
        tg.phone_number as tour_guide_phone,
        tg.email as tour_guide_email,
        d.first_name as driver_first_name,
        d.last_name as driver_last_name,
        d.phone_number as driver_phone,
        d.email as driver_email
      FROM bookings b
      LEFT JOIN tours t ON b.tour_id = t.tour_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      LEFT JOIN users tg ON b.tour_guide_id = tg.user_id
      LEFT JOIN users d ON b.driver_id = d.user_id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC`,
      [userId]
    )) as any

    return rows || []
  }

  static async getBookingById(bookingId: number, userId?: number): Promise<any | null> {
    const pool = getPool()
    let query = `
      SELECT
        b.*,
        t.name as tour_name,
        t.destination,
        t.duration_days,
        t.description as tour_description,
        v.make as vehicle_make,
        v.model as vehicle_model,
        v.capacity as vehicle_capacity,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number
      FROM bookings b
      LEFT JOIN tours t ON b.tour_id = t.tour_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      LEFT JOIN users u ON b.user_id = u.user_id
      WHERE b.booking_id = ?`

    const params = [bookingId]

    if (userId) {
      query += ' AND b.user_id = ?'
      params.push(userId)
    }

    query += ' LIMIT 1'

    const [rows] = (await pool.query(query, params)) as any
    return rows && rows.length > 0 ? rows[0] : null
  }
}

// Tour Service for handling tour operations
export class TourService {
  static async getAllTours(): Promise<Tour[]> {
    const pool = getPool()
    const [rows] = (await pool.query(
      'SELECT tour_id, tour_guide_id, name, description, destination, duration_days, price, availability FROM tours WHERE availability = 1'
    )) as any

    return (rows || []).map((row: any) => new Tour(
      row.tour_id,
      row.tour_guide_id,
      row.name,
      row.description,
      row.destination,
      row.duration_days,
      row.price,
      row.availability
    ))
  }

  static async getAllToursWithPromotions(): Promise<any[]> {
    const pool = getPool()
    const [rows] = (await pool.query(`
      SELECT
        t.tour_id,
        t.tour_guide_id,
        t.name,
        t.description,
        t.destination,
        t.duration_days,
        t.price,
        t.availability,
        p.promoid,
        p.dis as discount_percentage,
        p.date as promotion_date
      FROM tours t
      LEFT JOIN promotion p ON t.tour_id = p.tour_id
        AND p.date >= CURDATE()
      WHERE t.availability = 1
      ORDER BY t.tour_id, p.date ASC
    `)) as any

    // Group tours and their promotions
    const toursMap = new Map()

    for (const row of rows || []) {
      const tourId = row.tour_id

      if (!toursMap.has(tourId)) {
        toursMap.set(tourId, {
          id: row.tour_id,
          tour_guide_id: row.tour_guide_id,
          name: row.name,
          description: row.description,
          destination: row.destination,
          durationDays: row.duration_days,
          price: row.price,
          availability: row.availability,
          promotions: []
        })
      }

      // Add promotion if it exists
      if (row.promoid) {
        toursMap.get(tourId).promotions.push({
          id: row.promoid,
          discount_percentage: row.discount_percentage,
          date: row.promotion_date
        })
      }
    }

    return Array.from(toursMap.values())
  }

  static async getTourById(tourId: number): Promise<Tour | null> {
    const pool = getPool()
    const [rows] = (await pool.query(
      'SELECT tour_id, tour_guide_id, name, description, destination, duration_days, price, availability FROM tours WHERE tour_id = ? LIMIT 1',
      [tourId]
    )) as any

    if (!rows || rows.length === 0) return null

    const row = rows[0]
    return new Tour(
      row.tour_id,
      row.tour_guide_id,
      row.name,
      row.description,
      row.destination,
      row.duration_days,
      row.price,
      row.availability
    )
  }
}

// Vehicle Service for handling vehicle operations
export class VehicleService {
  static async getAvailableVehicles(): Promise<Vehicle[]> {
    const pool = getPool()
    const [rows] = (await pool.query(
      'SELECT vehicle_id, driver_id, make, model, year, license_plate, capacity, daily_rate, picture FROM vehicles WHERE status IN ("available", "Available")'
    )) as any

    return (rows || []).map((row: any) => {
      // Fix image path - remove 'tes' prefix and ensure it starts with '/'
      let imageUrl = row.picture
      if (imageUrl && imageUrl.startsWith('tes/public/images/')) {
        imageUrl = imageUrl.replace('tes/public/images/', '/images/')
      } else if (imageUrl && imageUrl.startsWith('tespublicimages')) {
        imageUrl = imageUrl.replace('tespublicimages', '/images/')
      } else if (imageUrl && !imageUrl.startsWith('/')) {
        imageUrl = '/images/' + imageUrl
      }

      return new Vehicle(
        row.vehicle_id,
        row.driver_id,
        row.make,
        row.model,
        row.year,
        row.license_plate,
        row.capacity,
        row.daily_rate,
        imageUrl
      )
    })
  }

  static async getVehicleById(vehicleId: number): Promise<Vehicle | null> {
    const pool = getPool()
    const [rows] = (await pool.query(
      'SELECT vehicle_id, driver_id, make, model, year, license_plate, capacity, daily_rate, picture FROM vehicles WHERE vehicle_id = ? LIMIT 1',
      [vehicleId]
    )) as any

    if (!rows || rows.length === 0) return null

    const row = rows[0]
    
    // Fix image path - remove 'tes' prefix and ensure it starts with '/'
    let imageUrl = row.picture
    if (imageUrl && imageUrl.startsWith('tes/public/images/')) {
      imageUrl = imageUrl.replace('tes/public/images/', '/images/')
    } else if (imageUrl && imageUrl.startsWith('tespublicimages')) {
      imageUrl = imageUrl.replace('tespublicimages', '/images/')
    } else if (imageUrl && !imageUrl.startsWith('/')) {
      imageUrl = '/images/' + imageUrl
    }

    return new Vehicle(
      row.vehicle_id,
      row.driver_id,
      row.make,
      row.model,
      row.year,
      row.license_plate,
      row.capacity,
      row.daily_rate,
      imageUrl
    )
  }
}

// Itinerary domain models and services
export interface TourItinerary {
  itinerary_id: number
  tour_id: number
  day_number: number
  title: string
  description: string
  location?: string
  overnight_location?: string
  activities?: string
  meals_included?: string
  created_at: string
  updated_at: string
}

export interface CustomItinerary {
  custom_itinerary_id: number
  booking_id: number
  day_number: number
  title: string
  description: string
  location?: string
  overnight_location?: string
  activities?: string
  meals_included?: string
  special_requests?: string
  is_approved: boolean
  approved_by?: number
  approved_at?: string
  created_at: string
  updated_at: string
}

export interface ItineraryRequest {
  request_id: number
  booking_id: number
  customer_id: number
  request_type: 'modification' | 'addition' | 'removal'
  day_number?: number
  requested_changes: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  admin_response?: string
  processed_by?: number
  processed_at?: string
  created_at: string
}

export class ItineraryService {
  // Get default tour itinerary
  static async getTourItinerary(tourId: number): Promise<TourItinerary[]> {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM itinerary WHERE tour_id = ? ORDER BY itinerary_id ASC',
      [tourId]
    )

    return Array.isArray(rows) ? rows as TourItinerary[] : []
  }

  // Get custom itinerary for a booking
  static async getCustomItinerary(bookingId: number): Promise<CustomItinerary[]> {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM custom_itinerary WHERE booking_id = ? ORDER BY custom_itinerary_id ASC',
      [bookingId]
    )

    return Array.isArray(rows) ? rows as CustomItinerary[] : []
  }

  // Create custom itinerary from tour default
  static async createCustomItineraryFromTour(bookingId: number, tourId: number): Promise<void> {
    const pool = getPool()
    const connection = await pool.getConnection()

    try {
      await connection.beginTransaction()

      // Get tour itinerary
      const [tourItinerary] = await connection.execute(
        'SELECT * FROM itinerary WHERE tour_id = ? ORDER BY itinerary_id ASC',
        [tourId]
      )

      if (Array.isArray(tourItinerary) && tourItinerary.length > 0) {
        // Copy each day to custom itinerary
        // Create a simple custom itinerary based on tour data
        const itineraryData = {
          days: tourItinerary.map((day: any, index: number) => ({
            day: index + 1,
            title: day.title || `Day ${index + 1}`,
            description: day.description || 'Tour activities',
            location: day.location || 'Various locations'
          }))
        }

        await connection.execute(
          `INSERT INTO custom_itinerary (booking_id, itinerary_data, created_at, updated_at)
           VALUES (?, ?, NOW(), NOW())`,
          [bookingId, JSON.stringify(itineraryData)]
        )
      }

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
  }

  // Submit itinerary modification request
  static async submitItineraryRequest(
    bookingId: number,
    customerId: number,
    requestType: 'modification' | 'addition' | 'removal',
    requestedChanges: string,
    reason?: string
  ): Promise<number> {
    const pool = getPool()
    const [result] = await pool.execute(
      `INSERT INTO itinerary_requests
       (booking_id, customer_id, request_type, requested_changes, reason, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [bookingId, customerId, requestType, requestedChanges, reason]
    )

    return (result as any).insertId
  }

  // Get itinerary requests for a booking
  static async getItineraryRequests(bookingId: number): Promise<ItineraryRequest[]> {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM itinerary_requests WHERE booking_id = ? ORDER BY created_at DESC',
      [bookingId]
    )

    return Array.isArray(rows) ? rows as ItineraryRequest[] : []
  }

  // Update custom itinerary day
  static async updateCustomItineraryDay(
    customItineraryId: number,
    updates: Partial<CustomItinerary>
  ): Promise<void> {
    const pool = getPool()

    const fields = []
    const values = []

    if (updates.title) {
      fields.push('title = ?')
      values.push(updates.title)
    }
    if (updates.description) {
      fields.push('description = ?')
      values.push(updates.description)
    }
    if (updates.location) {
      fields.push('location = ?')
      values.push(updates.location)
    }
    if (updates.overnight_location) {
      fields.push('overnight_location = ?')
      values.push(updates.overnight_location)
    }
    if (updates.activities) {
      fields.push('activities = ?')
      values.push(updates.activities)
    }
    if (updates.meals_included) {
      fields.push('meals_included = ?')
      values.push(updates.meals_included)
    }
    if (updates.special_requests) {
      fields.push('special_requests = ?')
      values.push(updates.special_requests)
    }

    if (fields.length > 0) {
      values.push(customItineraryId)
      await pool.execute(
        `UPDATE custom_itinerary SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE custom_itinerary_id = ?`,
        values
      )
    }
  }
}
