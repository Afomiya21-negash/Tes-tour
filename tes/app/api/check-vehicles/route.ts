import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const pool = getPool()
    
    // Get table structure
    const [columns] = await pool.execute('DESCRIBE vehicles')
    
    // Get sample data
    const [vehicles] = await pool.execute('SELECT * FROM vehicles LIMIT 5')
    
    return NextResponse.json({ 
      success: true,
      columns,
      vehicles
    })
  } catch (error) {
    console.error('Error checking vehicles:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
