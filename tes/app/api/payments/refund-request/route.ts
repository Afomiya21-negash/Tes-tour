import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { Employee } from '@/lib/domain'
import { getPool } from '@/lib/db'

// POST /api/payments/refund-request
// Employee (HR) can request a refund for a booking's completed payment
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value || req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyJwt(token)
    if (!decoded || decoded.role !== 'employee') {
      return NextResponse.json({ error: 'Employee access required' }, { status: 403 })
    }

    // Require HR position (same rule as employee dashboard)
    const isHr = await Employee.isHR(Number(decoded.user_id))
    if (!isHr) {
      return NextResponse.json({ error: 'HR access required' }, { status: 403 })
    }

    const { bookingId } = await req.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    }

    const pool = getPool()

    // Ensure there is a completed payment for this booking
    const [rows] = await pool.query(
      `SELECT p.payment_id, p.status, p.refund_request
       FROM payments p
       WHERE p.booking_id = ?
       LIMIT 1`,
      [bookingId]
    ) as any

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Payment not found for this booking' }, { status: 404 })
    }

    const payment = rows[0]

    if (payment.status !== 'completed') {
      return NextResponse.json(
        { error: 'Only completed payments can be refunded' },
        { status: 400 }
      )
    }

    if (payment.refund_request === 'REFUND_REQUESTED') {
      return NextResponse.json(
        { message: 'Refund already requested', status: 'REFUND_REQUESTED' },
        { status: 200 }
      )
    }

    if (payment.status === 'refunded') {
      return NextResponse.json(
        { message: 'Payment already refunded', status: 'REFUNDED' },
        { status: 200 }
      )
    }

    await pool.query(
      `UPDATE payments
       SET refund_request = 'REFUND_REQUESTED'
       WHERE payment_id = ?`,
      [payment.payment_id]
    )

    return NextResponse.json(
      { message: 'Refund request sent to admin', status: 'REFUND_REQUESTED' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error creating refund request:', error)
    return NextResponse.json(
      { error: 'Failed to create refund request', details: error.message },
      { status: 500 }
    )
  }
}


