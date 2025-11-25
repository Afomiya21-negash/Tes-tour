import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'
import { verifyPayment } from '@/lib/chapa'

export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || payload.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const tx_ref = searchParams.get('tx_ref')
    const booking_id = searchParams.get('booking_id')
    const test_mode = searchParams.get('test_mode') === 'true'

    if (!tx_ref || !booking_id) {
      return NextResponse.json({ error: 'tx_ref and booking_id are required' }, { status: 400 })
    }

    console.log('Payment verification request:', { tx_ref, booking_id, test_mode })

    const pool = getPool()

    let paymentSuccess = false
    let paymentDetails: any = {}

    if (test_mode) {
      // Test mode - skip Chapa verification
      console.log('Test mode: Auto-approving payment')
      paymentSuccess = true
      
      // Get payment details from database
      const [paymentRows] = await pool.query(
        `SELECT p.amount, p.payment_method, b.total_price
         FROM payments p
         JOIN bookings b ON p.booking_id = b.booking_id
         WHERE p.transaction_id = ? AND p.booking_id = ?`,
        [tx_ref, booking_id]
      ) as any
      
      if (paymentRows && paymentRows.length > 0) {
        paymentDetails = {
          amount: paymentRows[0].amount || paymentRows[0].total_price,
          currency: 'ETB',
          method: paymentRows[0].payment_method || 'test',
          reference: tx_ref,
          tx_ref: tx_ref,
        }
      }
    } else {
      // Production mode - verify with Chapa
      console.log('Production mode: Verifying with Chapa...')
      const chapaResponse = await verifyPayment(tx_ref)

      if (chapaResponse.status !== 'success' || chapaResponse.data.status !== 'success') {
        return NextResponse.json({
          success: false,
          status: chapaResponse.data.status,
          message: 'Payment verification failed'
        }, { status: 400 })
      }
      
      paymentSuccess = true
      paymentDetails = {
        amount: chapaResponse.data.amount,
        currency: chapaResponse.data.currency,
        method: chapaResponse.data.method,
        reference: chapaResponse.data.reference,
        tx_ref: chapaResponse.data.tx_ref,
      }
    }

    // Update payment record in database - keep original payment_method
    console.log('Updating payment status to completed...')
    await pool.query(
      `UPDATE payments 
       SET status = 'completed', 
           payment_date = NOW()
       WHERE transaction_id = ? AND booking_id = ?`,
      [tx_ref, booking_id]
    )

    // Update booking status to confirmed if payment is successful
    await pool.query(
      `UPDATE bookings 
       SET status = 'confirmed' 
       WHERE booking_id = ? AND user_id = ?`,
      [booking_id, payload.user_id]
    )

    console.log('Payment verified and completed successfully')
    
    return NextResponse.json({
      success: true,
      status: 'completed',
      message: 'Payment verified and completed successfully',
      test_mode: test_mode,
      payment_details: paymentDetails
    })

  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to verify payment', 
      details: error.message 
    }, { status: 500 })
  }
}
