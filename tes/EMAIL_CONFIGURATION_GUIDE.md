# Email Configuration Guide

This guide will help you configure email sending for the email verification system.

## Quick Setup for Gmail

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter a name like "Tes Tour App"
5. Click **Generate**
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables

Create or edit `.env.local` in your project root (`tes/.env.local`):

```env
# Gmail Configuration (Option 1 - Recommended)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop

# OR use Generic SMTP (Option 2 - Works with any email provider)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Base URL for verification links
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Email sender name (optional)
EMAIL_FROM="Tes Tour <noreply@testour.com>"
```

### Step 4: Restart Your Development Server

After adding environment variables, restart your Next.js server:
```bash
npm run dev
```

## Alternative Email Providers

### Outlook/Hotmail
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

### Custom SMTP Server
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

## Testing with Mailtrap (Development)

Mailtrap is great for testing without sending real emails:

1. Sign up at https://mailtrap.io/
2. Get your credentials from the inbox
3. Add to `.env.local`:
```env
MAILTRAP_USER=your-mailtrap-username
MAILTRAP_PASS=your-mailtrap-password
```

## Troubleshooting

### "Authentication failed" Error
- **Gmail**: Make sure you're using an App Password, not your regular password
- **Gmail**: Ensure 2-Step Verification is enabled
- **Other providers**: Check your SMTP credentials

### "Connection timeout" Error
- Check your firewall settings
- Verify SMTP_HOST and SMTP_PORT are correct
- Try port 465 with SMTP_SECURE=true

### Emails not being received
- Check spam/junk folder
- Verify the email address is correct
- Check server logs for error messages
- Ensure NEXT_PUBLIC_BASE_URL is set correctly

### Testing Email Configuration

After configuration, test by:
1. Registering a new user
2. Check your email inbox (or Mailtrap inbox)
3. Check server console for any error messages

## Security Notes

- **Never commit `.env.local` to git** - it contains sensitive credentials
- Use App Passwords instead of regular passwords when possible
- In production, use environment variables from your hosting provider
- Consider using a dedicated email service (SendGrid, AWS SES, etc.) for production

## Production Deployment

For production, set environment variables in your hosting platform:
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Other**: Use your platform's environment variable configuration

Make sure to set:
- `NEXT_PUBLIC_BASE_URL` to your production domain (e.g., `https://yourdomain.com`)
- Email service credentials (Gmail, SMTP, etc.)

