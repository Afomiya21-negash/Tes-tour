import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import { verifyPassword, signJwt, getAuthCookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { emailOrUsername, password } = body || {}
    if (!emailOrUsername || !password) {
      return NextResponse.json({ message: 'Missing credentials' }, { status: 400 })
    }

    const pool = getPool()
    const [rows] = await pool.query(
      'SELECT user_id, username, email, password_hash, role FROM Users WHERE email = ? OR username = ? LIMIT 1',
      [emailOrUsername, emailOrUsername]
    ) as any

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const user = rows[0]
    const valid = await verifyPassword(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    const token = signJwt({ user_id: user.user_id, role: user.role })
    const res = NextResponse.json({ user_id: user.user_id, username: user.username, email: user.email, role: user.role })
    res.cookies.set('auth_token', token, getAuthCookieOptions())
    return res
  } catch (e) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}


