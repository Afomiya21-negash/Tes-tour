import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { RatingService } from '@/lib/rating-service'

/**
 * POST /api/ratings/submit
 * Submit rating for a completed booking
 * 
 * Request body:
 * {
 *   booking_id: number
 *   rating_tourguide?: number (0-5)
 *   rating_driver?: number (0-5)
 *   review_tourguide?: string
 *   review_driver?: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || payload.role !== 'customer') {
      return NextResponse.json({ error: 'Only customers can submit ratings' }, { status: 403 })
    }

    const body = await req.json()
    const {
      booking_id,
      rating_tourguide,
      rating_driver,
      review_tourguide,
      review_driver
    } = body

    // Validate required fields
    if (!booking_id) {
      return NextResponse.json({ error: 'booking_id is required' }, { status: 400 })
    }

    // Validate rating values (0-5)
    if (rating_tourguide !== undefined && (rating_tourguide < 0 || rating_tourguide > 5)) {
      return NextResponse.json({ error: 'Tour guide rating must be between 0 and 5' }, { status: 400 })
    }

    if (rating_driver !== undefined && (rating_driver < 0 || rating_driver > 5)) {
      return NextResponse.json({ error: 'Driver rating must be between 0 and 5' }, { status: 400 })
    }

    // At least one rating must be provided
    if (!rating_tourguide && !rating_driver) {
      return NextResponse.json({ error: 'At least one rating (tour guide or driver) must be provided' }, { status: 400 })
    }

    console.log('Rating submission:', { booking_id, customer_id: payload.user_id, rating_tourguide, rating_driver })

    // Check if booking can be rated
    const canRate = await RatingService.canRateBooking(payload.user_id, booking_id)
    if (!canRate) {
      return NextResponse.json({ 
        error: 'Booking cannot be rated. It may not be completed, does not belong to you, or has already been rated.' 
      }, { status: 400 })
    }

    // Submit rating
    const result = await RatingService.submitRating(payload.user_id, {
      booking_id,
      rating_tourguide,
      rating_driver,
      review_tourguide,
      review_driver
    })

    console.log('Rating submitted successfully:', result)

    return NextResponse.json({
      success: true,
      message: 'Rating submitted successfully',
      rating_id: result.rating_id
    })

  } catch (error: any) {
    console.error('Rating submission error:', error)
    return NextResponse.json({ 
      error: 'Failed to submit rating', 
      details: error.message 
    }, { status: 500 })
  }
}

/**
 * GET /api/ratings/submit?booking_id=123
 * Check if a booking can be rated
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || payload.role !== 'customer') {
      return NextResponse.json({ error: 'Only customers can check rating status' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const booking_id = searchParams.get('booking_id')

    if (!booking_id) {
      return NextResponse.json({ error: 'booking_id is required' }, { status: 400 })
    }

    const canRate = await RatingService.canRateBooking(payload.user_id, parseInt(booking_id))
    const existingRating = await RatingService.getRatingByBooking(parseInt(booking_id))

    return NextResponse.json({
      can_rate: canRate,
      has_rating: !!existingRating,
      rating: existingRating
    })

  } catch (error: any) {
    console.error('Rating check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check rating status', 
      details: error.message 
    }, { status: 500 })
  }
}
