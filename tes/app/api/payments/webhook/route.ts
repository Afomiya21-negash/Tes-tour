import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

/**
 * Chapa Webhook Handler
 * This endpoint receives payment notifications from Chapa
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    console.log('Chapa webhook received:', body)

    // Verify webhook signature (recommended)
    const signature = req.headers.get('chapa-signature')
    // TODO: Implement signature verification using your webhook secret
    
    const { tx_ref, status, reference, charge, amount, currency, first_name, last_name, email } = body

    if (!tx_ref) {
      return NextResponse.json({ error: 'tx_ref is required' }, { status: 400 })
    }

    const pool = getPool()

    // Get payment record
    const [paymentRows] = await pool.query(
      `SELECT p.payment_id, p.booking_id, p.status as payment_status, b.user_id as customer_id
       FROM payments p
       JOIN bookings b ON p.booking_id = b.booking_id
       WHERE p.transaction_id = ?`,
      [tx_ref]
    ) as any

    if (!paymentRows || paymentRows.length === 0) {
      console.error('Payment record not found for tx_ref:', tx_ref)
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const payment = paymentRows[0]

    // Only process if status is pending
    if (payment.payment_status === 'completed') {
      console.log('Payment already completed:', tx_ref)
      return NextResponse.json({ message: 'Payment already processed' })
    }

    // Update payment status based on webhook data
    if (status === 'success') {
      await pool.query(
        `UPDATE payments 
         SET status = 'completed', 
             payment_date = NOW()
         WHERE transaction_id = ?`,
        [tx_ref]
      )

      // Update booking status to confirmed
      await pool.query(
        `UPDATE bookings 
         SET status = 'confirmed' 
         WHERE booking_id = ?`,
        [payment.booking_id]
      )

      console.log('Payment completed via webhook:', tx_ref)
    } else if (status === 'failed') {
      await pool.query(
        `UPDATE payments 
         SET status = 'failed' 
         WHERE transaction_id = ?`,
        [tx_ref]
      )

      console.log('Payment failed via webhook:', tx_ref)
    }

    return NextResponse.json({ 
      message: 'Webhook processed successfully',
      tx_ref: tx_ref,
      status: status
    })

  } catch (error: any) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ 
      error: 'Failed to process webhook', 
      details: error.message 
    }, { status: 500 })
  }
}
