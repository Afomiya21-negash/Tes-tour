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
    
    // Get tour guides with their average ratings and total tours
    const [rows] = await pool.execute(
      `SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number as phone,
        COUNT(DISTINCT b.booking_id) as total_tours,
        COALESCE(AVG(r.rating), 0) as average_rating,
        CASE 
          WHEN COUNT(CASE WHEN b.status IN ('confirmed', 'in-progress') THEN 1 END) > 0 
          THEN 'busy' 
          ELSE 'available' 
        END as availability
      FROM users u
      LEFT JOIN bookings b ON u.user_id = b.tour_guide_id AND b.status IN ('confirmed', 'completed', 'in-progress')
      LEFT JOIN ratings r ON u.user_id = r.rated_user_id AND r.rating_type = 'tourguide'
      WHERE u.role = 'tourguide'
      GROUP BY u.user_id, u.first_name, u.last_name, u.email, u.phone_number
      ORDER BY average_rating DESC, total_tours DESC`
    )
    
    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error('Error fetching tour guides:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tour guides' },
      { status: 500 }
    )
  }
}
