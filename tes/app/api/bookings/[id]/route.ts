import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { BookingService } from '@/lib/domain'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    
    const payload = verifyJwt(token)
    if (!payload || !payload.user_id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    const bookingId = parseInt(params.id)
    if (isNaN(bookingId)) {
      return NextResponse.json({ message: 'Invalid booking ID' }, { status: 400 })
    }
    
    // Only customers can see their own bookings, admins/employees can see all
    const userId = payload.role === 'customer' ? payload.user_id : undefined
    
    const booking = await BookingService.getBookingById(bookingId, userId)
    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
    }
    
    return NextResponse.json(booking)
  } catch (e) {
    console.error('Error fetching booking:', e)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
