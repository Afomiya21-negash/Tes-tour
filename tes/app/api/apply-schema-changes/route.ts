import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const pool = getPool()
    
    // Check if tour_guide_id column already exists
    const [columns] = await pool.execute(
      "SHOW COLUMNS FROM bookings LIKE 'tour_guide_id'"
    )
    
    if (!Array.isArray(columns) || columns.length === 0) {
      // Add tour_guide_id column to bookings table
      await pool.execute(
        'ALTER TABLE bookings ADD COLUMN tour_guide_id INT(11) DEFAULT NULL'
      )
      
      // Add foreign key constraint
      await pool.execute(`
        ALTER TABLE bookings ADD CONSTRAINT fk_booking_tourguide 
        FOREIGN KEY (tour_guide_id) REFERENCES users(user_id) ON DELETE SET NULL
      `)
      
      // Update existing bookings to have tour guides assigned based on the tour's tour_guide_id
      await pool.execute(`
        UPDATE bookings b 
        JOIN tours t ON b.tour_id = t.tour_id 
        SET b.tour_guide_id = t.tour_guide_id 
        WHERE t.tour_guide_id IS NOT NULL
      `)
    }
    
    // Check if image_url column exists in vehicles table
    const [vehicleColumns] = await pool.execute(
      "SHOW COLUMNS FROM vehicles LIKE 'image_url'"
    )
    
    if (!Array.isArray(vehicleColumns) || vehicleColumns.length === 0) {
      // Add image_url column to vehicles table
      await pool.execute(
        'ALTER TABLE vehicles ADD COLUMN image_url VARCHAR(255) DEFAULT NULL'
      )
      
      // Update vehicles with sample images
      await pool.execute(`
        UPDATE vehicles SET image_url = '/images/vehicles/toyota-corolla.jpg' WHERE vehicle_id = 1
      `)
      await pool.execute(`
        UPDATE vehicles SET image_url = '/images/vehicles/hyundai-h1.jpg' WHERE vehicle_id = 2
      `)
      await pool.execute(`
        UPDATE vehicles SET image_url = '/images/vehicles/ford-ranger.jpg' WHERE vehicle_id = 3
      `)
      await pool.execute(`
        UPDATE vehicles SET image_url = '/images/vehicles/suzuki-swift.jpg' WHERE vehicle_id = 4
      `)
      await pool.execute(`
        UPDATE vehicles SET image_url = '/images/vehicles/isuzu-dmax.jpg' WHERE vehicle_id = 5
      `)
    }
    
    // Test the updated schema
    const [testBookings] = await pool.execute(`
      SELECT 
        b.booking_id,
        b.tour_guide_id,
        tg.first_name as tour_guide_name,
        b.driver_id,
        d.first_name as driver_name,
        v.image_url
      FROM bookings b
      LEFT JOIN users tg ON b.tour_guide_id = tg.user_id
      LEFT JOIN users d ON b.driver_id = d.user_id
      LEFT JOIN vehicles v ON b.vehicle_id = v.vehicle_id
      LIMIT 5
    `)
    
    return NextResponse.json({
      success: true,
      message: 'Schema changes applied successfully',
      testData: Array.isArray(testBookings) ? testBookings : []
    })
  } catch (error) {
    console.error('Error applying schema changes:', error)
    return NextResponse.json(
      { error: 'Failed to apply schema changes', details: error.message },
      { status: 500 }
    )
  }
}
