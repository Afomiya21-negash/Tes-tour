import { NextRequest, NextResponse } from 'next/server'
import { getAuthCookieOptions, signJwt } from '@/lib/auth'
import { Guest, Validators } from '@/lib/domain'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, email, password, phoneNo, address, DOB, first_name, last_name } = body || {}

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    if (!Validators.isValidEmail(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }
    if (!Validators.isStrongPassword(password)) {
      return NextResponse.json({ message: 'Weak password' }, { status: 400 })
    }

    try {
      const created = await Guest.guestSignup({
        username,
        email,
        password,
        phoneNo: phoneNo ?? null,
        address: address ?? null,
        DOB: DOB ?? null,
        firstName: first_name ?? null,
        lastName: last_name ?? null,
      })

      const token = signJwt({ user_id: created.user_id, role: 'customer' })
      const res = NextResponse.json(created, { status: 201 })
      res.cookies.set('auth_token', token, getAuthCookieOptions())
      return res
    } catch (e: any) {
      if (e?.code === 'DUPLICATE') {
        return NextResponse.json({ message: 'Email or username already exists' }, { status: 409 })
      }
      throw e
    }
  } catch (e) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}


