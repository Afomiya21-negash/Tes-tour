import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { BookingService } from '@/lib/domain'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const payload = verifyJwt(token)
    if (!payload || !payload.user_id || payload.role !== 'customer') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const tourId = formData.get('tourId') as string
    const vehicleId = formData.get('vehicleId') as string
    const driverId = formData.get('driverId') as string
    const startDate = formData.get('startDate') as string
    const endDate = formData.get('endDate') as string
    const totalPrice = parseFloat(formData.get('totalPrice') as string)
    const peopleCount = parseInt(formData.get('peopleCount') as string)
    const specialRequests = formData.get('specialRequests') as string
    const customerName = formData.get('customerName') as string
    const customerPhone = formData.get('customerPhone') as string

    if (!startDate || !endDate || !totalPrice || !peopleCount) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    if (!tourId && !vehicleId) {
      return NextResponse.json({ message: 'Either tour or vehicle must be specified' }, { status: 400 })
    }

    // Handle file uploads
    const idPictures: string[] = []
    for (let i = 0; i < 3; i++) {
      const file = formData.get(`idPicture${i}`) as File
      if (file) {
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'id-pictures')
        try {
          await mkdir(uploadsDir, { recursive: true })
        } catch (e) {
          // Directory might already exist
        }

        // Generate unique filename
        const fileName = `${Date.now()}-${i}-${file.name}`
        const filePath = join(uploadsDir, fileName)

        // Save file
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        // Store relative path for database
        idPictures.push(`/uploads/id-pictures/${fileName}`)
      }
    }

    const booking = await BookingService.createBooking({
      userId: payload.user_id,
      tourId: tourId ? parseInt(tourId) : null,
      vehicleId: vehicleId ? parseInt(vehicleId) : null,
      driverId: driverId ? parseInt(driverId) : null,
      startDate,
      endDate,
      totalPrice,
      peopleCount,
      specialRequests,
      customerName,
      customerPhone,
      idPictures: idPictures.length > 0 ? JSON.stringify(idPictures) : null
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (e: any) {
    console.error('Error creating booking:', e)
    return NextResponse.json({
      message: e.message || 'Server error'
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    
    const payload = verifyJwt(token)
    if (!payload || !payload.user_id || payload.role !== 'customer') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    
    const bookings = await BookingService.getUserBookings(payload.user_id)
    return NextResponse.json(bookings)
  } catch (e) {
    console.error('Error fetching bookings:', e)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
