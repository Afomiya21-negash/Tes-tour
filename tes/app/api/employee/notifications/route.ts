import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { Employee } from '@/lib/domain'
import { getPool } from '@/lib/db'

/**
 * GET /api/employee/notifications
 * Get all notifications for employees (HR only)
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value || req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyJwt(token)
    if (!decoded || decoded.role !== 'employee') {
      return NextResponse.json({ error: 'Employee access required' }, { status: 403 })
    }

    // Require HR position
    const isHr = await Employee.isHR(Number(decoded.user_id))
    if (!isHr) {
      return NextResponse.json({ error: 'HR access required' }, { status: 403 })
    }

    const pool = getPool()

    // Check if table exists, if not return empty array
    try {
      const [notifications] = await pool.query(
        `SELECT 
          n.notification_id,
          n.type,
          n.booking_id,
          n.customer_id,
          n.customer_name,
          n.customer_email,
          n.message,
          n.is_read,
          n.created_at,
          b.tour_id,
          t.name as tour_name,
          b.total_price,
          b.booking_date,
          p.amount as payment_amount,
          p.payment_id
        FROM notification n
        LEFT JOIN bookings b ON n.booking_id = b.booking_id
        LEFT JOIN tours t ON b.tour_id = t.tour_id
        LEFT JOIN payments p ON b.booking_id = p.booking_id
        WHERE n.type = 'refund_request'
        ORDER BY n.is_read ASC, n.created_at DESC
        LIMIT 50`
      ) as any

      const unreadCount = (notifications || []).filter((n: any) => !n.is_read).length

      return NextResponse.json({
        notifications: notifications || [],
        unreadCount
      })
    } catch (error: any) {
      // Table might not exist yet
      if (error.code === 'ER_NO_SUCH_TABLE') {
        return NextResponse.json({
          notifications: [],
          unreadCount: 0
        })
      }
      throw error
    }
  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/employee/notifications
 * Mark notification as read
 */
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

    const isHr = await Employee.isHR(Number(decoded.user_id))
    if (!isHr) {
      return NextResponse.json({ error: 'HR access required' }, { status: 403 })
    }

    const { notificationId } = await req.json()

    if (!notificationId) {
      return NextResponse.json({ error: 'Notification ID is required' }, { status: 400 })
    }

    const pool = getPool()

    await pool.query(
      `UPDATE notification
       SET is_read = TRUE
       WHERE notification_id = ?`,
      [notificationId]
    )

    return NextResponse.json({ success: true, message: 'Notification marked as read' })
  } catch (error: any) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/employee/notifications
 * Mark all notifications as read
 */
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value || req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyJwt(token)
    if (!decoded || decoded.role !== 'employee') {
      return NextResponse.json({ error: 'Employee access required' }, { status: 403 })
    }

    const isHr = await Employee.isHR(Number(decoded.user_id))
    if (!isHr) {
      return NextResponse.json({ error: 'HR access required' }, { status: 403 })
    }

    const pool = getPool()

    await pool.query(
      `UPDATE notification
       SET is_read = TRUE
       WHERE type = 'refund_request' AND is_read = FALSE`
    )

    return NextResponse.json({ success: true, message: 'All notifications marked as read' })
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark all notifications as read', details: error.message },
      { status: 500 }
    )
  }
}


