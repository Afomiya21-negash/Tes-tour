import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const pool = getPool()
    
    // Add image_url column if it doesn't exist
    try {
      await pool.execute(`
        ALTER TABLE vehicles 
        ADD COLUMN image_url VARCHAR(255) DEFAULT NULL
      `)
      console.log('Added image_url column to vehicles table')
    } catch (error) {
      // Column might already exist, ignore error
      console.log('image_url column may already exist')
    }

    // Update vehicles with images and make them all available
    const vehicleUpdates = [
      {
        id: 1,
        make: 'Toyota',
        model: 'Corolla',
        image: '/images/vehicles/toyota-corolla.jpg',
        status: 'available'
      },
      {
        id: 2,
        make: 'Hyundai',
        model: 'H1',
        image: '/images/vehicles/hyundai-h1.jpg',
        status: 'available'
      },
      {
        id: 3,
        make: 'Ford',
        model: 'Ranger',
        image: '/images/vehicles/ford-ranger.jpg',
        status: 'available'
      },
      {
        id: 4,
        make: 'Suzuki',
        model: 'Swift',
        image: '/images/vehicles/suzuki-swift.jpg',
        status: 'available'
      },
      {
        id: 5,
        make: 'Isuzu',
        model: 'D-Max',
        image: '/images/vehicles/isuzu-dmax.jpg',
        status: 'available'
      }
    ]

    for (const vehicle of vehicleUpdates) {
      await pool.execute(
        `UPDATE vehicles 
         SET image_url = ?, status = ? 
         WHERE vehicle_id = ?`,
        [vehicle.image, vehicle.status, vehicle.id]
      )
    }

    // Add more vehicles if needed
    const additionalVehicles = [
      {
        make: 'Toyota',
        model: 'Land Cruiser',
        year: 2020,
        license_plate: 'AB456EF',
        capacity: 8,
        daily_rate: 5000.00,
        image_url: '/images/vehicles/toyota-landcruiser.jpg',
        status: 'available'
      },
      {
        make: 'Nissan',
        model: 'Patrol',
        year: 2019,
        license_plate: 'CD789GH',
        capacity: 7,
        daily_rate: 4500.00,
        image_url: '/images/vehicles/nissan-patrol.jpg',
        status: 'available'
      },
      {
        make: 'Mitsubishi',
        model: 'Pajero',
        year: 2021,
        license_plate: 'IJ012KL',
        capacity: 7,
        daily_rate: 4200.00,
        image_url: '/images/vehicles/mitsubishi-pajero.jpg',
        status: 'available'
      }
    ]

    for (const vehicle of additionalVehicles) {
      await pool.execute(
        `INSERT INTO vehicles (make, model, year, license_plate, capacity, daily_rate, image_url, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [vehicle.make, vehicle.model, vehicle.year, vehicle.license_plate, 
         vehicle.capacity, vehicle.daily_rate, vehicle.image_url, vehicle.status]
      )
    }

    // Verify the data
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM vehicles WHERE status = "available"')
    const [allRows] = await pool.execute('SELECT vehicle_id, make, model, image_url, status FROM vehicles')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Vehicles populated successfully!',
      availableCount: rows[0].count,
      totalVehicles: allRows.length,
      vehicles: allRows
    })
  } catch (error) {
    console.error('Error populating vehicles:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
