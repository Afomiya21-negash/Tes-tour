# Email Verification Setup Guide

This document explains the email verification system implemented for the Tes-tour application.

## Overview

Email verification has been implemented for:
- **Customer signup** (when users register via the signup form)
- **Employee registration** (when admin registers employees)
- **Driver registration** (when admin registers drivers)
- **Tour Guide registration** (when admin registers tour guides)

## Database Setup

### Step 1: Run the Migration Script

Execute the SQL migration script to add email verification fields to the `users` table:

```bash
# Navigate to your MySQL/MariaDB client or phpMyAdmin
# Run the following script:
```

```sql
-- File: scripts/add-email-verification.sql
ALTER TABLE `users` 
ADD COLUMN `email_verified` BOOLEAN DEFAULT FALSE AFTER `email`,
ADD COLUMN `verification_token` VARCHAR(255) DEFAULT NULL AFTER `email_verified`,
ADD COLUMN `verification_token_expires` DATETIME DEFAULT NULL AFTER `verification_token`;

ALTER TABLE `users`
ADD INDEX `idx_verification_token` (`verification_token`);
```

This adds three new columns:
- `email_verified`: Boolean flag indicating if email is verified (default: FALSE)
- `verification_token`: Unique token for email verification
- `verification_token_expires`: Expiration timestamp for the token (24 hours from creation)

## How It Works

### 1. User Registration Flow

When a user signs up (customer) or is registered by admin (employee/driver/tourguide):

1. User data is saved to the database
2. A unique verification token is generated (64-character hex string)
3. Token is stored in the database with 24-hour expiration
4. Verification email is logged to console (in local development)
5. User sees a success message with instructions

### 2. Email Verification Flow

1. User clicks the verification link from their email
2. Link format: `http://localhost:3000/verify-email?token=<verification_token>`
3. System validates the token:
   - Checks if token exists
   - Checks if token hasn't expired
   - Checks if email isn't already verified
4. If valid, marks email as verified and clears the token
5. User is redirected to login page

### 3. Resend Verification Flow

If a user didn't receive the verification email or it expired:

1. User navigates to `/resend-verification`
2. Enters their email address
3. System generates a new token
4. New verification email is sent/logged

## API Endpoints

### Verify Email
- **Endpoint**: `GET /api/verify-email?token=<token>`
- **Description**: Verifies email using the provided token
- **Response**: 
  - Success: `{ success: true, message: "Email verified successfully" }`
  - Error: `{ success: false, message: "Error message" }`

### Resend Verification
- **Endpoint**: `POST /api/resend-verification`
- **Body**: `{ email: "user@example.com" }`
- **Description**: Generates and sends a new verification token
- **Response**:
  - Success: `{ success: true, message: "Verification email resent" }`
  - Error: `{ success: false, message: "Error message" }`

## Pages

### Verify Email Page
- **Route**: `/verify-email`
- **Description**: Displays verification status (loading, success, or error)
- **Features**:
  - Auto-verifies on page load using token from URL
  - Shows success message and redirects to login after 3 seconds
  - Provides options to go to login or resend verification on error

### Resend Verification Page
- **Route**: `/resend-verification`
- **Description**: Allows users to request a new verification email
- **Features**:
  - Email input form
  - Success/error message display
  - Link back to login page

## Local Development

In local development mode, verification emails are **logged to the console** instead of being sent via email service.

### Example Console Output:

```
========================================
📧 EMAIL VERIFICATION (Local Simulation)
========================================
To: user@example.com
Role: customer
Verification URL: http://localhost:3000/verify-email?token=abc123...
========================================
```

### Testing the Flow:

1. **Sign up a new customer**:
   - Go to `/signup`
   - Fill in the form and submit
   - Check the console for the verification link
   - Copy the verification URL

2. **Verify the email**:
   - Paste the URL in your browser
   - You should see a success message
   - You'll be redirected to login

3. **Test resend verification**:
   - Go to `/resend-verification`
   - Enter the email address
   - Check console for new verification link

## Production Setup

For production deployment, you'll need to:

### 1. Configure Email Service

Update `lib/email-verification.ts` to send actual emails. Replace the `logVerificationEmail` function with actual email sending logic using services like:

- **Nodemailer** (SMTP)
- **SendGrid**
- **AWS SES**
- **Mailgun**
- **Postmark**

Example with Nodemailer:

```typescript
import nodemailer from 'nodemailer'

export async function sendVerificationEmail(email: string, token: string, role: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify Your Email - Tes Tour',
    html: `
      <h1>Welcome to Tes Tour!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `,
  })
}
```

### 2. Set Environment Variables

Add to your `.env.local` or production environment:

```env
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### 3. Optional: Enforce Email Verification

To require email verification before users can log in, update the login logic in `lib/domain.ts`:

```typescript
static async loginDetailed(
  emailOrUsername: string,
  password: string
): Promise<
  | { ok: true; result: LoginResult; rehashed?: boolean }
  | { ok: false; reason: 'NOT_FOUND' | 'INVALID_PASSWORD' | 'DB_ERROR' | 'EMAIL_NOT_VERIFIED' }
> {
  // ... existing code ...
  
  if (!valid) return { ok: false, reason: 'INVALID_PASSWORD' }
  
  // Check if email is verified
  if (!user.email_verified) {
    return { ok: false, reason: 'EMAIL_NOT_VERIFIED' }
  }
  
  // ... rest of code ...
}
```

## Files Created/Modified

### New Files:
- `lib/email-verification.ts` - Email verification utility functions
- `app/api/verify-email/route.ts` - Email verification API endpoint
- `app/api/resend-verification/route.ts` - Resend verification API endpoint
- `app/verify-email/page.tsx` - Email verification page
- `app/resend-verification/page.tsx` - Resend verification page
- `scripts/add-email-verification.sql` - Database migration script

### Modified Files:
- `lib/domain.ts` - Added email verification to signup and registration
- `components/SignupForm.tsx` - Added verification success message

## Security Considerations

1. **Token Security**: Tokens are 64-character random hex strings (256 bits of entropy)
2. **Token Expiration**: Tokens expire after 24 hours
3. **One-time Use**: Tokens are cleared after successful verification
4. **Database Index**: Indexed for fast token lookups
5. **HTTPS**: Always use HTTPS in production for secure token transmission

## Troubleshooting

### Token Expired
- User can request a new token via `/resend-verification`
- Old token is invalidated when new one is generated

### Email Not Received (Production)
- Check email service configuration
- Verify SMTP credentials
- Check spam/junk folder
- Ensure sender email is verified with email service

### Already Verified Error
- This is expected if user tries to verify twice
- User can proceed to login

## Future Enhancements

Potential improvements:
- Email templates with branding
- Multi-language support for verification emails
- SMS verification as alternative
- Social login integration
- Account activation by admin (for employees)
- Verification reminder emails
