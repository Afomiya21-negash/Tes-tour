import { NextRequest, NextResponse } from 'next/server'
import { signJwt, getAuthCookieOptions } from '@/lib/auth'
import { AuthService } from '@/lib/domain'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { emailOrUsername, password } = body || {}
    if (!emailOrUsername || !password) {
      return NextResponse.json({ message: 'Missing credentials' }, { status: 400 })
    }

    const detailedResult = await AuthService.loginDetailed(emailOrUsername, password)
    if (!detailedResult.ok) {
      if (detailedResult.reason === 'EMAIL_NOT_VERIFIED') {
        return NextResponse.json({ 
          message: 'Please verify your email before logging in. Check your inbox for the verification link.' 
        }, { status: 403 })
      }
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const result = detailedResult.result

    const token = signJwt({ user_id: result.userID, role: result.role })
    const res = NextResponse.json({ user_id: result.userID, username: result.username, role: result.role })
    res.cookies.set('auth_token', token, getAuthCookieOptions())
    return res
  } catch (e) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}



