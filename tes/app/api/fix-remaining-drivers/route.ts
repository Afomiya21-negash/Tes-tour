import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const pool = getPool()
    
    // Update the remaining drivers with default ratings
    await pool.execute(`
      UPDATE drivers SET rating = 4.2 WHERE driver_id = 9
    `)
    
    await pool.execute(`
      UPDATE drivers SET rating = 4.1 WHERE driver_id = 10
    `)
    
    // Test the updated ratings
    const [updatedRatings] = await pool.execute(
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
        ) AS average_rating
      FROM users u
      WHERE u.role = 'driver'
      ORDER BY average_rating DESC`
    )
    
    return NextResponse.json({
      success: true,
      message: 'Remaining driver ratings fixed',
      updatedRatings: Array.isArray(updatedRatings) ? updatedRatings : []
    })
  } catch (error) {
    console.error('Error fixing remaining drivers:', error)
    return NextResponse.json(
      { error: 'Failed to fix remaining drivers', details: error.message },
      { status: 500 }
    )
  }
}
