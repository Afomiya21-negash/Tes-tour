import { NextRequest, NextResponse } from 'next/server'
import { resendVerificationToken, sendVerificationEmail } from '@/lib/email-verification'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const result = await resendVerificationToken(email)

    if (result.success && result.token) {
      // Actually send the verification email
      try {
        // Get user role from database
        const { getPool } = await import('@/lib/db')
        const pool = getPool()
        const [rows] = (await pool.query(
          `SELECT role FROM users WHERE email = ? LIMIT 1`,
          [email]
        )) as any
        
        const role = rows && rows.length > 0 ? rows[0].role : 'customer'
        await sendVerificationEmail(email, result.token, role)
        
        return NextResponse.json(
          { success: true, message: 'Verification email sent! Please check your inbox.' },
          { status: 200 }
        )
      } catch (emailError: any) {
        console.error('Error sending verification email:', emailError)
        return NextResponse.json(
          { success: false, message: `Token generated but failed to send email: ${emailError.message}` },
          { status: 500 }
        )
      }
    } else {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { success: false, message: 'Server error while resending verification email' },
      { status: 500 }
    )
  }
}
