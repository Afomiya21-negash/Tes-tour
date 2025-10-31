import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const pool = getPool()
    const conn = await pool.getConnection()
    
    try {
      // Test if customers table exists
      console.log('Testing customers table...')
      const [rows] = await conn.execute('SELECT COUNT(*) as count FROM customers') as any
      console.log('Customers table exists, count:', rows[0]?.count || 0)
      
      return NextResponse.json({ 
        success: true,
        customersTableExists: true,
        count: rows[0]?.count || 0
      })
    } catch (error: any) {
      console.log('Customers table does not exist, creating...')
      
      // Create customers table
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS customers (
          customer_id int(11) NOT NULL,
          address varchar(255) DEFAULT NULL,
          date_of_birth date DEFAULT NULL,
          PRIMARY KEY (customer_id),
          FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
      `)
      
      console.log('Customers table created successfully')
      
      return NextResponse.json({ 
        success: true,
        customersTableExists: false,
        created: true
      })
    } finally {
      conn.release()
    }
  } catch (error: any) {
    console.error('Error in test-signup:', error)
    return NextResponse.json({ 
      error: error.message,
      success: false
    }, { status: 500 })
  }
}
