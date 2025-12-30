import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import { verifyJwt } from '@/lib/auth'

/**
 * GET /api/location/track/[bookingId]
 * Get tour guide's current location for a booking
 * Used by RouteTrackingMap component
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

    // Get booking details
    const [bookingRows] = await pool.execute(
      `SELECT 
        b.booking_id,
        b.user_id,
        b.tour_guide_id,
        b.status
       FROM bookings b
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

    // Get latest location for tour guide
    const [locationRows] = await pool.execute(
      `SELECT 
        lt.latitude,
        lt.longitude,
        lt.accuracy,
        lt.heading,
        lt.speed,
        lt.timestamp
       FROM location_tracking lt
       WHERE lt.user_id = ? 
         AND lt.booking_id = ?
       ORDER BY lt.timestamp DESC
       LIMIT 1`,
      [booking.tour_guide_id, bookingId]
    ) as any

    if (!locationRows || locationRows.length === 0) {
      // No location data yet
      return NextResponse.json({
        success: true,
        tourGuide: null,
        message: 'Tour guide has not started sharing location yet'
      })
    }

    const location = locationRows[0]

    return NextResponse.json({
      success: true,
      tourGuide: {
        location: {
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          accuracy: location.accuracy ? parseFloat(location.accuracy) : null,
          heading: location.heading ? parseFloat(location.heading) : null,
          speed: location.speed ? parseFloat(location.speed) : null,
          timestamp: location.timestamp
        }
      }
    })
  } catch (error) {
    console.error('Error fetching location:', error)
    return NextResponse.json(
      { message: 'Failed to fetch location' },
      { status: 500 }
    )
  }
}

