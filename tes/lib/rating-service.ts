import { getPool } from './db'

/**
 * Rating Service for handling rating operations
 * Created: 2026-01-21
 * Updated: 2026-01-21 - Fixed database schema compatibility
 */
export class RatingService {
  /**
   * Submit a rating for a completed booking
   * @param userId - The ID of the user submitting the rating
   * @param ratingData - The rating data including booking_id and ratings
   * @returns The rating_id of the created rating
   */
  static async submitRating(userId: number, ratingData: {
    booking_id: number
    rating_tourguide?: number
    rating_driver?: number
    review_tourguide?: string
    review_driver?: string
  }): Promise<{ rating_id: number }> {
    const pool = getPool()
    const conn = await pool.getConnection()

    try {
      await conn.beginTransaction()

      // Get tour_guide_id and driver_id from the booking
      const [bookingRows] = (await conn.query(
        'SELECT tour_guide_id, driver_id FROM bookings WHERE booking_id = ? LIMIT 1',
        [ratingData.booking_id]
      )) as any

      if (!bookingRows || bookingRows.length === 0) {
        throw new Error('Booking not found')
      }

      const booking = bookingRows[0]

      // Check if rating already exists for this booking
      const [existingRatings] = (await conn.query(
        'SELECT rating_id FROM ratings WHERE booking_id = ? LIMIT 1',
        [ratingData.booking_id]
      )) as any

      let ratingId: number

      if (existingRatings && existingRatings.length > 0) {
        // Update existing rating
        ratingId = existingRatings[0].rating_id

        const updateFields: string[] = []
        const updateValues: any[] = []

        if (ratingData.rating_tourguide !== undefined) {
          updateFields.push('rating_tourguide = ?')
          updateValues.push(ratingData.rating_tourguide)
          updateFields.push('tour_guide_id = ?')
          updateValues.push(booking.tour_guide_id)
        }

        if (ratingData.rating_driver !== undefined) {
          updateFields.push('rating_driver = ?')
          updateValues.push(ratingData.rating_driver)
          updateFields.push('driver_id = ?')
          updateValues.push(booking.driver_id)
        }

        if (ratingData.review_tourguide !== undefined) {
          updateFields.push('review_tourguide = ?')
          updateValues.push(ratingData.review_tourguide)
        }

        if (ratingData.review_driver !== undefined) {
          updateFields.push('review_driver = ?')
          updateValues.push(ratingData.review_driver)
        }

        if (updateFields.length > 0) {
          updateValues.push(ratingId)
          await conn.query(
            `UPDATE ratings SET ${updateFields.join(', ')} WHERE rating_id = ?`,
            updateValues
          )
        }
      } else {
        // Insert new rating
        const [result] = (await conn.query(
          `INSERT INTO ratings (
            booking_id,
            customer_id,
            tour_guide_id,
            driver_id,
            rating_tourguide,
            rating_driver,
            review_tourguide,
            review_driver,
            created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            ratingData.booking_id,
            userId,
            booking.tour_guide_id || null,
            booking.driver_id || null,
            ratingData.rating_tourguide || null,
            ratingData.rating_driver || null,
            ratingData.review_tourguide || null,
            ratingData.review_driver || null
          ]
        )) as any

        ratingId = result.insertId
      }

      // Calculate and update average rating for tour guide
      if (ratingData.rating_tourguide !== undefined && booking.tour_guide_id) {
        await this.updateTourGuideAverageRating(conn, booking.tour_guide_id)
      }

      // Calculate and update average rating for driver
      if (ratingData.rating_driver !== undefined && booking.driver_id) {
        await this.updateDriverAverageRating(conn, booking.driver_id)
      }

      await conn.commit()

      return { rating_id: ratingId }
    } catch (error) {
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }
  }

  /**
   * Update the average rating for a tour guide
   * @param conn - Database connection
   * @param tourGuideId - The ID of the tour guide
   */
  private static async updateTourGuideAverageRating(conn: any, tourGuideId: number): Promise<void> {
    // Calculate average rating from all ratings for this tour guide
    const [avgResult] = (await conn.query(
      `SELECT
        AVG(rating_tourguide) as avg_rating,
        COUNT(*) as total_ratings
      FROM ratings
      WHERE tour_guide_id = ? AND rating_tourguide IS NOT NULL`,
      [tourGuideId]
    )) as any

    if (avgResult && avgResult.length > 0) {
      const avgRating = Number(avgResult[0].avg_rating) || 0
      const totalRatings = Number(avgResult[0].total_ratings) || 0

      // Update the tourguides table with the new average rating
      await conn.query(
        `UPDATE tourguides
         SET rating = ?, total_ratings = ?
         WHERE tour_guide_id = ?`,
        [avgRating, totalRatings, tourGuideId]
      )
    }
  }

  /**
   * Update the average rating for a driver
   * @param conn - Database connection
   * @param driverId - The ID of the driver
   */
  private static async updateDriverAverageRating(conn: any, driverId: number): Promise<void> {
    // Calculate average rating from all ratings for this driver
    const [avgResult] = (await conn.query(
      `SELECT
        AVG(rating_driver) as avg_rating,
        COUNT(*) as total_ratings
      FROM ratings
      WHERE driver_id = ? AND rating_driver IS NOT NULL`,
      [driverId]
    )) as any

    if (avgResult && avgResult.length > 0) {
      const avgRating = Number(avgResult[0].avg_rating) || 0
      const totalRatings = Number(avgResult[0].total_ratings) || 0

      // Update the drivers table with the new average rating
      await conn.query(
        `UPDATE drivers
         SET rating = ?, total_ratings = ?
         WHERE driver_id = ?`,
        [avgRating, totalRatings, driverId]
      )
    }
  }

  /**
   * Check if a booking can be rated by the user
   * @param userId - The ID of the user
   * @param bookingId - The ID of the booking
   * @returns true if the booking can be rated, false otherwise
   */
  static async canRateBooking(userId: number, bookingId: number): Promise<boolean> {
    const pool = getPool()

    // Check if booking exists, belongs to user, and is completed
    const [bookingRows] = (await pool.query(
      'SELECT status FROM bookings WHERE booking_id = ? AND user_id = ? LIMIT 1',
      [bookingId, userId]
    )) as any

    if (!bookingRows || bookingRows.length === 0) {
      return false
    }

    const { status } = bookingRows[0]
    if (status !== 'completed') {
      return false
    }

    // Check if rating already exists
    const [ratingRows] = (await pool.query(
      'SELECT rating_id FROM ratings WHERE booking_id = ? LIMIT 1',
      [bookingId]
    )) as any

    return !ratingRows || ratingRows.length === 0
  }
}

