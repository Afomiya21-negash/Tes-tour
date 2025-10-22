import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
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
    
    // Check if tourguides table exists and has rating column
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
      console.log('Tourguides table might not have rating column:', error.message)
      // Try to get tour guides from users table instead
      const [tgFromUsers] = await pool.execute(
        `SELECT 
          CONCAT('tourguide_', u.user_id) as rating_id,
          4.5 as rating,
          'Default tour guide rating' as comment,
          'tourguide' as rating_type,
          NULL as created_at,
          CONCAT(u.first_name, ' ', u.last_name) as employee_name,
          'System Default' as customer_name,
          'N/A' as tour_name,
          'default' as rating_source
        FROM users u
        WHERE u.role = 'tourguide'
        ORDER BY u.first_name`
      )
      tourGuideRatings = Array.isArray(tgFromUsers) ? tgFromUsers : []
    }
    
    // Combine all ratings
    const allRatings = [
      ...(Array.isArray(customerRatings) ? customerRatings : []),
      ...(Array.isArray(driverRatings) ? driverRatings : []),
      ...tourGuideRatings
    ]
    
    // Sort by rating source (customer ratings first) and then by rating value
    allRatings.sort((a, b) => {
      if (a.rating_source === 'customer' && b.rating_source !== 'customer') return -1
      if (a.rating_source !== 'customer' && b.rating_source === 'customer') return 1
      return b.rating - a.rating
    })
    
    return NextResponse.json({
      success: true,
      totalRatings: allRatings.length,
      customerRatings: customerRatings?.length || 0,
      driverRatings: driverRatings?.length || 0,
      tourGuideRatings: tourGuideRatings?.length || 0,
      ratings: allRatings
    })
  } catch (error) {
    console.error('Error testing employee ratings:', error)
    return NextResponse.json(
      { error: 'Failed to test employee ratings', details: error.message },
      { status: 500 }
    )
  }
}
