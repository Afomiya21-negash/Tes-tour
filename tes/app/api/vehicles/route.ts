import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const pool = getPool()
    
    // Get date filters from query parameters for checking availability
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = `
      SELECT 
        v.vehicle_id, 
        v.make, 
        v.model, 
        v.year, 
        v.license_plate, 
        v.capacity, 
        v.picture
      FROM vehicles v
      WHERE v.status IN ("available", "Available")
    `
    
    const params: any[] = []

    // Exclude vehicles that are already booked during this period
    // Only exclude active bookings (confirmed, in-progress, pending)
    // Completed and cancelled bookings are available again
    if (startDate && endDate) {
      query += `
        AND v.vehicle_id NOT IN (
          SELECT DISTINCT b.vehicle_id
          FROM bookings b
          WHERE b.vehicle_id IS NOT NULL
            AND b.status IN ('confirmed', 'in-progress', 'pending')
            AND b.start_date <= ?
            AND b.end_date >= ?
        )
      `
      params.push(endDate, startDate)
    }

    const [rows] = await pool.query(query, params)

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
  } catch (e: any) {
    console.error('Error fetching vehicles:', e)
    return NextResponse.json({ message: 'Server error', error: e?.message || 'Unknown error' }, { status: 500 })
  }
}
