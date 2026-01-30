import { getPool } from '@/lib/db'

// Location Tracking Types
export type UserType = 'customer' | 'tourguide' | 'driver'

export interface LocationData {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  speed?: number
  heading?: number
  timestamp?: Date
}

export interface LocationUpdate extends LocationData {
  booking_id: number
}

export interface TrackingParticipant {
  user_id: number
  user_type: UserType
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  latest_location?: LocationData
}

export class LocationTrackingService {
  static async updateLocation(
    userId: number,
    userType: UserType,
    locationData: LocationUpdate
  ): Promise<{ location_id: number }> {
    const pool = getPool()
    const { booking_id, latitude, longitude, accuracy, altitude, speed, heading } = locationData

    // Check if a location record already exists for this user and booking
    const [existing] = await pool.execute(
      `SELECT location_id FROM location_tracking 
       WHERE booking_id = ? AND user_id = ? AND user_type = ?
       LIMIT 1`,
      [booking_id, userId, userType]
    ) as any

    if (existing && existing.length > 0) {
      // UPDATE existing record
      await pool.execute(
        `UPDATE location_tracking 
         SET latitude = ?, longitude = ?, accuracy = ?, altitude = ?, speed = ?, heading = ?, timestamp = NOW()
         WHERE booking_id = ? AND user_id = ? AND user_type = ?`,
        [latitude, longitude, accuracy || null, altitude || null, speed || null, heading || null, booking_id, userId, userType]
      )
      return { location_id: existing[0].location_id }
    } else {
      // INSERT new record
      const [result] = await pool.execute(
        `INSERT INTO location_tracking 
          (booking_id, user_id, user_type, latitude, longitude, accuracy, altitude, speed, heading, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [booking_id, userId, userType, latitude, longitude, accuracy || null, altitude || null, speed || null, heading || null]
      ) as any
      return { location_id: result.insertId }
    }
  }

  static async getBookingLocations(
    bookingId: number,
    requestingUserId: number
  ): Promise<TrackingParticipant[]> {
    const pool = getPool()

    const [participants] = await pool.execute(
      `SELECT DISTINCT
        u.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number,
        CASE
          WHEN b.user_id = u.user_id THEN 'customer'
          WHEN b.tour_guide_id = u.user_id THEN 'tourguide'
          WHEN b.driver_id = u.user_id THEN 'driver'
        END as user_type
      FROM bookings b
      JOIN users u ON (
        u.user_id = b.user_id OR 
        u.user_id = b.tour_guide_id OR 
        u.user_id = b.driver_id
      )
      WHERE b.booking_id = ?
        AND (u.user_id = b.user_id OR u.user_id = b.tour_guide_id OR u.user_id = b.driver_id)`,
      [bookingId]
    ) as any

    const participantsWithLocations = await Promise.all(
      (participants || []).map(async (participant: any) => {
        const [locations] = await pool.execute(
          `SELECT latitude, longitude, accuracy, altitude, speed, heading, timestamp
          FROM location_tracking
          WHERE booking_id = ? AND user_id = ?
          ORDER BY timestamp DESC
          LIMIT 1`,
          [bookingId, participant.user_id]
        ) as any

        return {
          user_id: participant.user_id,
          user_type: participant.user_type,
          first_name: participant.first_name,
          last_name: participant.last_name,
          email: participant.email,
          phone_number: participant.phone_number,
          latest_location: locations && locations.length > 0 ? {
            latitude: parseFloat(locations[0].latitude),
            longitude: parseFloat(locations[0].longitude),
            accuracy: locations[0].accuracy ? parseFloat(locations[0].accuracy) : undefined,
            altitude: locations[0].altitude ? parseFloat(locations[0].altitude) : undefined,
            speed: locations[0].speed ? parseFloat(locations[0].speed) : undefined,
            heading: locations[0].heading ? parseFloat(locations[0].heading) : undefined,
            timestamp: locations[0].timestamp
          } : undefined
        }
      })
    )

    return participantsWithLocations
  }

  static async getLocationHistory(
    bookingId: number,
    userId: number,
    limit: number = 100
  ): Promise<LocationData[]> {
    const pool = getPool()

    const [locations] = await pool.execute(
      `SELECT latitude, longitude, accuracy, altitude, speed, heading, timestamp
      FROM location_tracking
      WHERE booking_id = ? AND user_id = ?
      ORDER BY timestamp DESC
      LIMIT ?`,
      [bookingId, userId, limit]
    ) as any

    return (locations || []).map((loc: any) => ({
      latitude: parseFloat(loc.latitude),
      longitude: parseFloat(loc.longitude),
      accuracy: loc.accuracy ? parseFloat(loc.accuracy) : undefined,
      altitude: loc.altitude ? parseFloat(loc.altitude) : undefined,
      speed: loc.speed ? parseFloat(loc.speed) : undefined,
      heading: loc.heading ? parseFloat(loc.heading) : undefined,
      timestamp: loc.timestamp
    }))
  }

  static async cleanupOldLocations(): Promise<{ deleted_count: number }> {
    const pool = getPool()

    const [result] = await pool.execute(
      `DELETE FROM location_tracking 
      WHERE timestamp < DATE_SUB(NOW(), INTERVAL 30 DAY)`
    ) as any

    return { deleted_count: result.affectedRows || 0 }
  }
}

