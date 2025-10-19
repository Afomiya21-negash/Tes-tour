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
    const [rows] = await pool.execute(
      `SELECT 
        r.rating_id,
        r.rating,
        r.comment,
        r.rating_type,
        r.created_at,
        CONCAT(rated_user.first_name, ' ', rated_user.last_name) as employee_name,
        CONCAT(customer.first_name, ' ', customer.last_name) as customer_name,
        t.name as tour_name
      FROM ratings r
      LEFT JOIN users rated_user ON r.rated_user_id = rated_user.user_id
      LEFT JOIN users customer ON r.customer_id = customer.user_id
      LEFT JOIN bookings b ON r.booking_id = b.booking_id
      LEFT JOIN tours t ON b.tour_id = t.tour_id
      ORDER BY r.created_at DESC`
    )
    
    return NextResponse.json(Array.isArray(rows) ? rows : [])
  } catch (error) {
    console.error('Error fetching ratings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    )
  }
}
