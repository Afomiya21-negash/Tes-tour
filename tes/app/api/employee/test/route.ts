import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { Employee } from '@/lib/domain'
import { getPool } from '@/lib/db'

// GET /api/employee/test - Test employee access and database connection
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

    // Check HR status
    const isHr = await Employee.isHR(Number(decoded.user_id))
    
    // Test database connection
    const pool = getPool()
    const [rows] = await pool.execute('SELECT COUNT(*) as booking_count FROM bookings')
    const [userRows] = await pool.execute('SELECT COUNT(*) as user_count FROM users WHERE role = "tourguide"')
    
    return NextResponse.json({
      authenticated: true,
      isHr,
      userId: decoded.user_id,
      role: decoded.role,
      database: {
        bookingCount: (rows as any)[0]?.booking_count || 0,
        tourGuideCount: (userRows as any)[0]?.user_count || 0
      }
    })
  } catch (error) {
    console.error('Error in employee test:', error)
    return NextResponse.json(
      { error: 'Test failed', details: String(error) },
      { status: 500 }
    )
  }
}
