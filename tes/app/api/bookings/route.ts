import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { BookingService } from '@/lib/domain'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    
    const payload = verifyJwt(token)
    if (!payload || !payload.user_id || payload.role !== 'customer') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const {
      tourId,
      vehicleId,
      driverId,
      startDate,
      endDate,
      totalPrice,
      peopleCount,
      specialRequests
    } = body || {}
    
    if (!startDate || !endDate || !totalPrice || !peopleCount) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    
    if (!tourId && !vehicleId) {
      return NextResponse.json({ message: 'Either tour or vehicle must be specified' }, { status: 400 })
    }
    
    const booking = await BookingService.createBooking({
      userId: payload.user_id,
      tourId: tourId || null,
      vehicleId: vehicleId || null,
      driverId: driverId || null,
      startDate,
      endDate,
      totalPrice,
      peopleCount,
      specialRequests
    })
    
    return NextResponse.json(booking, { status: 201 })
  } catch (e: any) {
    console.error('Error creating booking:', e)
    return NextResponse.json({ 
      message: e.message || 'Server error' 
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    
    const payload = verifyJwt(token)
    if (!payload || !payload.user_id || payload.role !== 'customer') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    const bookings = await BookingService.getUserBookings(payload.user_id)
    return NextResponse.json(bookings)
  } catch (e) {
    console.error('Error fetching bookings:', e)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
