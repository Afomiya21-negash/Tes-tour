import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

// GET /api/drivers - Get all available drivers
export async function GET(request: NextRequest) {
  try {
    const pool = getPool()
    
    // Get drivers with their average ratings and total trips
    const [rows] = await pool.execute(
      `SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        COUNT(DISTINCT b.booking_id) as total_trips,
        COALESCE(AVG(r.rating), 0) as average_rating,
        CASE 
          WHEN COUNT(CASE WHEN b.status IN ('confirmed', 'in-progress') AND b.start_date <= CURDATE() AND b.end_date >= CURDATE() THEN 1 END) > 0 
          THEN 'busy' 
          ELSE 'available' 
        END as availability
      FROM users u
      LEFT JOIN bookings b ON u.user_id = b.driver_id AND b.status IN ('confirmed', 'completed', 'in-progress')
      LEFT JOIN ratings r ON u.user_id = r.rated_user_id AND r.rating_type = 'driver'
      WHERE u.role = 'driver'
      GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.phone
      ORDER BY average_rating DESC, total_trips DESC`
    )
    
    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    )
  }
}
