import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { Employee } from '@/lib/domain'
import { getPool } from '@/lib/db'

// POST /api/employee/assign-tourguide - Assign tour guide to a booking
export async function POST(request: NextRequest) {
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
    
    const { bookingId, tourGuideId } = await request.json()
    
    if (!bookingId || !tourGuideId) {
      return NextResponse.json(
        { error: 'Missing bookingId or tourGuideId' },
        { status: 400 }
      )
    }
    
    const pool = getPool()
    const conn = await pool.getConnection()
    
    try {
      await conn.beginTransaction()
      
      // Verify booking exists
      const [bookingRows] = await conn.query(
        'SELECT booking_id, tour_id, user_id FROM bookings WHERE booking_id = ? LIMIT 1',
        [bookingId]
      ) as any

      if (!bookingRows || bookingRows.length === 0) {
        return NextResponse.json(
          { error: 'Booking not found' },
          { status: 404 }
        )
      }

      const booking = bookingRows[0]

      // Verify tour guide exists and is available
      const [guideRows] = await conn.query(
        'SELECT user_id FROM users WHERE user_id = ? AND role = "tourguide" LIMIT 1',
        [tourGuideId]
      ) as any

      if (!guideRows || guideRows.length === 0) {
        return NextResponse.json(
          { error: 'Tour guide not found' },
          { status: 404 }
        )
      }

      // Check if tour guide is already assigned to another booking on the same dates
      const [conflictRows] = await conn.query(
        `SELECT booking_id FROM bookings
         WHERE tour_guide_id = ?
         AND booking_id != ?
         AND status IN ('confirmed', 'in-progress')
         AND (
           (start_date <= (SELECT start_date FROM bookings WHERE booking_id = ?)
            AND end_date >= (SELECT start_date FROM bookings WHERE booking_id = ?))
           OR
           (start_date <= (SELECT end_date FROM bookings WHERE booking_id = ?)
            AND end_date >= (SELECT end_date FROM bookings WHERE booking_id = ?))
         )`,
        [tourGuideId, bookingId, bookingId, bookingId, bookingId, bookingId]
      ) as any

      if (conflictRows && conflictRows.length > 0) {
        return NextResponse.json(
          { error: 'Tour guide is already assigned to another booking during these dates' },
          { status: 409 }
        )
      }

      // Assign the tour guide to this specific booking
      await conn.query(
        'UPDATE bookings SET tour_guide_id = ? WHERE booking_id = ?',
        [tourGuideId, bookingId]
      )
      
      await conn.commit()
      
      return NextResponse.json(
        { message: 'Tour guide assigned successfully' },
        { status: 200 }
      )
    } catch (error) {
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error('Error assigning tour guide:', error)
    return NextResponse.json(
      { error: 'Failed to assign tour guide' },
      { status: 500 }
    )
  }
}

