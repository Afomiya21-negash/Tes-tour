import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const pool = getPool()
    
    // Check ratings table
    const [ratingsRows] = await pool.execute('SELECT * FROM ratings LIMIT 10')
    
    // Check drivers table for default ratings
    const [driversRows] = await pool.execute('SELECT driver_id, rating FROM drivers')
    
    // Check users with driver role
    const [usersRows] = await pool.execute('SELECT user_id, first_name, last_name, role FROM users WHERE role = "driver"')
    
    // Test the driver rating query
    const [driverRatingsRows] = await pool.execute(
      `SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        COALESCE(
          (
            SELECT AVG(r.rating)
            FROM ratings r
            WHERE r.rated_user_id = u.user_id AND LOWER(r.rating_type) = 'driver'
          ),
          (
            SELECT d.rating FROM drivers d WHERE d.driver_id = u.user_id LIMIT 1
          ),
          0
        ) AS average_rating,
        (
          SELECT COUNT(*)
          FROM ratings r
          WHERE r.rated_user_id = u.user_id AND LOWER(r.rating_type) = 'driver'
        ) AS rating_count
      FROM users u
      WHERE u.role = 'driver'`
    )
    
    return NextResponse.json({
      ratings: Array.isArray(ratingsRows) ? ratingsRows : [],
      drivers: Array.isArray(driversRows) ? driversRows : [],
      users: Array.isArray(usersRows) ? usersRows : [],
      driverRatings: Array.isArray(driverRatingsRows) ? driverRatingsRows : []
    })
  } catch (error) {
    console.error('Error testing ratings:', error)
    return NextResponse.json(
      { error: 'Failed to test ratings', details: error.message },
      { status: 500 }
    )
  }
}
