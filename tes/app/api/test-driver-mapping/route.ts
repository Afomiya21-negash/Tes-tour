import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const pool = getPool()
    
    // Check the relationship between users and drivers tables
    const [mappingRows] = await pool.execute(
      `SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.role,
        d.driver_id,
        d.rating as driver_rating,
        d.license_number
      FROM users u
      LEFT JOIN drivers d ON u.user_id = d.driver_id
      WHERE u.role = 'driver'
      ORDER BY u.user_id`
    )
    
    return NextResponse.json({
      mapping: Array.isArray(mappingRows) ? mappingRows : []
    })
  } catch (error) {
    console.error('Error testing driver mapping:', error)
    return NextResponse.json(
      { error: 'Failed to test driver mapping', details: error.message },
      { status: 500 }
    )
  }
}
