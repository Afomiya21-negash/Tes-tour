import { NextRequest, NextResponse } from 'next/server'
import { VehicleService } from '@/lib/domain'

export async function GET(req: NextRequest) {
  try {
    const vehicles = await VehicleService.getAvailableVehicles()
    return NextResponse.json(vehicles)
  } catch (e) {
    console.error('Error fetching vehicles:', e)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
