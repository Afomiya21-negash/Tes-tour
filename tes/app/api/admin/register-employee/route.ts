import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { Admin } from '@/lib/domain'

function genUsername(name: string, email: string) {
  const baseFromName = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '')
  const baseFromEmail = (email || '').split('@')[0].toLowerCase().replace(/[^a-z0-9]+/g, '.')
  const base = baseFromName || baseFromEmail || 'user'
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}.${suffix}`
}

function genTempPassword() {
  // 12 chars mixed, meets Validators.isStrongPassword
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower = 'abcdefghijkmnopqrstuvwxyz'
  const digits = '23456789'
  const specials = '!@#$%^&*()_+[]{}~'
  const all = upper + lower + digits + specials
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)]
  const ensure = [pick(upper), pick(lower), pick(digits), pick(specials)]
  const rest: string[] = []
  for (let i = 0; i < 8; i++) rest.push(pick(all))
  const raw = [...ensure, ...rest]
  // shuffle
  for (let i = raw.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[raw[i], raw[j]] = [raw[j], raw[i]]
  }
  return raw.join('')
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const payload = verifyJwt(token)
    if (!payload || !payload.user_id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const adminUserId = Number(payload.user_id)
    const body = await req.json()

    const {
      name,
      email,
      phoneNo,
      address,
      role, // 'driver' | 'tourguide' | 'employee'
      // driver-specific
      licenseNo,
      vehicleType,
      picture,
      // tourguide-specific
      experience,
      specialization,
      // employee-specific
      position,
      department,
    } = body || {}

    if (!name || !email || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    if (role !== 'driver' && role !== 'tourguide' && role !== 'employee') {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 })
    }

    // Role-specific minimal validation
    if (role === 'driver') {
      if (!licenseNo) return NextResponse.json({ message: 'Driver license number is required' }, { status: 400 })
    }
    if (role === 'tourguide') {
      if (!licenseNo) return NextResponse.json({ message: 'Tour guide license number is required' }, { status: 400 })
      if (typeof experience !== 'number') {
        return NextResponse.json({ message: 'Tour guide experience (years) must be a number' }, { status: 400 })
      }
    }
    if (role === 'employee') {
      if (!position) return NextResponse.json({ message: 'Position is required for employees' }, { status: 400 })
      if (!department) return NextResponse.json({ message: 'Department is required for employees' }, { status: 400 })
    }

    const username = genUsername(name, email)
    const tempPassword = genTempPassword()

    let created: { user_id: number; role: string }

    if (role === 'driver') {
      created = (await Admin.registerEmployee(adminUserId, {
        role: 'driver',
        username,
        password: tempPassword,
        email,
        name,
        phoneNo: phoneNo ?? null,
        address: address ?? null,
        licenseNo,
        vehicleType: vehicleType ?? null,
        picture: picture ?? null,
      } as any)) as any
    } else if (role === 'tourguide') {
      created = (await Admin.registerEmployee(adminUserId, {
        role: 'tourguide',
        username,
        password: tempPassword,
        email,
        name,
        phoneNo: phoneNo ?? null,
        address: address ?? null,
        licenseNo,
        experience: Number(experience),
        specialization: specialization ?? null,
      } as any)) as any
    } else {
      // employee
      created = (await Admin.registerEmployee(adminUserId, {
        role: 'employee',
        username,
        password: tempPassword,
        email,
        name,
        phoneNo: phoneNo ?? null,
        address: address ?? null,
        position: position ?? 'Employee',
        department: department ?? 'General',
      } as any)) as any
    }

    return NextResponse.json(
      {
        user_id: created.user_id,
        role: created.role,
        username,
        temp_password: tempPassword,
        name,
        email,
        phoneNo: phoneNo ?? null,
      },
      { status: 201 }
    )
  } catch (e: any) {
    const msg = e?.message || 'Server error'
    const status = e?.status || 500
    if (e?.code === 'DUPLICATE') {
      return NextResponse.json({ message: 'Email or username already exists' }, { status: 409 })
    }
    return NextResponse.json({ message: msg }, { status })
  }
}
