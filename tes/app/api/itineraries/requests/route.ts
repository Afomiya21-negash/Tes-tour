import { NextRequest, NextResponse } from 'next/server'
import { ItineraryService } from '@/lib/domain'
import { verifyJwt } from '@/lib/auth'

// POST /api/itineraries/requests - Submit itinerary modification request
export async function POST(request: NextRequest) {
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
    if (!decoded || decoded.role !== 'customer') {
      return NextResponse.json(
        { error: 'Customer access required' },
        { status: 403 }
      )
    }
    
    const {
      bookingId,
      requestType,
      requestedChanges,
      dayNumber,
      reason
    } = await request.json()
    
    // Validate required fields
    if (!bookingId || !requestType || !requestedChanges) {
      return NextResponse.json(
        { error: 'Missing required fields: bookingId, requestType, requestedChanges' },
        { status: 400 }
      )
    }
    
    // Validate request type
    if (!['modification', 'addition', 'removal'].includes(requestType)) {
      return NextResponse.json(
        { error: 'Invalid request type. Must be: modification, addition, or removal' },
        { status: 400 }
      )
    }
    
    const requestId = await ItineraryService.submitItineraryRequest(
      bookingId,
      decoded.userId,
      requestType,
      requestedChanges,
      dayNumber,
      reason
    )
    
    return NextResponse.json(
      { 
        message: 'Itinerary modification request submitted successfully',
        requestId 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error submitting itinerary request:', error)
    return NextResponse.json(
      { error: 'Failed to submit itinerary request' },
      { status: 500 }
    )
  }
}
