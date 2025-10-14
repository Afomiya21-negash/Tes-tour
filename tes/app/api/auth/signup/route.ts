import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import { hashPassword, signJwt, getAuthCookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, email, password, first_name, last_name, phone_number, address } = body || {}

    if (!username || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const pool = getPool()
    const conn = await pool.getConnection()
    try {
      const [existing] = await conn.query(
        'SELECT user_id FROM Users WHERE email = ? OR username = ? LIMIT 1',
        [email, username]
      ) as any
      if (existing.length > 0) {
        return NextResponse.json({ message: 'Email or username already exists' }, { status: 409 })
      }

      const password_hash = await hashPassword(password)
      const [result] = await conn.query(
        `INSERT INTO Users (username, email, password_hash, first_name, last_name, phone_number, address, role)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, email, password_hash, first_name || '', last_name || '', phone_number || null, address || null, 'customer']
      ) as any

      const userId = result.insertId
      const token = signJwt({ user_id: userId, role: 'customer' })
      const res = NextResponse.json({ user_id: userId, username, email, role: 'customer' }, { status: 201 })
      res.cookies.set('auth_token', token, getAuthCookieOptions())
      return res
    } finally {
      conn.release()
    }
  } catch (e) {
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}


