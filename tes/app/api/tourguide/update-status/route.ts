import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || payload.role !== 'tourguide') {
      return NextResponse.json({ error: 'Forbidden - Tour guide access required' }, { status: 403 })
    }

    const { booking_id, status } = await req.json()

    if (!booking_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['confirmed', 'in-progress', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const pool = getPool()

    // Verify this booking is assigned to the logged-in tour guide
    const [bookings] = await pool.query(
      `SELECT b.booking_id, b.tour_guide_id
       FROM bookings b
       WHERE b.booking_id = ? AND b.tour_guide_id = ?`,
      [booking_id, payload.user_id]
    ) as any

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ error: 'Booking not found or not assigned to you' }, { status: 404 })
    }

    // Update booking status
    await pool.query(
      'UPDATE bookings SET status = ? WHERE booking_id = ?',
      [status, booking_id]
    )

    return NextResponse.json({ 
      success: true, 
      message: `Tour ${status === 'in-progress' ? 'started' : status === 'completed' ? 'finished' : 'updated'} successfully`,
      booking_id,
      status
    })

  } catch (error: any) {
    console.error('Error updating tour status:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}
