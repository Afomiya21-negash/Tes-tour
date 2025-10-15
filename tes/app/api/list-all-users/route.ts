import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT user_id, username, email, role, first_name, last_name, password_hash FROM users ORDER BY user_id DESC'
    )
    
    const users = Array.isArray(rows) ? rows.map((user: any) => ({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      password_hash_type: user.password_hash && /^\$2[aby]\$/.test(user.password_hash) ? 'bcrypt' : 'plaintext',
      password_hash_length: user.password_hash ? user.password_hash.length : 0,
      password_hash_preview: user.password_hash ? user.password_hash.substring(0, 20) + '...' : null
    })) : []
    
    return NextResponse.json({
      success: true,
      count: users.length,
      users: users
    })
    
  } catch (error) {
    console.error('List users error:', error)
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    )
  }
}
