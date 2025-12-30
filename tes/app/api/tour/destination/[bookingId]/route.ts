import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import { verifyJwt } from '@/lib/auth'

/**
 * GET /api/tour/destination/[bookingId]
 * Get destination coordinates for a booking
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || !payload.user_id) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
    }

    // Await params in Next.js 15
    const { bookingId: bookingIdStr } = await params
    const bookingId = parseInt(bookingIdStr)
    if (isNaN(bookingId)) {
      return NextResponse.json({ message: 'Invalid booking ID' }, { status: 400 })
    }

    const pool = getPool()

    // Get booking with tour destination (use 'name' not 'tour_name')
    const [bookingRows] = await pool.execute(
      `SELECT
        b.booking_id,
        b.user_id,
        b.tour_guide_id,
        b.status,
        t.name as tour_name,
        t.destination,
        t.latitude,
        t.longitude
       FROM bookings b
       LEFT JOIN tours t ON b.tour_id = t.tour_id
       WHERE b.booking_id = ?`,
      [bookingId]
    ) as any

    if (!bookingRows || bookingRows.length === 0) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
    }

    const booking = bookingRows[0]

    // Verify user has access to this booking
    if (booking.user_id !== payload.user_id && booking.tour_guide_id !== payload.user_id) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      destination: {
        name: booking.destination,
        tourName: booking.tour_name,
        coordinates: booking.latitude && booking.longitude ? {
          latitude: parseFloat(booking.latitude),
          longitude: parseFloat(booking.longitude)
        } : null
      }
    })
  } catch (error) {
    console.error('Error fetching destination:', error)
    return NextResponse.json(
      { message: 'Failed to fetch destination' },
      { status: 500 }
    )
  }
}

