import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { PaymentService, BookingService } from '@/lib/domain'

export async function GET(req: NextRequest, { params }: { params: { bookingId: string } }) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    
    const payload = verifyJwt(token)
    if (!payload || !payload.user_id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    const bookingId = parseInt(params.bookingId)
    if (isNaN(bookingId)) {
      return NextResponse.json({ message: 'Invalid booking ID' }, { status: 400 })
    }
    
    // Verify the booking belongs to the user (for customers)
    if (payload.role === 'customer') {
      const booking = await BookingService.getBookingById(bookingId, payload.user_id)
      if (!booking) {
        return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
      }
    }
    
    const payment = await PaymentService.getPaymentByBookingId(bookingId)
    if (!payment) {
      return NextResponse.json({ message: 'Payment not found' }, { status: 404 })
    }
    
    return NextResponse.json(payment)
  } catch (e) {
    console.error('Error fetching payment:', e)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
