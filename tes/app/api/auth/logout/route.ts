import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ ok: true, message: 'Logged out successfully' })

  // Clear both possible auth cookies
  res.cookies.set('auth_token', '', { httpOnly: true, maxAge: 0, path: '/' })
  res.cookies.set('token', '', { httpOnly: true, maxAge: 0, path: '/' })

  return res
}



