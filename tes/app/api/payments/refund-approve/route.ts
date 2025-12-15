import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

// POST /api/payments/refund-approve
// Admin approves a refund request and marks payment as refunded
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value || req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyJwt(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { paymentId } = await req.json()

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId is required' }, { status: 400 })
    }

    const pool = getPool()
    const conn = await pool.getConnection()

    try {
      await conn.beginTransaction()

      const [rows] = await conn.query(
        `SELECT payment_id, status, refund_request, booking_id
         FROM payments
         WHERE payment_id = ?
         LIMIT 1`,
        [paymentId]
      ) as any

      if (!rows || rows.length === 0) {
        await conn.rollback()
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
      }

      const payment = rows[0]

      if (payment.status !== 'completed') {
        await conn.rollback()
        return NextResponse.json(
          { error: 'Only completed payments can be refunded' },
          { status: 400 }
        )
      }

      if (payment.refund_request !== 'REFUND_REQUESTED') {
        await conn.rollback()
        return NextResponse.json(
          { error: 'No pending refund request for this payment' },
          { status: 400 }
        )
      }

      await conn.query(
        `UPDATE payments
         SET status = 'refunded',
             refund_request = 'APPROVED'
         WHERE payment_id = ?`,
        [payment.payment_id]
      )

      // Optionally, mark booking as cancelled to reflect that tour won't happen
      await conn.query(
        `UPDATE bookings
         SET status = 'cancelled'
         WHERE booking_id = ?`,
        [payment.booking_id]
      )

      await conn.commit()

      return NextResponse.json({
        message: 'Refund approved and payment marked as refunded',
        status: 'REFUNDED',
      })
    } catch (error) {
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }
  } catch (error: any) {
    console.error('Error approving refund:', error)
    return NextResponse.json(
      { error: 'Failed to approve refund', details: error.message },
      { status: 500 }
    )
  }
}


