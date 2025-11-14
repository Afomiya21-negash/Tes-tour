import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const pool = getPool()
    
    // Check if customers table exists
    const [tables] = await pool.query(
      "SHOW TABLES LIKE 'customers'"
    ) as any
    
    if (!tables || tables.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Customers table does not exist'
      })
    }
    
    // Get all customers with user info
    const [customers] = await pool.query(`
      SELECT 
        u.user_id,
        u.username,
        u.email,
        u.role,
        u.first_name,
        u.last_name,
        c.customer_id,
        c.address,
        c.date_of_birth
      FROM users u
      LEFT JOIN customers c ON u.user_id = c.customer_id
      WHERE u.role = 'customer'
      ORDER BY u.user_id DESC
      LIMIT 10
    `) as any
    
    // Also get customers table directly
    const [customersTable] = await pool.query(
      'SELECT * FROM customers ORDER BY customer_id DESC LIMIT 10'
    ) as any
    
    // Check specifically for user 31
    const [user31Check] = await pool.query(
      'SELECT * FROM customers WHERE customer_id = 31'
    ) as any
    
    // Count total customers
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM customers'
    ) as any
    
    return NextResponse.json({
      success: true,
      usersWithCustomerData: customers,
      customersTableOnly: customersTable,
      user31InCustomersTable: user31Check,
      totalCustomersInTable: countResult[0].total,
      userCount: customers.length,
      customerCount: customersTable.length
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
