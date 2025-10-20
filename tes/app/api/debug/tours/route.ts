import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

// GET /api/debug/tours - Debug tours data
export async function GET(request: NextRequest) {
  try {
    const pool = getPool()
    
    // Get all tours
    const [tours] = await pool.execute(
      'SELECT tour_id, name, destination, availability FROM tours ORDER BY tour_id'
    ) as any
    
    // Get recent bookings with tour info
    const [bookings] = await pool.execute(
      `SELECT 
        b.booking_id,
        b.tour_id,
        b.user_id,
        b.start_date,
        b.end_date,
        b.status,
        t.name as tour_name,
        t.destination,
        u.first_name,
        u.last_name
      FROM bookings b
      LEFT JOIN tours t ON b.tour_id = t.tour_id
      LEFT JOIN users u ON b.user_id = u.user_id
      ORDER BY b.booking_date DESC
      LIMIT 10`
    ) as any
    
    return NextResponse.json({
      tours: Array.isArray(tours) ? tours : [],
      recentBookings: Array.isArray(bookings) ? bookings : [],
      totalTours: Array.isArray(tours) ? tours.length : 0,
      totalBookings: Array.isArray(bookings) ? bookings.length : 0
    })
  } catch (error) {
    console.error('Error debugging tours:', error)
    return NextResponse.json(
      { error: 'Failed to debug tours', details: String(error) },
      { status: 500 }
    )
  }
}
