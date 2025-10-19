import { NextRequest, NextResponse } from 'next/server'
import { ItineraryService } from '@/lib/domain'
import { verifyJwt } from '@/lib/auth'

// GET /api/itineraries/booking/[bookingId] - Get custom itinerary for a booking
export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
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
    
    const customItinerary = await ItineraryService.getCustomItinerary(bookingId)
    
    return NextResponse.json(customItinerary)
  } catch (error) {
    console.error('Error fetching custom itinerary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch custom itinerary' },
      { status: 500 }
    )
  }
}

// POST /api/itineraries/booking/[bookingId] - Create custom itinerary from tour default
export async function POST(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
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
    
    const { tourId } = await request.json()
    
    if (!tourId) {
      return NextResponse.json(
        { error: 'Tour ID is required' },
        { status: 400 }
      )
    }
    
    await ItineraryService.createCustomItineraryFromTour(bookingId, tourId)
    
    return NextResponse.json(
      { message: 'Custom itinerary created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating custom itinerary:', error)
    return NextResponse.json(
      { error: 'Failed to create custom itinerary' },
      { status: 500 }
    )
  }
}
