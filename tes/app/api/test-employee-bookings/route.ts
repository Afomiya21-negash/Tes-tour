import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

// Test endpoint to check employee bookings without authentication
export async function GET(request: NextRequest) {
  try {
    const pool = getPool()
    const [rows] = await pool.execute(
      `SELECT 
        b.booking_id,
        b.start_date,
        b.end_date,
        b.total_price,
        b.booking_date,
        b.status,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email,
        u.phone_number as customer_phone,
        t.name as tour_name,
        t.destination,
        t.duration_days,
        v.make as vehicle_make,
        v.model as vehicle_model,
        v.capacity as vehicle_capacity
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.user_id
      LEFT JOIN tours t ON b.tour_id = t.tour_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      ORDER BY b.booking_date DESC`
    )
    
    return NextResponse.json({
      success: true,
      count: Array.isArray(rows) ? rows.length : 0,
      data: Array.isArray(rows) ? rows : []
    })
  } catch (error) {
    console.error('Error fetching employee bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings', details: error.message },
      { status: 500 }
    )
  }
}
