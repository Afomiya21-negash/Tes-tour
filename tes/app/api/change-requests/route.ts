import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'
import { Employee } from '@/lib/domain'

// GET /api/change-requests - Get change requests (customer or admin)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const decoded = verifyJwt(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const pool = getPool()
    const role = decoded.role
    const userId = Number(decoded.user_id)

    let query = `
      SELECT 
        cr.*,
        COALESCE(t.name, 'Custom Booking') as tour_name,
        b.start_date,
        b.end_date,
        b.status as booking_status,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email,
        ctg.first_name as current_guide_first_name,
        ctg.last_name as current_guide_last_name,
        cd.first_name as current_driver_first_name,
        cd.last_name as current_driver_last_name,
        ntg.first_name as new_guide_first_name,
        ntg.last_name as new_guide_last_name,
        nd.first_name as new_driver_first_name,
        nd.last_name as new_driver_last_name,
        pb.first_name as processed_by_first_name,
        pb.last_name as processed_by_last_name
      FROM change_requests cr
      JOIN bookings b ON cr.booking_id = b.booking_id
      LEFT JOIN tours t ON b.tour_id = t.tour_id
      JOIN users u ON cr.user_id = u.user_id
      LEFT JOIN users ctg ON cr.current_tour_guide_id = ctg.user_id
      LEFT JOIN users cd ON cr.current_driver_id = cd.user_id
      LEFT JOIN users ntg ON cr.new_tour_guide_id = ntg.user_id
      LEFT JOIN users nd ON cr.new_driver_id = nd.user_id
      LEFT JOIN users pb ON cr.processed_by = pb.user_id
    `

    if (role === 'customer') {
      query += ` WHERE cr.user_id = ?`
      const [rows] = await pool.execute(query, [userId])
      return NextResponse.json(Array.isArray(rows) ? rows : [])
    } else if (role === 'admin') {
      query += ` ORDER BY 
        CASE cr.status 
          WHEN 'pending' THEN 1 
          WHEN 'approved' THEN 2 
          WHEN 'completed' THEN 3 
          WHEN 'rejected' THEN 4 
        END,
        cr.created_at DESC`
      const [rows] = await pool.execute(query)
      return NextResponse.json(Array.isArray(rows) ? rows : [])
    } else if (role === 'employee') {
      // Check if employee has HR access
      const isHr = await Employee.isHR(userId)
      if (!isHr) {
        return NextResponse.json({ error: 'HR access required' }, { status: 403 })
      }
      
      query += ` ORDER BY 
        CASE cr.status 
          WHEN 'pending' THEN 1 
          WHEN 'approved' THEN 2 
          WHEN 'completed' THEN 3 
          WHEN 'rejected' THEN 4 
        END,
        cr.created_at DESC`
      const [rows] = await pool.execute(query)
      return NextResponse.json(Array.isArray(rows) ? rows : [])
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
  } catch (error) {
    console.error('Error fetching change requests:', error)
    return NextResponse.json({ error: 'Failed to fetch change requests' }, { status: 500 })
  }
}

// POST /api/change-requests - Create a change request (customer only)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const decoded = verifyJwt(token)
    if (!decoded || decoded.role !== 'customer') {
      return NextResponse.json({ error: 'Customer access required' }, { status: 403 })
    }

    const userId = Number(decoded.user_id)
    const body = await request.json()
    const { booking_id, request_type, reason } = body

    if (!booking_id || !request_type) {
      return NextResponse.json(
        { error: 'booking_id and request_type are required' },
        { status: 400 }
      )
    }

    if (!['tour_guide', 'driver', 'both'].includes(request_type)) {
      return NextResponse.json(
        { error: 'Invalid request_type. Must be: tour_guide, driver, or both' },
        { status: 400 }
      )
    }

    const pool = getPool()

    // Verify booking belongs to customer and is in-progress
    const [bookingRows] = await pool.execute(
      `SELECT b.booking_id, b.tour_guide_id, b.driver_id, b.status
       FROM bookings b
       WHERE b.booking_id = ? AND b.user_id = ?`,
      [booking_id, userId]
    ) as any

    if (!bookingRows || bookingRows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const booking = bookingRows[0]

    if (booking.status !== 'in-progress') {
      return NextResponse.json(
        { error: 'Can only request changes for in-progress tours' },
        { status: 400 }
      )
    }

    // Check if there's already a pending request for this booking
    const [existingRows] = await pool.execute(
      `SELECT request_id FROM change_requests 
       WHERE booking_id = ? AND status = 'pending'`,
      [booking_id]
    ) as any

    if (existingRows && existingRows.length > 0) {
      return NextResponse.json(
        { error: 'You already have a pending change request for this booking' },
        { status: 400 }
      )
    }

    // Create change request
    const [result] = await pool.execute(
      `INSERT INTO change_requests 
       (booking_id, user_id, request_type, current_tour_guide_id, current_driver_id, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [
        booking_id,
        userId,
        request_type,
        booking.tour_guide_id,
        booking.driver_id,
        reason || null
      ]
    ) as any

    // Get customer info for notification
    const [customerRows] = await pool.execute(
      `SELECT first_name, last_name, email FROM users WHERE user_id = ?`,
      [userId]
    ) as any

    const customer = customerRows && customerRows.length > 0 ? customerRows[0] : null
    const customerName = customer ? `${customer.first_name} ${customer.last_name}` : 'Customer'

    // Get tour name for notification
    const [tourRows] = await pool.execute(
      `SELECT t.name as tour_name FROM bookings b
       LEFT JOIN tours t ON b.tour_id = t.tour_id
       WHERE b.booking_id = ?`,
      [booking_id]
    ) as any

    const tourName = tourRows && tourRows.length > 0 && tourRows[0].tour_name 
      ? tourRows[0].tour_name 
      : 'Tour'

    // Create notification for HR employees
    // Try to create notification table if it doesn't exist
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS notification (
          notification_id INT AUTO_INCREMENT PRIMARY KEY,
          type VARCHAR(50) NOT NULL,
          booking_id INT,
          customer_id INT,
          customer_name VARCHAR(255),
          customer_email VARCHAR(255),
          message TEXT NOT NULL,
          is_read BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_type (type),
          INDEX idx_read (is_read),
          INDEX idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `)
    } catch (createError: any) {
      // Table might already exist, continue
      console.log('Notification table check:', createError?.message || 'Table exists')
    }

    // Insert notification for HR employees
    const requestTypeText = request_type === 'both' 
      ? 'tour guide and driver' 
      : request_type === 'tour_guide' 
      ? 'tour guide' 
      : 'driver'

    await pool.execute(
      `INSERT INTO notification 
       (type, booking_id, customer_id, customer_name, customer_email, message, is_read)
       VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
      [
        'change_request',
        booking_id,
        userId,
        customerName,
        customer?.email || null,
        `${customerName} requested to change ${requestTypeText} for booking #${booking_id} - ${tourName}. ${reason ? `Reason: ${reason}` : ''}`
      ]
    )

    return NextResponse.json({
      success: true,
      request_id: result.insertId,
      message: 'Change request submitted. We will assign a new guide/driver within 24 hours.'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating change request:', error)
    return NextResponse.json({ error: 'Failed to create change request' }, { status: 500 })
  }
}
