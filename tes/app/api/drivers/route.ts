import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

// GET /api/drivers - Get all available drivers
export async function GET(request: NextRequest) {
  try {
    const pool = getPool()
    
    // Get drivers with robust aggregates using subqueries to avoid JOIN multiplication
    const [rows] = await pool.execute(
      `SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number AS phone,
        d.picture,
        (
          SELECT COUNT(DISTINCT b.booking_id)
          FROM Bookings b
          JOIN Vehicles vv ON b.vehicle_id = vv.vehicle_id
          WHERE vv.driver_id = u.user_id
            AND b.status IN ('confirmed', 'completed', 'in-progress')
        ) AS total_trips,
        COALESCE(
          (
            SELECT AVG(r.rating)
            FROM ratings r
            WHERE r.rated_user_id = u.user_id AND LOWER(r.rating_type) = 'driver'
          ),
          (
            SELECT d.rating FROM Drivers d WHERE d.driver_id = u.user_id LIMIT 1
          ),
          0
        ) AS average_rating,
        CASE 
          WHEN (
            SELECT COUNT(1)
            FROM Bookings b2
            JOIN Vehicles v2 ON b2.vehicle_id = v2.vehicle_id
            WHERE v2.driver_id = u.user_id
              AND b2.status IN ('confirmed', 'in-progress')
              AND b2.start_date <= CURDATE() AND b2.end_date >= CURDATE()
          ) > 0 THEN 'busy' ELSE 'available' END AS availability
      FROM Users u
      LEFT JOIN drivers d ON u.user_id = d.driver_id
      WHERE u.role = 'driver'
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
