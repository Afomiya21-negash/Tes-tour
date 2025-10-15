import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const pool = getPool()
    
    // Test basic connection
    const [result] = await pool.execute('SELECT 1 as test')
    
    // Check bookings count
    const [bookingCount] = await pool.execute('SELECT COUNT(*) as count FROM bookings')
    
    // Check users count
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users')
    
    // Check tours count
    const [tourCount] = await pool.execute('SELECT COUNT(*) as count FROM tours')

    // Check employees count and list them
    const [employeeCount] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE role IN ("employee", "tourguide", "driver")')
    const [employeeList] = await pool.execute('SELECT user_id, username, email, role, first_name, last_name FROM users WHERE role IN ("employee", "tourguide", "driver") LIMIT 5')

    // Check bookings table structure
    const [tableInfo] = await pool.execute('DESCRIBE bookings')

    // Check sample bookings
    const [sampleBookings] = await pool.execute('SELECT * FROM bookings LIMIT 3')

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        test: result[0].test,
        bookings: bookingCount[0].count,
        users: userCount[0].count,
        tours: tourCount[0].count,
        employees: employeeCount[0].count,
        employeeList: employeeList,
        tableStructure: tableInfo,
        sampleBookings: sampleBookings
      }
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Database connection failed', 
        details: error.message 
      },
      { status: 500 }
    )
  }
}
