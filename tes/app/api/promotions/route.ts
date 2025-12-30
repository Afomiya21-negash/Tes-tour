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
        p.dis,
        p.date,
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

    // Validate tour exists
    const pool = getPool()
    const [tourCheck] = await pool.execute(
      'SELECT tour_id FROM tours WHERE tour_id = ?',
      [tour_id]
    ) as any

    if (!tourCheck || tourCheck.length === 0) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 })
    }

    // Validate discount value (decimal(5,2) means max 999.99)
    let discountValue = discount_percentage || discount_amount || 0
    if (discountValue > 99.99) {
      discountValue = 99.99 // Cap at 99.99%
    }
    if (discountValue < 0) {
      discountValue = 0
    }

    // Insert promotion
    const [result] = await pool.execute(`
      INSERT INTO promotion (
        tour_id,
        dis,
        date
      ) VALUES (?, ?, ?)
    `, [
      tour_id,
      discountValue,
      start_date || new Date().toISOString().split('T')[0]
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