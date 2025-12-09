import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

// GET /api/drivers - Get all available drivers
export async function GET(request: NextRequest) {
  try {
    const pool = getPool()
    
    // Get date filters from query parameters for checking availability
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    let query = `
      SELECT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number AS phone,
        d.picture,
        (
          SELECT COUNT(DISTINCT b.booking_id)
          FROM bookings b
          WHERE b.driver_id = u.user_id
            AND b.status IN ('confirmed', 'completed', 'in-progress')
        ) AS total_trips,
        COALESCE(d.rating, 0) AS average_rating,
        COALESCE(d.total_ratings, 0) AS total_ratings,
        CASE 
          WHEN (
            SELECT COUNT(1)
            FROM bookings b2
            WHERE b2.driver_id = u.user_id
              AND b2.status IN ('confirmed', 'in-progress')
              AND b2.start_date <= CURDATE() AND b2.end_date >= CURDATE()
          ) > 0 THEN 'busy' ELSE 'available' END AS availability
      FROM users u
      LEFT JOIN drivers d ON u.user_id = d.driver_id
      WHERE u.role = 'driver'
    `
    
    const params: any[] = []
    
    //  exclude drivers who are already booked during this period
    if (startDate && endDate) {
      query += `
        AND u.user_id NOT IN (
          SELECT DISTINCT b.driver_id
          FROM bookings b
          WHERE b.driver_id IS NOT NULL
            AND b.status IN ('confirmed', 'in-progress', 'pending')
            AND (
              (b.start_date <= ? AND b.end_date >= ?)
              OR (b.start_date <= ? AND b.end_date >= ?)
              OR (b.start_date >= ? AND b.end_date <= ?)
            )
        )
      `
      params.push(endDate, startDate, startDate, endDate, startDate, endDate)
    }
    
    query += ` ORDER BY average_rating DESC, total_trips DESC`
    
    const [rows] = await pool.execute(query, params)
    
    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    )
  }
}
