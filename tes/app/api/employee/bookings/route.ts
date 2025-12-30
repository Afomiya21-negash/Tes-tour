import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

// GET /api/employee/bookings - Get all bookings for employee dashboard
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const decoded = verifyJwt(token)
    if (!decoded || !['employee', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Employee or admin access required' },
        { status: 403 }
      )
    }

    // Allow both employees and admins to access bookings
  
    
    const pool = getPool()
    const [rows] = await pool.execute(
      `SELECT
        b.booking_id,
        b.start_date,
        b.end_date,
        b.total_price,
        b.booking_date,
        b.status,
        b.number_of_people,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email,
        u.phone_number as customer_phone,
        t.name as tour_name,
        t.destination,
        t.duration_days,
        v.make as vehicle_make,
        v.model as vehicle_model,
        v.capacity as vehicle_capacity,
        d.first_name as driver_first_name,
        d.last_name as driver_last_name,
        d.email as driver_email,
        tg.first_name as tour_guide_first_name,
        tg.last_name as tour_guide_last_name,
        tg.email as tour_guide_email,
        p.status as payment_status,
        p.amount as payment_amount,
        p.refund_request as payment_refund_request,
        b.booking_date
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.user_id
      LEFT JOIN tours t ON b.tour_id = t.tour_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      LEFT JOIN users d ON b.driver_id = d.user_id
      LEFT JOIN users tg ON b.tour_guide_id = tg.user_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      ORDER BY b.booking_date DESC`
    )
    
    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error('Error fetching employee bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
