import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { Employee } from '@/lib/domain'
import { getPool } from '@/lib/db'

// GET /api/employee/tourguides - Get all tour guides with ratings
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
    
    // ISSUE 2 FIX: Extract date parameters to filter only available tour guides
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    // Base query
    let query = `
      SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number as phone,
        tg.specialization,
        tg.experience_years,
        (
          SELECT COUNT(DISTINCT b.booking_id)
          FROM bookings b
          WHERE b.tour_guide_id = u.user_id
            AND b.status IN ('confirmed', 'completed', 'in-progress')
        ) as total_tours,
        COALESCE(tg.rating, 0) as average_rating,
        COALESCE(tg.total_ratings, 0) as total_ratings,
        CASE 
          WHEN (
            SELECT COUNT(1)
            FROM bookings b2
            WHERE b2.tour_guide_id = u.user_id
              AND b2.status IN ('confirmed', 'in-progress')
              AND b2.start_date <= CURDATE() AND b2.end_date >= CURDATE()
          ) > 0 THEN 'busy' ELSE 'available' END as availability
      FROM users u
      LEFT JOIN tourguides tg ON u.user_id = tg.tour_guide_id
      WHERE u.role = 'tourguide'
    `
    const params: any[] = []
    
    // ISSUE 2 FIX: Exclude tour guides already assigned during the requested date range
    if (startDate && endDate) {
      query += `
        AND u.user_id NOT IN (
          SELECT DISTINCT b.tour_guide_id
          FROM bookings b
          WHERE b.tour_guide_id IS NOT NULL
            AND b.status IN ('confirmed', 'in-progress', 'pending')
            AND (
              (b.start_date <= ? AND b.end_date >= ?)
              OR (b.start_date <= ? AND b.end_date >= ?)
              OR (b.start_date >= ? AND b.end_date <= ?)
            )
        )
      `
      params.push(endDate, startDate, startDate, endDate, startDate, endDate)
    }
    
    query += ` ORDER BY average_rating DESC, total_tours DESC`
    
    const [rows] = params.length > 0
      ? await pool.execute(query, params)
      : await pool.execute(query)
    
    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error('Error fetching tour guides:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tour guides' },
      { status: 500 }
    )
  }
}
