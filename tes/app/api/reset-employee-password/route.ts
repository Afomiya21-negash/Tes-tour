import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, newPassword } = await request.json()
    
    if (!username || !newPassword) {
      return NextResponse.json({ error: 'Username and newPassword required' }, { status: 400 })
    }
    
    const pool = getPool()
    
    // Check if user exists
    const [userRows] = await pool.execute(
      'SELECT user_id, username, role FROM users WHERE username = ? LIMIT 1',
      [username]
    )
    
    if (!Array.isArray(userRows) || userRows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const user = userRows[0] as any
    
    // Hash the new password
    const hashedPassword = await hashPassword(newPassword)
    
    // Update the password
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE user_id = ?',
      [hashedPassword, user.user_id]
    )
    
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully',
      user: {
        user_id: user.user_id,
        username: user.username,
        role: user.role
      },
      newPassword: newPassword
    })
    
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    )
  }
}
