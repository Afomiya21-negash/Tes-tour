import { NextRequest, NextResponse } from 'next/server'
import { TourService } from '@/lib/domain'

export async function GET(req: NextRequest) {
  try {
    const tours = await TourService.getAllToursWithPromotions()
    return NextResponse.json(tours)
  } catch (e) {
    console.error('Error fetching tours:', e)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
