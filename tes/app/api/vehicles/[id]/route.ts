import { NextRequest, NextResponse } from 'next/server'
import { VehicleService } from '@/lib/domain'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicleId = parseInt(params.id)
    if (isNaN(vehicleId)) {
      return NextResponse.json({ message: 'Invalid vehicle ID' }, { status: 400 })
    }
    
    const vehicle = await VehicleService.getVehicleById(vehicleId)
    if (!vehicle) {
      return NextResponse.json({ message: 'Vehicle not found' }, { status: 404 })
    }
    
    return NextResponse.json(vehicle)
  } catch (e) {
    console.error('Error fetching vehicle:', e)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
