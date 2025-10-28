import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const pool = getPool()
    const [rows] = await pool.execute(
      `SELECT
        u.user_id,
        u.username,
        u.email,
        u.role,
        u.first_name,
        u.last_name,
        u.phone_number,
        u.registration_date as created_at,
        COUNT(b.booking_id) as bookings_count,
        GROUP_CONCAT(b.id_picture SEPARATOR '|||') as id_pictures
      FROM users u
      LEFT JOIN bookings b ON u.user_id = b.user_id AND b.id_picture IS NOT NULL AND b.id_picture != ''
      WHERE u.role = 'customer'
      GROUP BY u.user_id, u.username, u.email, u.role, u.first_name, u.last_name, u.phone_number, u.registration_date
      ORDER BY u.user_id DESC`
    )

    const users = Array.isArray(rows) ? rows.map((user: any) => ({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      created_at: user.created_at,
      bookings_count: user.bookings_count || 0,
      id_pictures: user.id_pictures ? user.id_pictures.split('|||').filter((pic: string) => pic && pic.trim() !== '').map((pic: string) => {
        try {
          return JSON.parse(pic)
        } catch {
          return []
        }
      }).flat().filter((pic: string) => pic && pic.trim() !== '') : null
    })) : []

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users
    })

  } catch (error) {
    console.error('List users error:', error)
    return NextResponse.json(
      { error: 'Server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
