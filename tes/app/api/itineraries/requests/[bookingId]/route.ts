import { NextRequest, NextResponse } from 'next/server'
import { ItineraryService } from '@/lib/domain'
import { verifyJwt } from '@/lib/auth'

// GET /api/itineraries/requests/[bookingId] - Get itinerary requests for a booking
export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    // Verify authentication
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const decoded = verifyJwt(token)
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
    
    const bookingId = parseInt(params.bookingId)
    
    if (isNaN(bookingId)) {
      return NextResponse.json(
        { error: 'Invalid booking ID' },
        { status: 400 }
      )
    }
    
    // For customers, verify they own the booking
    if (decoded.role === 'customer') {
      // TODO: Add booking ownership verification
    }
    
    const requests = await ItineraryService.getItineraryRequests(bookingId)
    
    return NextResponse.json(requests)
  } catch (error) {
    console.error('Error fetching itinerary requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch itinerary requests' },
      { status: 500 }
    )
  }
}
