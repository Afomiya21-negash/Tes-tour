import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const pool = getPool()
    const [rows] = await pool.query(
      'SELECT vehicle_id, driver_id, make, model, year, license_plate, capacity, picture FROM vehicles WHERE status IN ("available", "Available")'
    )

    const vehicles = (rows || []).map((row: any) => {
      // Fix image path - remove 'tes' prefix and ensure it starts with '/'
      let imageUrl = row.picture
      if (imageUrl && imageUrl.startsWith('tes/public/images/')) {
        imageUrl = imageUrl.replace('tes/public/images/', '/images/')
      } else if (imageUrl && imageUrl.startsWith('tespublicimages')) {
        imageUrl = imageUrl.replace('tespublicimages', '/images/')
      } else if (imageUrl && !imageUrl.startsWith('/')) {
        imageUrl = '/images/' + imageUrl
      }

      // Set default daily rate based on vehicle type
      let dailyRate = 2500 // Default rate
      if (row.make === 'Toyota' && row.model === 'Coaster Bus') {
        dailyRate = 6000 // Bus rate
      } else if (row.make === 'Toyota' && row.model === 'V8') {
        dailyRate = 5000 // SUV rate
      } else if (row.make === 'Hyundai' && row.model === 'H1') {
        dailyRate = 4000 // Van rate
      } else if (row.make === 'Ford' && row.model === 'Pickup') {
        dailyRate = 3500 // Pickup rate
      }

      return {
        id: row.vehicle_id,
        driverId: row.driver_id,
        make: row.make,
        model: row.model,
        year: row.year,
        licensePlate: row.license_plate,
        capacity: row.capacity,
        dailyRate: dailyRate,
        imageUrl: imageUrl
      }
    })

    return NextResponse.json(vehicles)
  } catch (e) {
    console.error('Error fetching vehicles:', e)
    return NextResponse.json({ message: 'Server error', error: e.message }, { status: 500 })
  }
}
