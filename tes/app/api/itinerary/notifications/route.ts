import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

// GET - Fetch tour guide's itinerary notifications
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || payload.role !== 'tourguide') {
      return NextResponse.json({ error: 'Only tour guides can access notifications' }, { status: 403 })
    }

    const pool = getPool()

    // Fetch all notifications for this tour guide
    const [notifications] = await pool.query(
      `SELECT 
        n.notification_id,
        n.itinerary_id,
        n.booking_id,
        n.customer_id,
        n.message,
        n.is_read,
        n.created_at,
        u.first_name,
        u.last_name,
        u.email,
        b.number_of_people as group_size,
        ci.description as custom_description,
        ci.updated_at as itinerary_updated_at
       FROM itinerary_notifications n
       JOIN users u ON n.customer_id = u.user_id
       LEFT JOIN bookings b ON n.booking_id = b.booking_id
       LEFT JOIN custom_itineraries ci ON n.itinerary_id = ci.itinerary_id
       WHERE n.tour_guide_id = ?
       ORDER BY n.created_at DESC`,
      [payload.user_id]
    ) as any

    // Get unread count
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as unread_count 
       FROM itinerary_notifications 
       WHERE tour_guide_id = ? AND is_read = FALSE`,
      [payload.user_id]
    ) as any

    return NextResponse.json({
      notifications: notifications || [],
      unread_count: countRows[0]?.unread_count || 0
    })

  } catch (error: any) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch notifications', 
      details: error.message 
    }, { status: 500 })
  }
}

// POST - Mark notification as read
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || payload.role !== 'tourguide') {
      return NextResponse.json({ error: 'Only tour guides can mark notifications as read' }, { status: 403 })
    }

    const { notification_id } = await req.json()

    if (!notification_id) {
      return NextResponse.json({ error: 'notification_id is required' }, { status: 400 })
    }

    const pool = getPool()

    // Mark as read
    await pool.query(
      `UPDATE itinerary_notifications 
       SET is_read = TRUE 
       WHERE notification_id = ? AND tour_guide_id = ?`,
      [notification_id, payload.user_id]
    )

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json({ 
      error: 'Failed to mark notification as read', 
      details: error.message 
    }, { status: 500 })
  }
}

// DELETE - Mark all notifications as read
export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || payload.role !== 'tourguide') {
      return NextResponse.json({ error: 'Only tour guides can clear notifications' }, { status: 403 })
    }

    const pool = getPool()

    // Mark all as read
    await pool.query(
      `UPDATE itinerary_notifications 
       SET is_read = TRUE 
       WHERE tour_guide_id = ?`,
      [payload.user_id]
    )

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error clearing notifications:', error)
    return NextResponse.json({ 
      error: 'Failed to clear notifications', 
      details: error.message 
    }, { status: 500 })
  }
}
