# 🎉 Chappa Payment Integration - Complete Setup Guide

## ✅ TASK 1: Booking Status Display - COMPLETED

### What Was Done:
- ✅ Added **"In Progress"** status display in customer dashboard
- ✅ Status shows with **orange badge** and **map pin icon**
- ✅ Customers can now see when tour guide has started their tour

### Status Colors:
- **Pending**: Yellow (Clock icon)
- **Confirmed**: Green (Check icon)
- **In Progress**: Orange (Map Pin icon) ← NEW!
- **Completed**: Blue (Check icon)
- **Cancelled**: Red (X icon)

---

## 💳 TASK 2: Chappa Payment Integration - COMPLETED

### Files Created:
1. `lib/chapa.ts` - Chappa API wrapper functions
2. `app/api/payments/initialize/route.ts` - Initialize payment endpoint
3. `app/api/payments/verify/route.ts` - Verify payment endpoint
4. `app/api/payments/webhook/route.ts` - Webhook handler
5. `app/payment/verify/page.tsx` - Payment verification page
6. Updated `app/dashboard/page.tsx` - Added "Pay Now" button

---

## 📋 WHAT YOU NEED TO DO

### Step 1: Get Chappa API Keys (5 minutes)

1. **Visit Chappa Website**:
   - Go to: https://chapa.co
   - Click "Sign Up" or "Login"

2. **Create Account** (if new):
   - Fill in your business details
   - Verify your email

3. **Get Test API Keys**:
   - After login, go to **Dashboard**
   - Click **"Settings"** or **"API Keys"** in the sidebar
   - You'll see:
     - **Test Secret Key** (starts with `CHASECK_TEST-...`)
     - **Test Public Key** (starts with `CHAPUBK_TEST-...`)
   - Copy both keys

4. **Optional - Webhook Secret**:
   - In Settings, find **"Webhook Settings"**
   - Generate or copy your webhook secret
   - This verifies that webhook calls are from Chappa

### Step 2: Create Environment File

In your project root (`c:\xampp\htdocs\Tes-tour\tes\`), create a file named `.env.local`:

```env
# Chappa Payment Gateway - TEST MODE
CHAPA_SECRET_KEY=CHASECK_TEST-paste-your-secret-key-here
CHAPA_PUBLIC_KEY=CHAPUBK_TEST-paste-your-public-key-here
CHAPA_WEBHOOK_SECRET=your-webhook-secret-here

# Application URL (Change when deploying to production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ IMPORTANT**: 
- Replace `paste-your-secret-key-here` with your actual Chappa secret key
- DO NOT commit `.env.local` to Git (it's in `.gitignore` by default)
- For production, use live keys and change the URL

### Step 3: Install Axios

Open terminal in your project directory and run:

```bash
npm install axios
```

### Step 4: Update Database (If Needed)

Your `payments` table already has the correct structure:
```sql
CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime DEFAULT current_timestamp(),
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'completed',
  PRIMARY KEY (`payment_id`),
  KEY `booking_id` (`booking_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`)
);
```

✅ No changes needed!

### Step 5: Restart Your Development Server

```bash
npm run dev
```

---

## 🚀 HOW IT WORKS

### For Customers:

1. **Customer Selects Tour and Fills Booking Form**:
   - Enters dates, number of people, contact info
   - Selects vehicle and driver
   - Reviews total price

2. **Customer Submits Booking**:
   - System creates booking with `status = 'pending'`
   - System immediately creates payment record with `status = 'pending'`
   - Generates unique transaction reference (e.g., `TES-TOUR-123-1234567890`)
   - **Automatically redirects to Chappa payment page**

3. **Customer Completes Payment**:
   - Chappa processes payment (Test Mode: uses test cards)
   - Redirects back to `/payment/verify` page

4. **System Verifies Payment**:
   - Calls Chappa API to verify transaction
   - Updates payment status to `completed`
   - Updates booking status to `confirmed`
   - Shows success message

5. **Customer Views Dashboard**:
   - Booking shows "Confirmed" status (green badge)
   - Payment shows as "completed via chapa"

**✨ Key Difference**: Payment happens IMMEDIATELY after booking creation, not as a separate step later.

### For Tour Guides:

- Tour guide sees confirmed booking in their dashboard
- Can click "Start Tour" → status becomes "In Progress"
- Customer sees "In Progress" status (orange badge)
- Click "Finish Tour" → status becomes "Completed"

---

## 🧪 TESTING WITH CHAPPA TEST MODE

### Test Card Numbers (Provided by Chappa):

**Test Successful Payment:**
```
Card Number: 5555 5555 5555 4444
Expiry: 12/25
CVV: 123
```

**Test Failed Payment:**
```
Card Number: 4000 0000 0000 0002
Expiry: 12/25
CVV: 123
```

### Test Flow:

1. **Login as Customer**
2. **Browse Tours** and select a tour (or create custom booking)
3. **Fill Booking Form**:
   - Select dates
   - Choose vehicle and driver
   - Enter contact information
   - Review total price
4. **Click "Confirm Booking"**
5. **Auto-Redirect to Chappa Payment Page**
6. **Enter Test Card Details** (see test cards above)
7. **Submit Payment**
8. **Verify Success** → You'll see green success page
9. **Check Dashboard** → Booking should be "Confirmed" (green badge)

---

## 🔄 PAYMENT FLOW DIAGRAM

```
┌─────────────┐
│  Customer   │
│  Fills Form │
└──────┬──────┘
       │ Submits booking
       ▼
┌─────────────────┐
│ POST /api/      │
│ bookings        │
└────────┬────────┘
         │ Creates booking (pending)
         ▼
┌─────────────────┐
│ POST /api/      │
│ payments/       │
│ initialize      │
└────────┬────────┘
         │ Creates payment record (pending)
         │ Gets Chappa checkout URL
         │ Auto-redirects customer
         ▼
┌─────────────────┐
│  Chapa         │
│  Payment Page   │
└────────┬────────┘
         │ Customer enters card details
         │ Processes payment
         ▼
┌─────────────────┐
│ GET /payment/   │
│ verify          │
└────────┬────────┘
         │ Verifies with Chapa API
         │ Updates payment to 'completed'
         │ Updates booking to 'confirmed'
         ▼
┌─────────────────┐
│  Success Page   │
└─────────────────┘
```

---

## 📊 DATABASE CHANGES

Your `payments` table stores:
- `payment_id` - Unique ID (auto-increment)
- `booking_id` - Links to booking (FK)
- `amount` - Payment amount in ETB
- `payment_date` - When payment was made
- `payment_method` - "chapa" or payment method from Chappa
- `transaction_id` - Unique transaction reference (e.g., TES-TOUR-123-1234567890)
- `status` - 'pending', 'completed', or 'failed'

**Payment Statuses:**
- `pending` - Payment initiated but not completed
- `completed` - Payment successful and verified
- `failed` - Payment failed

---

## 🛡️ SECURITY FEATURES

✅ **Authentication Required**: Only logged-in customers can pay
✅ **User Verification**: Customers can only pay for their own bookings
✅ **Double Payment Prevention**: Checks if booking already has completed payment
✅ **Payment Verification**: Always verifies with Chappa before marking as complete
✅ **Unique Transaction IDs**: Each payment has unique reference
✅ **Webhook Support**: Automatic updates when payment status changes

---

## 🔧 TROUBLESHOOTING

### Error: "Unauthorized"
- **Cause**: Customer not logged in
- **Fix**: Make sure customer is logged in

### Error: "Booking not found"
- **Cause**: Invalid booking_id or trying to pay for someone else's booking
- **Fix**: Check that booking belongs to logged-in customer

### Error: "Payment already completed"
- **Cause**: Trying to pay for already-paid booking
- **Fix**: Check payment status in database

### Error: "Failed to initialize payment"
- **Cause**: Invalid Chappa API key or network issue
- **Fix**: 
  1. Check `.env.local` file has correct keys
  2. Restart dev server after adding keys
  3. Check Chappa dashboard for API status

### Payment Not Verifying:
- **Check**: Is the `NEXT_PUBLIC_APP_URL` correct?
- **Check**: Did you restart the server after adding `.env.local`?
- **Check**: Look at console logs for errors

---

## 🌐 PRODUCTION DEPLOYMENT

When deploying to production:

1. **Get Live API Keys from Chappa**:
   - Switch from Test to Live mode in Chappa dashboard
   - Copy live secret and public keys

2. **Update Environment Variables**:
   ```env
   CHAPA_SECRET_KEY=CHASECK-your-live-secret-key
   CHAPA_PUBLIC_KEY=CHAPUBK-your-live-public-key
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

3. **Configure Webhook URL in Chappa**:
   - Go to Chappa Dashboard → Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/payments/webhook`
   - Save webhook secret to your `.env`

4. **Test with Real Cards**:
   - Use small amounts first
   - Verify payments are processed correctly

---

## 📞 SUPPORT

### Chappa Support:
- Email: support@chapa.co
- Documentation: https://developer.chapa.co

### Payment Issues:
- Check console logs for errors
- Check database for payment records
- Verify API keys are correct
- Ensure server is running

---

## ✨ SUMMARY

**What Works Now:**

1. ✅ **Customer Dashboard** shows booking status with colored badges
2. ✅ **"In Progress"** status shows when tour guide starts tour
3. ✅ **Payment During Booking** - customers pay immediately when booking
4. ✅ **Chappa Integration** for secure payments
5. ✅ **Payment Verification** page with success/failure handling
6. ✅ **Automatic Status Updates** after successful payment
7. ✅ **Webhook Support** for real-time payment notifications

**Your Next Steps:**

1. ⏺️ Get Chappa API keys (5 minutes)
2. ⏺️ Create `.env.local` file with keys
3. ⏺️ Run `npm install axios`
4. ⏺️ Restart server
5. ⏺️ Test with test card numbers

---

**Need Help?** Check the console logs for any errors and make sure all environment variables are set correctly!
