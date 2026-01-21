import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const pool = getPool()
    
    // Get ratings table structure
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'tes_tour' AND TABLE_NAME = 'ratings'
      ORDER BY ORDINAL_POSITION
    `)
    
    // Get a sample booking with tour guide and driver
    const [bookings] = await pool.query(`
      SELECT b.booking_id, b.user_id, b.tour_guide_id, b.driver_id, b.status
      FROM bookings b
      WHERE b.status = 'completed'
      LIMIT 5
    `)
    
    // Get existing ratings
    const [ratings] = await pool.query(`
      SELECT * FROM ratings LIMIT 5
    `)
    
    return NextResponse.json({
      success: true,
      ratings_table_columns: columns,
      sample_completed_bookings: bookings,
      existing_ratings: ratings
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

