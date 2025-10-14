import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

async function ensureAdmin(userId: number) {
  const pool = getPool()
  const [rows] = (await pool.query('SELECT role FROM users WHERE user_id = ? LIMIT 1', [userId])) as any
  if (!rows || rows.length === 0 || rows[0].role !== 'admin') {
    const err: any = new Error('Unauthorized')
    err.status = 403
    throw err
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const payload = verifyJwt(token)
    if (!payload || !payload.user_id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const adminUserId = Number(payload.user_id)
    await ensureAdmin(adminUserId)

    const pool = getPool()
    const [rows] = (await pool.query(
      `SELECT 
         u.user_id AS id,
         TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))) AS name,
         u.email AS email,
         COALESCE(u.phone_number, '') AS phone,
         u.role AS role,
         DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS hireDate
       FROM users u
       INNER JOIN employees e ON e.employee_id = u.user_id
       WHERE u.role IN ('driver', 'tourguide')
       ORDER BY u.user_id DESC`
    )) as any

    // Ensure proper shape and types
    const items = (rows || []).map((r: any) => ({
      id: Number(r.id),
      name: (r.name || '').trim(),
      email: r.email || '',
      phone: r.phone || '',
      role: r.role === 'driver' ? 'driver' : 'tourguide',
      hireDate: r.hireDate || new Date().toISOString().split('T')[0],
    }))

    return NextResponse.json({ employees: items }, { status: 200 })
  } catch (e: any) {
    const status = e?.status || 500
    const message = e?.message || 'Server error'
    return NextResponse.json({ message }, { status })
  }
}
