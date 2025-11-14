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

    if (result.success) {
      return NextResponse.json(
        { success: true, message: result.message },
        { status: 200 }
      )
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
