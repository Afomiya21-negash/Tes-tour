import { NextRequest, NextResponse } from 'next/server'
import { ItineraryService } from '@/lib/domain'

// GET /api/itineraries/tour/[tourId] - Get default tour itinerary
export async function GET(
  request: NextRequest,
  { params }: { params: { tourId: string } }
) {
  try {
    const tourId = parseInt(params.tourId)
    
    if (isNaN(tourId)) {
      return NextResponse.json(
        { error: 'Invalid tour ID' },
        { status: 400 }
      )
    }
    
    const itinerary = await ItineraryService.getTourItinerary(tourId)
    
    return NextResponse.json(itinerary)
  } catch (error) {
    console.error('Error fetching tour itinerary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tour itinerary' },
      { status: 500 }
    )
  }
}
