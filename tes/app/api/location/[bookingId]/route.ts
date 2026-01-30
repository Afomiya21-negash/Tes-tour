import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { LocationTrackingService } from '@/lib/location-tracking'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || !payload.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId: bookingIdParam } = await params
    const bookingId = parseInt(bookingIdParam)
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 })
    }

    const participants = await LocationTrackingService.getBookingLocations(
      bookingId,
      payload.user_id
    )

    return NextResponse.json({
      success: true,
      booking_id: bookingId,
      participants
    })
  } catch (error: any) {
    console.error('Error fetching locations:', error)
    
    if (error.message.includes('not authorized') || error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch locations' },
      { status: 500 }
    )
  }
}
