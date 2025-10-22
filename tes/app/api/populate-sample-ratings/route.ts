import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const pool = getPool()
    
    // First, let's add missing driver entries
    await pool.execute(`
      INSERT IGNORE INTO drivers (driver_id, license_number, vehicle_type, rating) VALUES
      (6, 'DL12350', 'SUV', 4.3),
      (7, 'DL12351', 'Sedan', 4.7),
      (8, 'DL12352', 'Van', 4.4)
    `)
    
    // Check if we have any bookings to create ratings for
    const [bookingRows] = await pool.execute(
      'SELECT booking_id, user_id, driver_id FROM bookings WHERE driver_id IS NOT NULL LIMIT 5'
    )
    
    if (Array.isArray(bookingRows) && bookingRows.length > 0) {
      // Create sample ratings for existing bookings
      for (const booking of bookingRows) {
        const bookingData = booking as any
        
        // Add driver rating
        await pool.execute(`
          INSERT IGNORE INTO ratings (booking_id, customer_id, rated_user_id, rating_type, rating, comment, created_at)
          VALUES (?, ?, ?, 'driver', ?, ?, NOW())
        `, [
          bookingData.booking_id,
          bookingData.user_id,
          bookingData.driver_id,
          Math.floor(Math.random() * 2) + 4, // Random rating between 4-5
          'Great driver, very professional and safe!'
        ])
      }
    } else {
      // Create some sample bookings and ratings if none exist
      const [userRows] = await pool.execute(
        'SELECT user_id FROM users WHERE role = "customer" LIMIT 3'
      )
      
      const [driverRows] = await pool.execute(
        'SELECT user_id FROM users WHERE role = "driver" LIMIT 5'
      )
      
      const [tourRows] = await pool.execute(
        'SELECT tour_id FROM tours LIMIT 3'
      )
      
      const [vehicleRows] = await pool.execute(
        'SELECT vehicle_id, driver_id FROM vehicles WHERE driver_id IS NOT NULL LIMIT 3'
      )
      
      if (Array.isArray(userRows) && Array.isArray(driverRows) && 
          Array.isArray(tourRows) && Array.isArray(vehicleRows) &&
          userRows.length > 0 && driverRows.length > 0 && 
          tourRows.length > 0 && vehicleRows.length > 0) {
        
        // Create sample bookings
        for (let i = 0; i < 3; i++) {
          const customer = (userRows[i % userRows.length] as any).user_id
          const tour = (tourRows[i % tourRows.length] as any).tour_id
          const vehicle = vehicleRows[i % vehicleRows.length] as any
          
          const [bookingResult] = await pool.execute(`
            INSERT INTO bookings (user_id, tour_id, vehicle_id, driver_id, start_date, end_date, total_price, status, number_of_people)
            VALUES (?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY), DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, 'completed', ?)
          `, [
            customer,
            tour,
            vehicle.vehicle_id,
            vehicle.driver_id,
            i * 7, // Start date
            (i * 7) + 5, // End date
            2500 + (i * 500), // Price
            2 + i // Number of people
          ])
          
          const bookingId = (bookingResult as any).insertId
          
          // Add driver rating for this booking
          await pool.execute(`
            INSERT INTO ratings (booking_id, customer_id, rated_user_id, rating_type, rating, comment, created_at)
            VALUES (?, ?, ?, 'driver', ?, ?, NOW())
          `, [
            bookingId,
            customer,
            vehicle.driver_id,
            Math.floor(Math.random() * 2) + 4, // Random rating between 4-5
            `Excellent service! Driver was punctual and knowledgeable about the area.`
          ])
        }
      }
    }
    
    // Test the updated ratings
    const [updatedRatings] = await pool.execute(
      `SELECT 
        u.user_id,
        u.first_name,
        u.last_name,
        COALESCE(
          (
            SELECT AVG(r.rating)
            FROM ratings r
            WHERE r.rated_user_id = u.user_id AND LOWER(r.rating_type) = 'driver'
          ),
          (
            SELECT d.rating FROM drivers d WHERE d.driver_id = u.user_id LIMIT 1
          ),
          0
        ) AS average_rating,
        (
          SELECT COUNT(*)
          FROM ratings r
          WHERE r.rated_user_id = u.user_id AND LOWER(r.rating_type) = 'driver'
        ) AS rating_count
      FROM users u
      WHERE u.role = 'driver'
      ORDER BY average_rating DESC`
    )
    
    return NextResponse.json({
      success: true,
      message: 'Sample ratings populated successfully',
      updatedRatings: Array.isArray(updatedRatings) ? updatedRatings : []
    })
  } catch (error) {
    console.error('Error populating sample ratings:', error)
    return NextResponse.json(
      { error: 'Failed to populate sample ratings', details: error.message },
      { status: 500 }
    )
  }
}
