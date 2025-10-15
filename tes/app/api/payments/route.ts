import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { PaymentService, BookingService } from '@/lib/domain'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    
    const payload = verifyJwt(token)
    if (!payload || !payload.user_id || payload.role !== 'customer') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await req.json()
    const { bookingId, amount, paymentMethod, transactionId } = body || {}
    
    if (!bookingId || !amount || !paymentMethod) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }
    
    // Verify the booking belongs to the user
    const booking = await BookingService.getBookingById(bookingId, payload.user_id)
    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 })
    }
    
    const payment = await PaymentService.createPayment({
      bookingId,
      amount,
      paymentMethod,
      transactionId
    })
    
    return NextResponse.json(payment, { status: 201 })
  } catch (e: any) {
    console.error('Error creating payment:', e)
    return NextResponse.json({ 
      message: e.message || 'Server error' 
    }, { status: 500 })
  }
}
