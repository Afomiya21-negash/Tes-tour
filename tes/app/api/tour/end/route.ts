import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import { verifyJwt } from '@/lib/auth'

/**
 * POST /api/tour/end
 * End a tour - changes booking status to 'completed'
 * Only tour guides can end tours
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

    // Only tour guides can end tours
    if (payload.role !== 'tourguide') {
      return NextResponse.json({ message: 'Only tour guides can end tours' }, { status: 403 })
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

    if (booking.status === 'completed') {
      return NextResponse.json({ message: 'Tour already completed' }, { status: 400 })
    }

    if (booking.status !== 'in-progress') {
      return NextResponse.json({ message: 'Only in-progress tours can be ended' }, { status: 400 })
    }

    // Update booking status to completed
    await pool.execute(
      `UPDATE bookings 
       SET status = 'completed' 
       WHERE booking_id = ?`,
      [bookingId]
    )

    return NextResponse.json({
      success: true,
      message: 'Tour ended successfully',
      bookingId: bookingId
    })
  } catch (error) {
    console.error('Error ending tour:', error)
    return NextResponse.json(
      { message: 'Failed to end tour' },
      { status: 500 }
    )
  }
}

