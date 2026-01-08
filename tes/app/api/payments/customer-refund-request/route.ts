import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

/**
 * POST /api/payments/customer-refund-request
 * Customer can request a refund within 24 hours of booking
 */
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || !payload.user_id || payload.role !== 'customer') {
      return NextResponse.json({ error: 'Customer access required' }, { status: 403 })
    }

    const { bookingId, reason } = await req.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }

    const pool = getPool()
    const conn = await pool.getConnection()

    try {
      await conn.beginTransaction()

      // Get booking details with payment info
      const [bookingRows] = await conn.query(
        `SELECT 
          b.booking_id,
          b.user_id,
          b.booking_date,
          b.status as booking_status,
          b.total_price,
          t.name as tour_name,
          p.payment_id,
          p.status as payment_status,
          p.amount,
          p.refund_request,
          u.first_name,
          u.last_name,
          u.email
        FROM bookings b
        LEFT JOIN tours t ON b.tour_id = t.tour_id
        LEFT JOIN payments p ON b.booking_id = p.booking_id
        LEFT JOIN users u ON b.user_id = u.user_id
        WHERE b.booking_id = ? AND b.user_id = ?`,
        [bookingId, payload.user_id]
      ) as any

      if (!bookingRows || bookingRows.length === 0) {
        await conn.rollback()
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }

      const booking = bookingRows[0]

      // Check if payment exists and is completed
      if (!booking.payment_id) {
        await conn.rollback()
        return NextResponse.json(
          { error: 'No payment found for this booking' },
          { status: 400 }
        )
      }

      if (booking.payment_status !== 'completed') {
        await conn.rollback()
        return NextResponse.json(
          { error: 'Only completed payments can be refunded' },
          { status: 400 }
        )
      }

      if (booking.payment_status === 'refunded') {
        await conn.rollback()
        return NextResponse.json(
          { error: 'Payment has already been refunded' },
          { status: 400 }
        )
      }

      if (booking.refund_request === 'REFUND_REQUESTED') {
        await conn.rollback()
        return NextResponse.json(
          { error: 'Refund request already submitted' },
          { status: 400 }
        )
      }

      // Check if booking is within 24 hours
      const bookingDate = new Date(booking.booking_date)
      const now = new Date()
      const hoursSinceBooking = (now.getTime() - bookingDate.getTime()) / (1000 * 60 * 60)

      if (hoursSinceBooking > 24) {
        await conn.rollback()
        return NextResponse.json(
          { 
            error: 'Refund requests must be made within 24 hours of booking',
            hoursSinceBooking: Math.round(hoursSinceBooking * 10) / 10,
            bookingDate: booking.booking_date
          },
          { status: 400 }
        )
      }

      // Update payment with refund request
      await conn.query(
        `UPDATE payments
         SET refund_request = 'REFUND_REQUESTED'
         WHERE payment_id = ?`,
        [booking.payment_id]
      )

      // Create notification for employees
      // First, check if notification table exists, if not create it
      try {
        await conn.query(`
          CREATE TABLE IF NOT EXISTS notification (
            notification_id INT AUTO_INCREMENT PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            booking_id INT NOT NULL,
            customer_id INT NOT NULL,
            customer_name VARCHAR(255) NOT NULL,
            customer_email VARCHAR(255) NOT NULL,
            message TEXT,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_is_read (is_read),
            INDEX idx_created_at (created_at),
            FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
            FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        `)
      } catch (createError: any) {
        // Table might already exist, continue
        console.log('Notification table check:', createError?.message || 'Table exists')
      }

      // Insert notification
      await conn.query(
        `INSERT INTO notification 
         (type, booking_id, customer_id, customer_name, customer_email, message, is_read)
         VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
        [
          'refund_request',
          bookingId,
          payload.user_id,
          `${booking.first_name} ${booking.last_name}`,
          booking.email,
          reason || `Refund requested for booking #${bookingId} - ${booking.tour_name || 'Tour'}. Amount: ETB ${booking.amount || booking.total_price}`
        ]
      )

      await conn.commit()

      return NextResponse.json({
        success: true,
        message: 'Refund request submitted successfully. An employee will review your request.',
        hoursSinceBooking: Math.round(hoursSinceBooking * 10) / 10
      })
    } catch (error) {
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }
  } catch (error: any) {
    console.error('Error creating refund request:', error)
    return NextResponse.json(
      { error: 'Failed to create refund request', details: error.message },
      { status: 500 }
    )
  }
}

