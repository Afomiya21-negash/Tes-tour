import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

// PUT /api/change-requests/[id] - Process change request (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const decoded = verifyJwt(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const adminUserId = Number(decoded.user_id)
    const requestId = parseInt(params.id)
    const body = await request.json()
    const { status, new_tour_guide_id, new_driver_id } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either approved or rejected' },
        { status: 400 }
      )
    }

    const pool = getPool()
    const conn = await pool.getConnection()

    try {
      await conn.beginTransaction()

      // Get the change request
      const [requestRows] = await conn.execute(
        `SELECT cr.*, b.booking_id, b.tour_guide_id as current_booking_guide, b.driver_id as current_booking_driver
         FROM change_requests cr
         JOIN bookings b ON cr.booking_id = b.booking_id
         WHERE cr.request_id = ?`,
        [requestId]
      ) as any

      if (!requestRows || requestRows.length === 0) {
        await conn.rollback()
        return NextResponse.json({ error: 'Change request not found' }, { status: 404 })
      }

      const changeRequest = requestRows[0]

      if (changeRequest.status !== 'pending') {
        await conn.rollback()
        return NextResponse.json(
          { error: `Request already ${changeRequest.status}` },
          { status: 400 }
        )
      }

      if (status === 'rejected') {
        // Simply mark as rejected
        await conn.execute(
          `UPDATE change_requests 
           SET status = 'rejected', processed_at = NOW(), processed_by = ?
           WHERE request_id = ?`,
          [adminUserId, requestId]
        )
        await conn.commit()
        return NextResponse.json({ success: true, message: 'Request rejected' })
      }

      // Status is 'approved' - need to assign new guide/driver
      const requestType = changeRequest.request_type

      if (requestType === 'tour_guide' || requestType === 'both') {
        if (!new_tour_guide_id) {
          await conn.rollback()
          return NextResponse.json(
            { error: 'new_tour_guide_id is required for this request type' },
            { status: 400 }
          )
        }
        
        // Update booking with new tour guide
        await conn.execute(
          `UPDATE bookings SET tour_guide_id = ? WHERE booking_id = ?`,
          [new_tour_guide_id, changeRequest.booking_id]
        )
      }

      if (requestType === 'driver' || requestType === 'both') {
        if (!new_driver_id) {
          await conn.rollback()
          return NextResponse.json(
            { error: 'new_driver_id is required for this request type' },
            { status: 400 }
          )
        }
        
        // Update booking with new driver
        await conn.execute(
          `UPDATE bookings SET driver_id = ? WHERE booking_id = ?`,
          [new_driver_id, changeRequest.booking_id]
        )
      }

      // Update change request
      await conn.execute(
        `UPDATE change_requests 
         SET status = 'completed', 
             new_tour_guide_id = ?,
             new_driver_id = ?,
             processed_at = NOW(), 
             processed_by = ?
         WHERE request_id = ?`,
        [new_tour_guide_id || null, new_driver_id || null, adminUserId, requestId]
      )

      await conn.commit()

      return NextResponse.json({
        success: true,
        message: 'Change request approved and assignments updated'
      })

    } catch (error) {
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }

  } catch (error) {
    console.error('Error processing change request:', error)
    return NextResponse.json({ error: 'Failed to process change request' }, { status: 500 })
  }
}

// DELETE /api/change-requests/[id] - Cancel change request (customer only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth_token')?.value || request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    const decoded = verifyJwt(token)
    if (!decoded || decoded.role !== 'customer') {
      return NextResponse.json({ error: 'Customer access required' }, { status: 403 })
    }

    const userId = Number(decoded.user_id)
    const requestId = parseInt(params.id)
    const pool = getPool()

    // Verify request belongs to customer and is pending
    const [result] = await pool.execute(
      `DELETE FROM change_requests 
       WHERE request_id = ? AND user_id = ? AND status = 'pending'`,
      [requestId, userId]
    ) as any

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: 'Request not found or cannot be cancelled' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Request cancelled' })

  } catch (error) {
    console.error('Error cancelling change request:', error)
    return NextResponse.json({ error: 'Failed to cancel request' }, { status: 500 })
  }
}
