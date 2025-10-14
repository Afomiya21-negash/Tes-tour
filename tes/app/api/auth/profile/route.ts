import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ authenticated: false }, { status: 200 })

    const payload = verifyJwt(token)
    if (!payload || !payload.user_id) return NextResponse.json({ authenticated: false }, { status: 200 })

    const userId = Number(payload.user_id)
    const pool = getPool()
    const [rows] = (await pool.query(
      `SELECT user_id, username, email, role, first_name, last_name
       FROM users WHERE user_id = ? LIMIT 1`,
      [userId]
    )) as any

    if (!rows || rows.length === 0) return NextResponse.json({ authenticated: false }, { status: 200 })
    const u = rows[0]
    const firstName = (u.first_name || '').toString()
    const lastName = (u.last_name || '').toString()
    const displayName = (firstName || lastName) ? `${firstName} ${lastName}`.trim() : (u.username || '')

    return NextResponse.json({
      authenticated: true,
      user: {
        user_id: u.user_id,
        username: u.username,
        email: u.email,
        role: u.role,
        first_name: firstName || null,
        last_name: lastName || null,
        display_name: displayName,
        initial: (displayName || u.username || 'U').trim().charAt(0).toUpperCase(),
      }
    }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ authenticated: false }, { status: 200 })
  }
}
