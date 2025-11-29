import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { LocationTrackingService } from '@/lib/domain'

export async function GET(
  req: NextRequest,
  { params }: { params: { bookingId: string; userId: string } }
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

    const bookingId = parseInt(params.bookingId)
    const userId = parseInt(params.userId)
    
    if (isNaN(bookingId) || isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    // Get limit from query params (default 50, max 200)
    const url = new URL(req.url)
    const limitParam = url.searchParams.get('limit')
    let limit = 50
    if (limitParam) {
      limit = Math.min(parseInt(limitParam), 200)
    }

    const history = await LocationTrackingService.getLocationHistory(
      bookingId,
      userId,
      limit
    )

    return NextResponse.json({
      success: true,
      booking_id: bookingId,
      user_id: userId,
      history
    })
  } catch (error: any) {
    console.error('Error fetching location history:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch location history' },
      { status: 500 }
    )
  }
}
