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
    if (!decoded || !['employee', 'admin'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Employee or admin access required' },
        { status: 403 }
      )
    }

    // Admins bypass HR check; employees must be HR
    if (decoded.role === 'employee') {
      const isHr = await Employee.isHR(Number(decoded.user_id))
      if (!isHr) {
        return NextResponse.json({ error: 'HR access required' }, { status: 403 })
      }
    }
    
    const pool = getPool()

    // Get customer ratings from ratings table
    // Handle both old schema (rating_tourguide/rating_driver) and new schema (rating/rating_type)
    let customerRatings: any[] = []
    
    try {
      // First, try the new schema (with rating_type and rated_user_id)
      const [newSchemaRatings] = await pool.execute(
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
        WHERE r.rating IS NOT NULL AND r.rating_type IS NOT NULL
        ORDER BY r.created_at DESC`
      ) as any
      
      if (Array.isArray(newSchemaRatings) && newSchemaRatings.length > 0) {
        customerRatings = newSchemaRatings
      }
    } catch (newSchemaError) {
      // If new schema fails, try old schema
      console.log('New schema not found, trying old schema:', newSchemaError)
    }
    
    // If no results from new schema, try old schema (rating_tourguide/rating_driver)
    if (customerRatings.length === 0) {
      try {
        // Get tour guide ratings from old schema
        const [tgRatingsOld] = await pool.execute(
          `SELECT
            (r.rating_id * 1000 + 1) as rating_id,
            r.rating_tourguide as rating,
            COALESCE(r.review_tourguide, '') as comment,
            'tourguide' as rating_type,
            r.created_at,
            CONCAT(COALESCE(tg.first_name, ''), ' ', COALESCE(tg.last_name, '')) as employee_name,
            CONCAT(COALESCE(customer.first_name, ''), ' ', COALESCE(customer.last_name, '')) as customer_name,
            COALESCE(t.name, 'N/A') as tour_name,
            'customer' as rating_source
          FROM ratings r
          LEFT JOIN users tg ON r.tour_guide_id = tg.user_id
          LEFT JOIN users customer ON r.customer_id = customer.user_id
          LEFT JOIN bookings b ON r.booking_id = b.booking_id
          LEFT JOIN tours t ON b.tour_id = t.tour_id
          WHERE r.rating_tourguide IS NOT NULL AND r.rating_tourguide > 0
          ORDER BY r.created_at DESC`
        ) as any
        
        // Get driver ratings from old schema
        const [drRatingsOld] = await pool.execute(
          `SELECT
            (r.rating_id * 1000 + 2) as rating_id,
            r.rating_driver as rating,
            COALESCE(r.review_driver, '') as comment,
            'driver' as rating_type,
            r.created_at,
            CONCAT(COALESCE(d.first_name, ''), ' ', COALESCE(d.last_name, '')) as employee_name,
            CONCAT(COALESCE(customer.first_name, ''), ' ', COALESCE(customer.last_name, '')) as customer_name,
            COALESCE(t.name, 'N/A') as tour_name,
            'customer' as rating_source
          FROM ratings r
          LEFT JOIN users d ON r.driver_id = d.user_id
          LEFT JOIN users customer ON r.customer_id = customer.user_id
          LEFT JOIN bookings b ON r.booking_id = b.booking_id
          LEFT JOIN tours t ON b.tour_id = t.tour_id
          WHERE r.rating_driver IS NOT NULL AND r.rating_driver > 0
          ORDER BY r.created_at DESC`
        ) as any
        
        // Combine tour guide and driver ratings from old schema
        const tgRatings = Array.isArray(tgRatingsOld) ? tgRatingsOld : []
        const drRatings = Array.isArray(drRatingsOld) ? drRatingsOld : []
        customerRatings = [...tgRatings, ...drRatings]
      } catch (oldSchemaError) {
        console.error('Error fetching ratings from old schema:', oldSchemaError)
        customerRatings = []
      }
    }

    // Get default driver ratings from drivers table
    let driverRatings: any[] = []
    try {
      const [drRatings] = await pool.execute(
        `SELECT
          (d.driver_id * 10000 + 1000) as rating_id,
          d.rating,
          'Default driver rating' as comment,
          'driver' as rating_type,
          NULL as created_at,
          CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as employee_name,
          'System Default' as customer_name,
          'N/A' as tour_name,
          'default' as rating_source
        FROM drivers d
        JOIN users u ON d.driver_id = u.user_id
        WHERE d.rating IS NOT NULL AND d.rating > 0
        ORDER BY d.rating DESC`
      ) as any
      driverRatings = Array.isArray(drRatings) ? drRatings : []
    } catch (error) {
      console.log('Error fetching driver ratings:', error instanceof Error ? error.message : 'Unknown error')
      driverRatings = []
    }

    // Get default tour guide ratings from tourguides table
    let tourGuideRatings: any[] = []
    try {
      const [tgRatings] = await pool.execute(
        `SELECT
          (tg.tour_guide_id * 10000 + 2000) as rating_id,
          tg.rating,
          'Default tour guide rating' as comment,
          'tourguide' as rating_type,
          NULL as created_at,
          CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, '')) as employee_name,
          'System Default' as customer_name,
          'N/A' as tour_name,
          'default' as rating_source
        FROM tourguides tg
        JOIN users u ON tg.tour_guide_id = u.user_id
        WHERE tg.rating IS NOT NULL AND tg.rating > 0
        ORDER BY tg.rating DESC`
      ) as any
      tourGuideRatings = Array.isArray(tgRatings) ? tgRatings : []
    } catch (error) {
      console.log('Error fetching tour guide ratings:', error instanceof Error ? error.message : 'Unknown error')
      tourGuideRatings = []
    }

    // Combine all ratings and normalize data
    const allRatingsRaw = [
      ...(Array.isArray(customerRatings) ? customerRatings : []),
      ...(Array.isArray(driverRatings) ? driverRatings : []),
      ...(Array.isArray(tourGuideRatings) ? tourGuideRatings : [])
    ]
    
    // Normalize and map ratings to expected format
    const allRatings = allRatingsRaw.map((rating: any) => ({
      rating_id: Number(rating.rating_id) || 0,
      employee_name: String(rating.employee_name || '').trim() || 'Unknown',
      rating_type: (rating.rating_type === 'tourguide' || rating.rating_type === 'driver') 
        ? rating.rating_type 
        : 'tourguide',
      customer_name: String(rating.customer_name || '').trim() || 'Unknown',
      rating: Number(rating.rating) || 0,
      comment: String(rating.comment || '').trim() || '',
      created_at: rating.created_at ? new Date(rating.created_at).toISOString() : new Date().toISOString(),
      tour_name: String(rating.tour_name || 'N/A').trim(),
      rating_source: rating.rating_source || 'default'
    }))

    // Sort by rating source (customer ratings first) and then by rating value
    allRatings.sort((a: any, b: any) => {
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
