import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { LocationTrackingService, UserType } from '@/lib/domain'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || !payload.user_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { booking_id, latitude, longitude, accuracy, altitude, speed, heading } = body

    if (!booking_id || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: booking_id, latitude, longitude' },
        { status: 400 }
      )
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    // Determine user type from role
    let userType: UserType
    if (payload.role === 'customer') {
      userType = 'customer'
    } else if (payload.role === 'tourguide') {
      userType = 'tourguide'
    } else if (payload.role === 'driver') {
      userType = 'driver'
    } else {
      return NextResponse.json(
        { error: 'Invalid user role for location tracking' },
        { status: 403 }
      )
    }

    const result = await LocationTrackingService.updateLocation(
      payload.user_id,
      userType,
      {
        booking_id: parseInt(booking_id),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy ? parseFloat(accuracy) : undefined,
        altitude: altitude ? parseFloat(altitude) : undefined,
        speed: speed ? parseFloat(speed) : undefined,
        heading: heading ? parseFloat(heading) : undefined
      }
    )

    return NextResponse.json({
      success: true,
      location_id: result.location_id,
      message: 'Location updated successfully'
    })
  } catch (error: any) {
    console.error('Error updating location:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update location' },
      { status: 500 }
    )
  }
}
