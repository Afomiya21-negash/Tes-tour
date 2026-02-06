import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import { verifyJwt } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const pool = getPool()

    // Get all promotions with tour information
    const [promotions] = await pool.execute(`
      SELECT
        p.promoid,
        p.title,
        p.dis,
        p.date,
        p.end_date,
        p.tour_id,
        t.name as tour_name,
        t.description as tour_description,
        t.destination,
        t.duration_days,
        t.price
      FROM promotion p
      LEFT JOIN tours t ON p.tour_id = t.tour_id
      ORDER BY p.date DESC
    `) as any

    return NextResponse.json(promotions || [])
  } catch (error) {
    console.error('Error fetching promotions:', error)
    return NextResponse.json({ error: 'Failed to fetch promotions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decoded = verifyJwt(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const {
      tour_id,
      title,
      description,
      discount_percentage,
      discount_amount,
      start_date,
      end_date
    } = await request.json()

    if (!tour_id || !title) {
      return NextResponse.json({ error: 'Tour ID and title are required' }, { status: 400 })
    }

    // Validate tour exists and get tour price
    const pool = getPool()
    const [tourCheck] = await pool.execute(
      'SELECT tour_id, price FROM tours WHERE tour_id = ?',
      [tour_id]
    ) as any

    if (!tourCheck || tourCheck.length === 0) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    }

    const tourPrice = tourCheck[0].price || 0

    // Calculate discount percentage
    let discountValue = 0
    if (discount_percentage) {
      // If percentage is provided, use it directly
      discountValue = parseFloat(discount_percentage)
      if (discountValue > 100) {
        discountValue = 100 // Cap at 100%
      }
      if (discountValue < 0) {
        discountValue = 0
      }
    } else if (discount_amount && tourPrice > 0) {
      // If amount is provided, calculate percentage from tour price
      const amount = parseFloat(discount_amount)
      discountValue = (amount / tourPrice) * 100
      if (discountValue > 100) {
        discountValue = 100 // Cap at 100%
      }
      if (discountValue < 0) {
        discountValue = 0
      }
    }

    // Round to 2 decimal places
    discountValue = Math.round(discountValue * 100) / 100

    // Insert promotion
    const [result] = await pool.execute(`
      INSERT INTO promotion (
        tour_id,
        title,
        dis,
        date,
        end_date
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      tour_id,
      title || null,
      discountValue,
      start_date || new Date().toISOString().split('T')[0],
      end_date || null
    ]) as any

    return NextResponse.json({
      promoid: result.insertId,
      message: 'Promotion created successfully'
    })
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json({ error: 'Failed to create promotion' }, { status: 500 })
  }
}