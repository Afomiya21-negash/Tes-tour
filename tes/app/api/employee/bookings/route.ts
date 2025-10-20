import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { Employee } from '@/lib/domain'
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
    if (!decoded || decoded.role !== 'employee') {
      return NextResponse.json(
        { error: 'Employee access required' },
        { status: 403 }
      )
    }

    // Require HR position for access to employee dashboard
    const isHr = await Employee.isHR(Number(decoded.user_id))
    if (!isHr) {
      return NextResponse.json({ error: 'HR access required' }, { status: 403 })
    }
    
    const pool = getPool()
    // Try with all columns first, fallback if columns don't exist
    let rows: any
    try {
      [rows] = await pool.execute(
        `SELECT
          b.booking_id,
          b.start_date,
          b.end_date,
          b.total_price,
          b.booking_date,
          b.status,
          b.number_of_people,
          b.special_requests,
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
          tg.first_name as tour_guide_first_name,
          tg.last_name as tour_guide_last_name,
          d.first_name as driver_first_name,
          d.last_name as driver_last_name,
          p.status as payment_status
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.user_id
        LEFT JOIN tours t ON b.tour_id = t.tour_id
        LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
        LEFT JOIN users tg ON t.tour_guide_id = tg.user_id
        LEFT JOIN users d ON v.driver_id = d.user_id
        LEFT JOIN payments p ON b.booking_id = p.booking_id
        ORDER BY b.booking_date DESC`
      )
    } catch (e: any) {
      // Fallback query without optional columns
      if (e.message?.includes('number_of_people') || e.message?.includes('special_requests')) {
        [rows] = await pool.execute(
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
            v.capacity as vehicle_capacity,
            tg.first_name as tour_guide_first_name,
            tg.last_name as tour_guide_last_name,
            d.first_name as driver_first_name,
            d.last_name as driver_last_name,
            p.status as payment_status
          FROM bookings b
          LEFT JOIN users u ON b.user_id = u.user_id
          LEFT JOIN tours t ON b.tour_id = t.tour_id
          LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
          LEFT JOIN users tg ON t.tour_guide_id = tg.user_id
          LEFT JOIN users d ON v.driver_id = d.user_id
          LEFT JOIN payments p ON b.booking_id = p.booking_id
          ORDER BY b.booking_date DESC`
        )
      } else {
        throw e
      }
    }
    
    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error('Error fetching employee bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}
