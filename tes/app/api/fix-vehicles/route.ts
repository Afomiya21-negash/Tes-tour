import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const pool = getPool()
    
    // Update existing vehicles with proper image paths and make them available
    const vehicleUpdates = [
      {
        id: 10,
        make: 'Hyundai',
        model: 'Elantra',
        image: '/images/hyundai.webp',
        status: 'Available'
      },
      {
        id: 11,
        make: 'Ford',
        model: 'Pickup',
        image: '/images/ford pickup.webp',
        status: 'Available'
      },
      {
        id: 18,
        make: 'Toyota',
        model: 'Mark 2',
        image: '/images/mark2.webp',
        status: 'Available'
      },
      {
        id: 19,
        make: 'Toyota',
        model: 'Coaster Bus',
        image: '/images/coaster bus.webp',
        status: 'Available'
      },
      {
        id: 20,
        make: 'Toyota',
        model: 'V8',
        image: '/images/toyota v8.webp',
        status: 'Available'
      }
    ]

    for (const vehicle of vehicleUpdates) {
      await pool.execute(
        `UPDATE vehicles 
         SET picture = ?, status = ? 
         WHERE vehicle_id = ?`,
        [vehicle.image, vehicle.status, vehicle.id]
      )
    }

    // Add more vehicles with images from the vehicles folder
    const additionalVehicles = [
      {
        make: 'Toyota',
        model: 'Corolla',
        year: 2018,
        license_plate: 'AB123CD',
        capacity: 4,
        daily_rate: 2500.00,
        picture: '/images/vehicles/toyota-corolla.jpg',
        status: 'Available'
      },
      {
        make: 'Hyundai',
        model: 'H1',
        year: 2020,
        license_plate: 'EF456GH',
        capacity: 8,
        daily_rate: 4000.00,
        picture: '/images/vehicles/hyundai-h1.jpg',
        status: 'Available'
      },
      {
        make: 'Ford',
        model: 'Ranger',
        year: 2022,
        license_plate: 'IJ789KL',
        capacity: 5,
        daily_rate: 3500.00,
        picture: '/images/vehicles/ford-ranger.jpg',
        status: 'Available'
      },
      {
        make: 'Suzuki',
        model: 'Swift',
        year: 2019,
        license_plate: 'MN012OP',
        capacity: 4,
        daily_rate: 2300.00,
        picture: '/images/vehicles/suzuki-swift.jpg',
        status: 'Available'
      },
      {
        make: 'Isuzu',
        model: 'D-Max',
        year: 2021,
        license_plate: 'QR345ST',
        capacity: 2,
        daily_rate: 3800.00,
        picture: '/images/vehicles/isuzu-dmax.jpg',
        status: 'Available'
      }
    ]

    for (const vehicle of additionalVehicles) {
      // Check if vehicle already exists
      const [existing] = await pool.execute(
        'SELECT vehicle_id FROM vehicles WHERE license_plate = ?',
        [vehicle.license_plate]
      )

      if (existing.length === 0) {
        await pool.execute(
          `INSERT INTO vehicles (make, model, year, license_plate, capacity, daily_rate, picture, status) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [vehicle.make, vehicle.model, vehicle.year, vehicle.license_plate, 
           vehicle.capacity, vehicle.daily_rate, vehicle.picture, vehicle.status]
        )
      } else {
        // Update existing vehicle
        await pool.execute(
          `UPDATE vehicles 
           SET picture = ?, status = ? 
           WHERE license_plate = ?`,
          [vehicle.picture, vehicle.status, vehicle.license_plate]
        )
      }
    }

    // Make sure all vehicles are available
    await pool.execute(`UPDATE vehicles SET status = 'Available'`)

    // Verify the data
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM vehicles WHERE status = "Available"')
    const [allVehicles] = await pool.execute('SELECT vehicle_id, make, model, picture, status FROM vehicles')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Vehicles fixed successfully!',
      availableCount: rows[0].count,
      totalVehicles: allVehicles.length,
      vehicles: allVehicles
    })
  } catch (error) {
    console.error('Error fixing vehicles:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
