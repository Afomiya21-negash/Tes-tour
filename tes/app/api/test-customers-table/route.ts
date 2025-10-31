import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const pool = getPool()
    
    // Test if customers table exists
    try {
      const [rows] = await pool.execute('SELECT COUNT(*) as count FROM customers') as any
      return NextResponse.json({ 
        exists: true, 
        count: rows[0]?.count || 0,
        message: 'Customers table exists'
      })
    } catch (error) {
      return NextResponse.json({ 
        exists: false, 
        error: error.message,
        message: 'Customers table does not exist'
      })
    }
  } catch (error) {
    console.error('Error testing customers table:', error)
    return NextResponse.json({ error: 'Failed to test customers table' }, { status: 500 })
  }
}
