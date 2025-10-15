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
    
    // Get custom itineraries for tours assigned to this tour guide
    const [rows] = await pool.execute(
      `SELECT 
        ci.custom_itinerary_id,
        ci.booking_id,
        ci.itinerary_data,
        ci.created_at,
        ci.updated_at,
        b.start_date,
        b.end_date,
        b.number_of_people,
        b.special_requests,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email,
        u.phone as customer_phone,
        t.name as tour_name,
        t.destination
      FROM custom_itinerary ci
      JOIN bookings b ON ci.booking_id = b.booking_id
      LEFT JOIN users u ON b.customer_id = u.user_id
      LEFT JOIN tours t ON b.tour_id = t.tour_id
      WHERE b.tour_guide_id = ?
      ORDER BY b.start_date ASC`,
      [payload.user_id]
    )
    
    // Parse itinerary_data JSON for each row
    const itineraries = (Array.isArray(rows) ? rows : []).map((row: any) => ({
      ...row,
      itinerary_data: row.itinerary_data ? JSON.parse(row.itinerary_data) : null
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
