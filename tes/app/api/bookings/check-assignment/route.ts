import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

// GET /api/bookings/check-assignment?booking_id=X
// Check if current user is still assigned to this booking
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const decoded = verifyJwt(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = Number(decoded.user_id)
    const role = decoded.role
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('booking_id')

    if (!bookingId) {
      return NextResponse.json({ error: 'booking_id is required' }, { status: 400 })
    }

    const pool = getPool()

    // Get booking details
    const [bookingRows] = await pool.execute(
      `SELECT 
        b.booking_id,
        b.tour_guide_id,
        b.driver_id,
        b.status,
        cr.request_id,
        cr.current_tour_guide_id,
        cr.current_driver_id,
        cr.status as change_status,
        cr.created_at as change_requested_at
      FROM bookings b
      LEFT JOIN change_requests cr ON b.booking_id = cr.booking_id 
        AND cr.status = 'completed'
        AND (cr.current_tour_guide_id = ? OR cr.current_driver_id = ?)
      WHERE b.booking_id = ?`,
      [userId, userId, bookingId]
    ) as any

    if (!bookingRows || bookingRows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const booking = bookingRows[0]

    // Check if user was replaced
    let wasReplaced = false
    let replacementInfo = null

    if (role === 'tourguide') {
      // Check if current tour guide is different from this user
      if (booking.current_tour_guide_id === userId && booking.tour_guide_id !== userId) {
        wasReplaced = true
        replacementInfo = {
          role: 'tour guide',
          requestedAt: booking.change_requested_at,
          message: 'The customer has requested a change and you have been replaced as the tour guide for this booking.'
        }
      } else if (booking.tour_guide_id !== userId) {
        // User was never assigned or doesn't have access
        return NextResponse.json({ 
          error: 'You are not assigned to this booking',
          isAssigned: false 
        }, { status: 403 })
      }
    } else if (role === 'driver') {
      // Check if current driver is different from this user
      if (booking.current_driver_id === userId && booking.driver_id !== userId) {
        wasReplaced = true
        replacementInfo = {
          role: 'driver',
          requestedAt: booking.change_requested_at,
          message: 'The customer has requested a change and you have been replaced as the driver for this booking.'
        }
      } else if (booking.driver_id !== userId) {
        // User was never assigned or doesn't have access
        return NextResponse.json({ 
          error: 'You are not assigned to this booking',
          isAssigned: false 
        }, { status: 403 })
      }
    }

    return NextResponse.json({
      isAssigned: !wasReplaced,
      wasReplaced,
      replacementInfo,
      bookingStatus: booking.status
    })

  } catch (error) {
    console.error('Error checking booking assignment:', error)
    return NextResponse.json({ error: 'Failed to check assignment' }, { status: 500 })
  }
}
