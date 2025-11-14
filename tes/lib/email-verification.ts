import crypto from 'crypto'
import { getPool } from './db'
import nodemailer from 'nodemailer'

/**
 * Generate a random verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Store verification token in database
 * Token expires in 24 hours
 */
export async function storeVerificationToken(userId: number, token: string): Promise<void> {
  const pool = getPool()
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour expiry

  await pool.query(
    `UPDATE users 
     SET verification_token = ?, 
         verification_token_expires = ?,
         email_verified = FALSE
     WHERE user_id = ?`,
    [token, expiresAt, userId]
  )
}

/**
 * Verify email using token
 * Returns true if verification successful, false otherwise
 */
export async function verifyEmailToken(token: string): Promise<{ success: boolean; message: string; userId?: number }> {
  const pool = getPool()
  
  try {
    const [rows] = (await pool.query(
      `SELECT user_id, email, verification_token_expires, email_verified 
       FROM users 
       WHERE verification_token = ? 
       LIMIT 1`,
      [token]
    )) as any

    if (!rows || rows.length === 0) {
      return { success: false, message: 'Invalid verification token' }
    }

    const user = rows[0]

    // Check if already verified
    if (user.email_verified) {
      return { success: false, message: 'Email already verified' }
    }

    // Check if token expired
    const now = new Date()
    const expiresAt = new Date(user.verification_token_expires)
    
    if (now > expiresAt) {
      return { success: false, message: 'Verification token has expired' }
    }

    // Mark email as verified and clear token
    await pool.query(
      `UPDATE users 
       SET email_verified = TRUE,
           verification_token = NULL,
           verification_token_expires = NULL
       WHERE user_id = ?`,
      [user.user_id]
    )

    return { 
      success: true, 
      message: 'Email verified successfully',
      userId: user.user_id
    }
  } catch (error) {
    console.error('Email verification error:', error)
    return { success: false, message: 'Verification failed due to server error' }
  }
}

/**
 * Resend verification token (generates new token)
 */
export async function resendVerificationToken(email: string): Promise<{ success: boolean; message: string; token?: string }> {
  const pool = getPool()
  
  try {
    const [rows] = (await pool.query(
      `SELECT user_id, email_verified 
       FROM users 
       WHERE email = ? 
       LIMIT 1`,
      [email]
    )) as any

    if (!rows || rows.length === 0) {
      return { success: false, message: 'Email not found' }
    }

    const user = rows[0]

    if (user.email_verified) {
      return { success: false, message: 'Email already verified' }
    }

    // Generate new token
    const token = generateVerificationToken()
    await storeVerificationToken(user.user_id, token)

    return { 
      success: true, 
      message: 'Verification email resent',
      token
    }
  } catch (error) {
    console.error('Resend verification error:', error)
    return { success: false, message: 'Failed to resend verification email' }
  }
}

/**
 * Check if user's email is verified
 */
export async function isEmailVerified(userId: number): Promise<boolean> {
  const pool = getPool()
  
  try {
    const [rows] = (await pool.query(
      `SELECT email_verified FROM users WHERE user_id = ? LIMIT 1`,
      [userId]
    )) as any

    if (!rows || rows.length === 0) {
      return false
    }

    return Boolean(rows[0].email_verified)
  } catch (error) {
    console.error('Check email verification error:', error)
    return false
  }
}

// Create email transporter
// Option 1: Use Gmail (requires App Password)
// Option 2: Use Mailtrap for testing (recommended for development)
function createTransporter() {
  // For Gmail: Set up an App Password at https://myaccount.google.com/apppasswords
  // Then set GMAIL_USER and GMAIL_APP_PASSWORD in your .env.local
  
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    })
  }
  
  // Fallback to Mailtrap for testing
  // Sign up at https://mailtrap.io/ and get your credentials
  if (process.env.MAILTRAP_USER && process.env.MAILTRAP_PASS) {
    return nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
      }
    })
  }
  
  // If no credentials, return null (will fallback to console logging)
  return null
}

// Send verification email
export async function sendVerificationEmail(email: string, token: string, role: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-email?token=${token}`
  
  const transporter = createTransporter()
  
  if (!transporter) {
    // Fallback to console logging if no email service configured
    logVerificationEmail(email, token, role)
    return
  }
  
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Tes Tour" <noreply@testour.com>',
      to: email,
      subject: 'Verify Your Email - Tes Tour',
      text: `Welcome to Tes Tour!\n\nPlease verify your email address by clicking the link below:\n\n${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background-color: #002F63; padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to Tes Tour!</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                        Thank you for signing up! We're excited to have you on board.
                      </p>
                      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                        Please verify your email address by clicking the button below:
                      </p>
                      
                      <!-- Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 20px 0;">
                            <a href="${verificationUrl}" 
                               style="display: inline-block; background-color: #002F63; color: #ffffff; 
                                      padding: 14px 40px; text-decoration: none; border-radius: 5px; 
                                      font-weight: bold; font-size: 16px;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="color: #002F63; font-size: 14px; word-break: break-all; margin: 10px 0 0 0;">
                        ${verificationUrl}
                      </p>
                      
                      <p style="color: #999999; font-size: 13px; line-height: 1.6; margin: 30px 0 0 0; padding-top: 20px; border-top: 1px solid #eeeeee;">
                        This verification link will expire in 24 hours.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center;">
                      <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 0;">
                        If you didn't create an account with Tes Tour, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    })

    console.log('✅ Verification email sent successfully to:', email)
    console.log('Message ID:', info.messageId)
    
    // If using Mailtrap, log the preview URL
    if (process.env.MAILTRAP_USER) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
    }
  } catch (error) {
    console.error('❌ Error sending verification email:', error)
    // Fallback to console logging
    logVerificationEmail(email, token, role)
  }
}

// Log verification email (fallback for local development)
export function logVerificationEmail(email: string, token: string, role: string) {
  const verificationUrl = `http://localhost:3000/verify-email?token=${token}`
  
  console.log('\n' + '='.repeat(40))
  console.log('📧 EMAIL VERIFICATION (Console Fallback)')
  console.log('='.repeat(40))
  console.log(`To: ${email}`)
  console.log(`Role: ${role}`)
  console.log(`Verification URL: ${verificationUrl}`)
  console.log('='.repeat(40) + '\n')
  // etc.
}
