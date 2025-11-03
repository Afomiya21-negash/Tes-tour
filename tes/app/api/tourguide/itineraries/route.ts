import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

// GET /api/tourguide/itineraries - Get custom itineraries for tour guide's assigned tours
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || !payload.user_id || payload.role !== 'tourguide') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pool = getPool()
    
    // Get all tours assigned to this tour guide with their descriptions from the tours table
    const [rows] = await pool.execute(
      `SELECT
        b.booking_id,
        b.start_date,
        b.end_date,
        b.number_of_people,
        b.special_requests,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email,
        u.phone_number as customer_phone,
        t.name as tour_name,
        t.destination,
        t.description as tour_description,
        t.duration_days
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.user_id
      LEFT JOIN tours t ON b.tour_id = t.tour_id
      WHERE b.tour_guide_id = ?
      ORDER BY b.start_date ASC`,
      [payload.user_id]
    )

    // Process the results to create itinerary objects
    const itineraries = (Array.isArray(rows) ? rows : []).map((row: any) => ({
      custom_itinerary_id: null,
      booking_id: row.booking_id,
      itinerary_data: {
        days: [{
          day: 1,
          title: `${row.tour_name} Tour`,
          description: row.tour_description || 'Complete tour itinerary',
          location: row.destination || 'Various locations'
        }]
      },
      created_at: null,
      updated_at: null,
      start_date: row.start_date,
      end_date: row.end_date,
      number_of_people: row.number_of_people,
      special_requests: row.special_requests,
      customer_first_name: row.customer_first_name,
      customer_last_name: row.customer_last_name,
      customer_email: row.customer_email,
      customer_phone: row.customer_phone,
      tour_name: row.tour_name,
      destination: row.destination,
      itinerary_type: 'default'
    }))

    return NextResponse.json(itineraries)
  } catch (error) {
    console.error('Error fetching tour guide itineraries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch itineraries' },
      { status: 500 }
    )
  }
}
