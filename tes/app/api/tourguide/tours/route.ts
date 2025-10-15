import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

// GET /api/tourguide/tours - Get assigned tours for logged-in tour guide
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || !payload.user_id || payload.role !== 'tourguide') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pool = getPool()
    
    // Get tours assigned to this tour guide
    const [rows] = await pool.execute(
      `SELECT 
        b.booking_id,
        b.start_date,
        b.end_date,
        b.status,
        b.number_of_people,
        b.special_requests,
        b.booking_date,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email,
        u.phone as customer_phone,
        t.name as tour_name,
        t.destination,
        t.duration_days,
        v.make as vehicle_make,
        v.model as vehicle_model,
        d.first_name as driver_first_name,
        d.last_name as driver_last_name,
        d.phone as driver_phone
      FROM bookings b
      LEFT JOIN users u ON b.customer_id = u.user_id
      LEFT JOIN tours t ON b.tour_id = t.tour_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      LEFT JOIN users d ON b.driver_id = d.user_id
      WHERE b.tour_guide_id = ?
      ORDER BY b.start_date ASC`,
      [payload.user_id]
    )
    
    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error('Error fetching tour guide tours:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tours' },
      { status: 500 }
    )
  }
}
