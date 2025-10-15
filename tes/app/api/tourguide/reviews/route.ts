import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

// GET /api/tourguide/reviews - Get reviews/ratings for logged-in tour guide
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
    
    // Get reviews/ratings for this tour guide
    const [rows] = await pool.execute(
      `SELECT 
        r.rating_id,
        r.rating,
        r.comment,
        r.created_at,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email,
        t.name as tour_name,
        t.destination,
        b.start_date,
        b.end_date
      FROM ratings r
      JOIN bookings b ON r.booking_id = b.booking_id
      LEFT JOIN users u ON r.customer_id = u.user_id
      LEFT JOIN tours t ON b.tour_id = t.tour_id
      WHERE r.rated_user_id = ? AND r.rating_type = 'tourguide'
      ORDER BY r.created_at DESC`,
      [payload.user_id]
    )
    
    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error('Error fetching tour guide reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
