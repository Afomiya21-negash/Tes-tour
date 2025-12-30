import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import { verifyJwt } from '@/lib/auth'

/**
 * POST /api/tour/start
 * Start a tour - changes booking status to 'in-progress'
 * Only tour guides can start tours
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || !payload.user_id) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    // Only tour guides can start tours
    if (payload.role !== 'tourguide') {
      return NextResponse.json({ message: 'Only tour guides can start tours' }, { status: 403 })
    }

    const body = await req.json()
    const { bookingId } = body

    if (!bookingId) {
      return NextResponse.json({ message: 'Booking ID is required' }, { status: 400 })
    }

    const pool = getPool()

    // Verify this tour guide is assigned to this booking
    const [bookingRows] = await pool.execute(
      `SELECT booking_id, tour_guide_id, status 
       FROM bookings 
       WHERE booking_id = ?`,
      [bookingId]
    ) as any

    if (!bookingRows || bookingRows.length === 0) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
    }

    const booking = bookingRows[0]

    if (booking.tour_guide_id !== payload.user_id) {
      return NextResponse.json({ message: 'You are not assigned to this booking' }, { status: 403 })
    }

    if (booking.status === 'in-progress') {
      return NextResponse.json({ message: 'Tour already started' }, { status: 400 })
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json({ message: 'Only confirmed bookings can be started' }, { status: 400 })
    }

    // Update booking status to in-progress
    await pool.execute(
      `UPDATE bookings 
       SET status = 'in-progress' 
       WHERE booking_id = ?`,
      [bookingId]
    )

    return NextResponse.json({
      success: true,
      message: 'Tour started successfully',
      bookingId: bookingId
    })
  } catch (error) {
    console.error('Error starting tour:', error)
    return NextResponse.json(
      { message: 'Failed to start tour' },
      { status: 500 }
    )
  }
}

