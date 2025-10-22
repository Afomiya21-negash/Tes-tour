import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    console.log('Debug vehicles API called')
    const pool = getPool()
    console.log('Got pool connection')
    
    const [rows] = await pool.query(
      'SELECT vehicle_id, driver_id, make, model, year, license_plate, capacity, daily_rate, picture FROM vehicles WHERE status IN ("available", "Available")'
    )
    console.log('Query executed, rows:', rows)

    const vehicles = (rows || []).map((row: any) => {
      console.log('Processing vehicle:', row)
      // Fix image path - remove 'tes' prefix and ensure it starts with '/'
      let imageUrl = row.picture
      if (imageUrl && imageUrl.startsWith('tes/public/images/')) {
        imageUrl = imageUrl.replace('tes/public/images/', '/images/')
      } else if (imageUrl && imageUrl.startsWith('tespublicimages')) {
        imageUrl = imageUrl.replace('tespublicimages', '/images/')
      } else if (imageUrl && !imageUrl.startsWith('/')) {
        imageUrl = '/images/' + imageUrl
      }

      return {
        id: row.vehicle_id,
        driverId: row.driver_id,
        make: row.make,
        model: row.model,
        year: row.year,
        licensePlate: row.license_plate,
        capacity: row.capacity,
        dailyRate: row.daily_rate,
        imageUrl: imageUrl
      }
    })

    console.log('Processed vehicles:', vehicles)
    return NextResponse.json(vehicles)
  } catch (e) {
    console.error('Error in debug vehicles API:', e)
    return NextResponse.json({ 
      error: e.message,
      stack: e.stack 
    }, { status: 500 })
  }
}
