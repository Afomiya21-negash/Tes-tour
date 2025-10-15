import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'
import { verifyPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()
    
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 })
    }
    
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT user_id, username, email, password_hash, role, first_name, last_name FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, username]
    )
    
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ 
        found: false, 
        message: 'User not found',
        searchedFor: username
      })
    }
    
    const user = rows[0] as any
    const storedHash = user.password_hash
    
    // Test password verification
    let bcryptValid = false
    let plainTextValid = false
    
    try {
      if (storedHash && /^\$2[aby]\$/.test(storedHash)) {
        bcryptValid = await verifyPassword(password, storedHash)
      }
    } catch (e) {
      // Ignore bcrypt errors
    }
    
    plainTextValid = storedHash === password
    
    return NextResponse.json({
      found: true,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      },
      passwordInfo: {
        storedHash: storedHash,
        hashFormat: storedHash && /^\$2[aby]\$/.test(storedHash) ? 'bcrypt' : 'plaintext_or_other',
        providedPassword: password,
        bcryptValid,
        plainTextValid,
        hashLength: storedHash ? storedHash.length : 0
      }
    })
    
  } catch (error) {
    console.error('Debug user error:', error)
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    )
  }
}
