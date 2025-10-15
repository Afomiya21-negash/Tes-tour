import { NextRequest, NextResponse } from 'next/server'
import { TourService } from '@/lib/domain'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tourId = parseInt(params.id)
    if (isNaN(tourId)) {
      return NextResponse.json({ message: 'Invalid tour ID' }, { status: 400 })
    }
    
    const tour = await TourService.getTourById(tourId)
    if (!tour) {
      return NextResponse.json({ message: 'Tour not found' }, { status: 404 })
    }
    
    return NextResponse.json(tour)
  } catch (e) {
    console.error('Error fetching tour:', e)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
