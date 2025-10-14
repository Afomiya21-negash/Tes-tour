import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt, getAuthCookieOptions, signJwt } from '@/lib/auth'
import { Admin, Validators } from '@/lib/domain'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const payload = verifyJwt(token)
    if (!payload || payload.role !== 'admin') return NextResponse.json({ message: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const { role, username, password, email, name, phoneNo, address, DOB } = body || {}

    if (!role || !username || !password || !email || !name) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    if (!['admin', 'employee', 'tourguide', 'driver'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 })
    }
    if (!Validators.isValidEmail(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }
    if (!Validators.isStrongPassword(password)) {
      return NextResponse.json({ message: 'Weak password' }, { status: 400 })
    }

    try {
      const created = await Admin.registerEmployee(payload.user_id, { ...body, role, username, password, email, name, phoneNo: phoneNo ?? null, address: address ?? null, DOB: DOB ?? null })
      return NextResponse.json({ ...created }, { status: 201 })
    } catch (e: unknown) {
      if (e instanceof Error && (e as { code?: string })?.code === 'DUPLICATE') {
        return NextResponse.json({ message: 'Email or username already exists' }, { status: 409 })
      }
      if (e instanceof Error && (e as { status?: number })?.status === 403) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
      }
      throw e
    }
  } catch (e) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
