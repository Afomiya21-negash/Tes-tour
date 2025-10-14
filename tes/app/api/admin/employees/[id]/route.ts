import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'

async function ensureAdmin(userId: number) {
  const pool = getPool()
  const [rows] = (await pool.query('SELECT role FROM users WHERE user_id = ? LIMIT 1', [userId])) as any
  if (!rows || rows.length === 0 || rows[0].role !== 'admin') {
    const err: any = new Error('Unauthorized')
    err.status = 403
    throw err
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get('auth_token')?.value
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    const payload = verifyJwt(token)
    if (!payload || !payload.user_id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

    const adminUserId = Number(payload.user_id)
    await ensureAdmin(adminUserId)

    const id = Number(params.id)
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ message: 'Invalid id' }, { status: 400 })
    }

    const pool = getPool()
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()

      // Ensure target is an employee and find role
      const [urows] = (await conn.query(
        'SELECT role FROM users WHERE user_id = ? LIMIT 1',
        [id]
      )) as any

      if (!urows || urows.length === 0) {
        await conn.rollback()
        return NextResponse.json({ message: 'Employee not found' }, { status: 404 })
      }

      const role: string = urows[0].role

      // Ensure there is an employee row
      const [erows] = (await conn.query(
        'SELECT employee_id FROM employees WHERE employee_id = ? LIMIT 1',
        [id]
      )) as any
      if (!erows || erows.length === 0) {
        await conn.rollback()
        return NextResponse.json({ message: 'Not an employee' }, { status: 404 })
      }

      // Clean up FK references based on role
      if (role === 'driver') {
        // Detach vehicles referencing this driver
        await conn.query('UPDATE vehicles SET driver_id = NULL WHERE driver_id = ?', [id])
        // Remove driver specific row
        await conn.query('DELETE FROM drivers WHERE driver_id = ?', [id])
      } else if (role === 'tourguide') {
        // Detach tours referencing this guide
        await conn.query('UPDATE tours SET tour_guide_id = NULL WHERE tour_guide_id = ?', [id])
        // Remove tourguide specific row
        await conn.query('DELETE FROM tourguides WHERE tour_guide_id = ?', [id])
      } else {
        // Generic employee (position/department only) – no role table cleanup
      }

      // Remove from employees
      await conn.query('DELETE FROM employees WHERE employee_id = ?', [id])

      // Finally remove user
      await conn.query('DELETE FROM users WHERE user_id = ?', [id])

      await conn.commit()
      return NextResponse.json({ ok: true }, { status: 200 })
    } catch (e) {
      try { await (conn as any).rollback() } catch {}
      throw e
    } finally {
      conn.release()
    }
  } catch (e: any) {
    const status = e?.status || 500
    const message = e?.message || 'Server error'
    return NextResponse.json({ message }, { status })
  }
}
