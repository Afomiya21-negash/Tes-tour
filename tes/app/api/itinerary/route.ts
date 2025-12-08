import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

// GET - Fetch customer's itinerary for a booking
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const booking_id = searchParams.get('booking_id')

    if (!booking_id) {
      return NextResponse.json({ error: 'booking_id is required' }, { status: 400 })
    }

    const pool = getPool()

    // Verify user has access to this booking
    const [bookingRows] = await pool.query(
      `SELECT b.booking_id, b.user_id, b.tour_id, b.tour_guide_id,
              t.name as tour_name, t.description as tour_description
       FROM bookings b
       JOIN tours t ON b.tour_id = t.tour_id
       WHERE b.booking_id = ?`,
      [booking_id]
    ) as any

    if (!bookingRows || bookingRows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const booking = bookingRows[0]

    // Check if user is customer or tour guide for this booking
    if (payload.role === 'customer' && booking.user_id !== payload.user_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (payload.role === 'tourguide' && booking.tour_guide_id !== payload.user_id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if custom itinerary exists
    const [customRows] = await pool.query(
      `SELECT * FROM custom_itineraries 
       WHERE booking_id = ? AND customer_id = ?`,
      [booking_id, booking.user_id]
    ) as any

    if (customRows && customRows.length > 0) {
      // Return custom itinerary
      return NextResponse.json({
        itinerary_id: customRows[0].itinerary_id,
        booking_id: booking.booking_id,
        tour_id: booking.tour_id,
        tour_name: booking.tour_name,
        description: customRows[0].description,
        is_customized: customRows[0].is_customized,
        default_itinerary: booking.tour_description,
        created_at: customRows[0].created_at,
        updated_at: customRows[0].updated_at
      })
    } else {
      // Return default tour itinerary
      return NextResponse.json({
        itinerary_id: null,
        booking_id: booking.booking_id,
        tour_id: booking.tour_id,
        tour_name: booking.tour_name,
        description: booking.tour_description,
        is_customized: false,
        default_itinerary: booking.tour_description,
        created_at: null,
        updated_at: null
      })
    }

  } catch (error: any) {
    console.error('Error fetching itinerary:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch itinerary', 
      details: error.message 
    }, { status: 500 })
  }
}

// POST - Create or update custom itinerary
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || payload.role !== 'customer') {
      return NextResponse.json({ error: 'Only customers can customize itineraries' }, { status: 403 })
    }

    const { booking_id, description } = await req.json()

    if (!booking_id || !description) {
      return NextResponse.json({ 
        error: 'booking_id and description are required' 
      }, { status: 400 })
    }

    const pool = getPool()

    // Verify booking belongs to customer
    const [bookingRows] = await pool.query(
      `SELECT b.booking_id, b.user_id, b.tour_id, b.tour_guide_id
       FROM bookings b
       WHERE b.booking_id = ? AND b.user_id = ?`,
      [booking_id, payload.user_id]
    ) as any

    if (!bookingRows || bookingRows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const booking = bookingRows[0]

    // Check if custom itinerary already exists
    const [existingRows] = await pool.query(
      `SELECT itinerary_id FROM custom_itineraries 
       WHERE booking_id = ? AND customer_id = ?`,
      [booking_id, payload.user_id]
    ) as any

    let itinerary_id: number

    if (existingRows && existingRows.length > 0) {
      // Update existing itinerary
      itinerary_id = existingRows[0].itinerary_id
      await pool.query(
        `UPDATE custom_itineraries 
         SET description = ?, is_customized = TRUE, updated_at = NOW()
         WHERE itinerary_id = ?`,
        [description, itinerary_id]
      )
    } else {
      // Create new custom itinerary
      const [result] = await pool.query(
        `INSERT INTO custom_itineraries 
         (customer_id, tour_id, booking_id, description, is_customized)
         VALUES (?, ?, ?, ?, TRUE)`,
        [payload.user_id, booking.tour_id, booking_id, description]
      ) as any
      itinerary_id = result.insertId
    }

    // Create notification for tour guide if assigned
    if (booking.tour_guide_id) {
      // Get customer name and booking details
      const [customerRows] = await pool.query(
        `SELECT first_name, last_name FROM users WHERE user_id = ?`,
        [payload.user_id]
      ) as any

      const customerName = customerRows && customerRows.length > 0
        ? `${customerRows[0].first_name} ${customerRows[0].last_name}`
        : 'Customer'

      // Get group size from booking
      const [bookingDetailsRows] = await pool.query(
        `SELECT number_of_people FROM bookings WHERE booking_id = ?`,
        [booking_id]
      ) as any

      const groupSize = bookingDetailsRows && bookingDetailsRows.length > 0
        ? bookingDetailsRows[0].number_of_people
        : 0

      const peopleText = groupSize === 1 ? 'person' : 'people'

      await pool.query(
        `INSERT INTO itinerary_notifications 
         (itinerary_id, tour_guide_id, booking_id, customer_id, message)
         VALUES (?, ?, ?, ?, ?)`,
        [
          itinerary_id,
          booking.tour_guide_id,
          booking_id,
          payload.user_id,
          `${customerName} (${groupSize} ${peopleText}) has updated their itinerary`
        ]
      )
    }

    return NextResponse.json({
      success: true,
      itinerary_id: itinerary_id,
      message: 'Itinerary updated successfully'
    })

  } catch (error: any) {
    console.error('Error updating itinerary:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ 
      error: 'Failed to update itinerary', 
      details: error.message,
      sqlMessage: error.sqlMessage || undefined
    }, { status: 500 })
  }
}
