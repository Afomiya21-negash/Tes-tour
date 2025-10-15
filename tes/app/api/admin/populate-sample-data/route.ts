import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const decoded = verifyJwt(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const pool = getPool()
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()

      // Insert sample customers
      await connection.execute(`
        INSERT IGNORE INTO users (user_id, username, email, password_hash, first_name, last_name, phone_number, role) VALUES
        (300, 'customer1', 'john.doe@email.com', '$2b$10$example_hash_6', 'John', 'Doe', '+251911789012', 'customer'),
        (301, 'customer2', 'jane.smith@email.com', '$2b$10$example_hash_7', 'Jane', 'Smith', '+251911890123', 'customer'),
        (302, 'customer3', 'mike.wilson@email.com', '$2b$10$example_hash_8', 'Mike', 'Wilson', '+251911901234', 'customer')
      `)

      // Insert sample bookings
      await connection.execute(`
        INSERT IGNORE INTO bookings (booking_id, customer_id, tour_id, vehicle_id, driver_id, tour_guide_id, start_date, end_date, total_price, booking_date, status, special_requests, number_of_people) VALUES
        (1, 300, 1, 1, 100, 200, '2024-02-15', '2024-02-17', 450.00, '2024-01-15 09:30:00', 'confirmed', 'Vegetarian meals preferred', 2),
        (2, 301, 2, 2, 101, 201, '2024-02-20', '2024-02-26', 850.00, '2024-01-20 14:15:00', 'confirmed', 'Need hiking boots size 42', 1),
        (3, 302, 3, 3, 102, 200, '2024-03-01', '2024-03-04', 650.00, '2024-02-01 11:45:00', 'pending', 'First time visitor to Ethiopia', 3),
        (4, 300, 4, 1, 100, 201, '2024-03-10', '2024-03-14', 750.00, '2024-02-10 16:20:00', 'confirmed', 'Photography equipment transport needed', 2),
        (5, 301, 5, 2, 101, 200, '2024-03-20', '2024-03-25', 800.00, '2024-02-15 13:10:00', 'pending', 'Wildlife photography focus', 1)
      `)

      // Insert sample payments
      await connection.execute(`
        INSERT IGNORE INTO payments (payment_id, booking_id, amount, payment_method, status, payment_date) VALUES
        (1, 1, 450.00, 'bank_transfer', 'completed', '2024-01-15 10:00:00'),
        (2, 2, 850.00, 'credit_card', 'completed', '2024-01-20 14:30:00'),
        (3, 3, 650.00, 'cash', 'pending', NULL),
        (4, 4, 750.00, 'bank_transfer', 'completed', '2024-02-10 17:00:00'),
        (5, 5, 800.00, 'mobile_money', 'pending', NULL)
      `)

      // Insert sample ratings
      await connection.execute(`
        INSERT IGNORE INTO ratings (rating_id, booking_id, customer_id, rated_user_id, rating_type, rating, comment, created_at) VALUES
        (1, 1, 300, 200, 'tourguide', 5, 'Excellent guide! Very knowledgeable about Ethiopian history.', '2024-01-15 10:30:00'),
        (2, 1, 300, 100, 'driver', 4, 'Safe driver, comfortable journey.', '2024-01-15 10:35:00'),
        (3, 2, 301, 201, 'tourguide', 5, 'Amazing trekking experience! Highly recommended.', '2024-01-20 14:20:00'),
        (4, 2, 301, 101, 'driver', 5, 'Professional and friendly driver.', '2024-01-20 14:25:00'),
        (5, 4, 300, 201, 'tourguide', 4, 'Great cultural insights and very patient.', '2024-02-12 09:15:00'),
        (6, 4, 300, 100, 'driver', 4, 'Reliable and punctual driver.', '2024-02-12 09:20:00')
      `)

      await connection.commit()

      // Check results
      const [bookingCount] = await connection.execute('SELECT COUNT(*) as count FROM bookings')
      const [customerCount] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "customer"')
      const [paymentCount] = await connection.execute('SELECT COUNT(*) as count FROM payments')
      const [ratingCount] = await connection.execute('SELECT COUNT(*) as count FROM ratings')

      return NextResponse.json({
        success: true,
        message: 'Sample data populated successfully',
        data: {
          bookings: bookingCount[0].count,
          customers: customerCount[0].count,
          payments: paymentCount[0].count,
          ratings: ratingCount[0].count
        }
      })

    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
    
  } catch (error) {
    console.error('Error populating sample data:', error)
    return NextResponse.json(
      { error: 'Failed to populate sample data', details: error.message },
      { status: 500 }
    )
  }
}
