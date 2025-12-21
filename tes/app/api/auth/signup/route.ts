import { NextRequest, NextResponse } from 'next/server'
import { Guest, Validators } from '@/lib/domain'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, email, password, phoneNo, address, DOB, first_name, last_name } = body || {}

    if (!username || !email || !password || !first_name || !last_name) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    if (!Validators.isValidEmail(email)) {
      return NextResponse.json({ message: 'Invalid email format' }, { status: 400 })
    }
    if (!Validators.isStrongPassword(password)) {
      return NextResponse.json({ message: 'Weak password' }, { status: 400 })
    }

    // Validate age if DOB is provided
    if (DOB) {
      const today = new Date()
      const birthDate = new Date(DOB)
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      let actualAge = age
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        actualAge = age - 1
      }

      if (actualAge < 18) {
        return NextResponse.json({ message: 'You must be at least 18 years old to register' }, { status: 400 })
      }
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

      // Don't log in unverified users - they need to verify email first
      // Return success message indicating verification email was sent
      return NextResponse.json(
        { 
          message: 'Registration successful! Please check your email to verify your account.',
          user_id: created.user_id,
          username: created.username,
          email: created.email,
          requires_verification: true
        }, 
        { status: 201 }
      )
    } catch (e: any) {
      if (e?.code === 'DUPLICATE') {
        return NextResponse.json({ message: 'Email or username already exists' }, { status: 409 })
      }
      throw e
    }
  } catch (e: any) {
    console.error('Signup error:', e)
    return NextResponse.json({ message: e?.message || 'Server error' }, { status: 500 })
  }
}


