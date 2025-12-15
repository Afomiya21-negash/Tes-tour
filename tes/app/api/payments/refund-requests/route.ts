import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

// GET /api/payments/refund-requests
// Admin can view all refund requests
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value || req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyJwt(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const pool = getPool()
    const [rows] = await pool.query(
      `SELECT 
        p.payment_id,
        p.booking_id,
        p.amount,
        p.status as payment_status,
        p.payment_method,
        p.refund_request,
        b.status as booking_status,
        b.start_date,
        b.end_date,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email
       FROM payments p
       JOIN bookings b ON p.booking_id = b.booking_id
       JOIN users u ON b.user_id = u.user_id
       WHERE p.refund_request = 'REFUND_REQUESTED'
       ORDER BY b.start_date DESC`
    ) as any

    return NextResponse.json({ refundRequests: rows || [] })
  } catch (error: any) {
    console.error('Error fetching refund requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch refund requests', details: error.message },
      { status: 500 }
    )
  }
}


