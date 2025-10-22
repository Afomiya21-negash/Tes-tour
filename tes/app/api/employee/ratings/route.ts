import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { Employee } from '@/lib/domain'
import { getPool } from '@/lib/db'

// GET /api/employee/ratings - Get all ratings for employee dashboard
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const decoded = verifyJwt(token)
    if (!decoded || decoded.role !== 'employee') {
      return NextResponse.json(
        { error: 'Employee access required' },
        { status: 403 }
      )
    }

    // Require HR position for access to employee dashboard
    const isHr = await Employee.isHR(Number(decoded.user_id))
    if (!isHr) {
      return NextResponse.json({ error: 'HR access required' }, { status: 403 })
    }
    
    const pool = getPool()

    // Get customer ratings from ratings table
    const [customerRatings] = await pool.execute(
      `SELECT
        r.rating_id,
        r.rating,
        r.comment,
        r.rating_type,
        r.created_at,
        CONCAT(rated_user.first_name, ' ', rated_user.last_name) as employee_name,
        CONCAT(customer.first_name, ' ', customer.last_name) as customer_name,
        t.name as tour_name,
        'customer' as rating_source
      FROM ratings r
      LEFT JOIN users rated_user ON r.rated_user_id = rated_user.user_id
      LEFT JOIN users customer ON r.customer_id = customer.user_id
      LEFT JOIN bookings b ON r.booking_id = b.booking_id
      LEFT JOIN tours t ON b.tour_id = t.tour_id
      ORDER BY r.created_at DESC`
    )

    // Get default driver ratings from drivers table
    const [driverRatings] = await pool.execute(
      `SELECT
        CONCAT('driver_', d.driver_id) as rating_id,
        d.rating,
        'Default driver rating' as comment,
        'driver' as rating_type,
        NULL as created_at,
        CONCAT(u.first_name, ' ', u.last_name) as employee_name,
        'System Default' as customer_name,
        'N/A' as tour_name,
        'default' as rating_source
      FROM drivers d
      JOIN users u ON d.driver_id = u.user_id
      WHERE d.rating IS NOT NULL AND d.rating > 0
      ORDER BY d.rating DESC`
    )

    // Get default tour guide ratings from tourguides table
    let tourGuideRatings = []
    try {
      const [tgRatings] = await pool.execute(
        `SELECT
          CONCAT('tourguide_', tg.tour_guide_id) as rating_id,
          tg.rating,
          'Default tour guide rating' as comment,
          'tourguide' as rating_type,
          NULL as created_at,
          CONCAT(u.first_name, ' ', u.last_name) as employee_name,
          'System Default' as customer_name,
          'N/A' as tour_name,
          'default' as rating_source
        FROM tourguides tg
        JOIN users u ON tg.tour_guide_id = u.user_id
        WHERE tg.rating IS NOT NULL AND tg.rating > 0
        ORDER BY tg.rating DESC`
      )
      tourGuideRatings = Array.isArray(tgRatings) ? tgRatings : []
    } catch (error) {
      console.log('Error fetching tour guide ratings:', error instanceof Error ? error.message : 'Unknown error')
      tourGuideRatings = []
    }

    // Combine all ratings
    const allRatings = [
      ...(Array.isArray(customerRatings) ? customerRatings : []),
      ...(Array.isArray(driverRatings) ? driverRatings : []),
      ...(Array.isArray(tourGuideRatings) ? tourGuideRatings : [])
    ]

    // Sort by rating source (customer ratings first) and then by rating value
    allRatings.sort((a, b) => {
      if (a.rating_source === 'customer' && b.rating_source !== 'customer') return -1
      if (a.rating_source !== 'customer' && b.rating_source === 'customer') return 1
      return b.rating - a.rating
    })

    return NextResponse.json(allRatings)
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}
