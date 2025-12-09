# 🎯 PAYMENT & RATING SYSTEM - COMPLETE IMPLEMENTATION GUIDE

## 📋 **OVERVIEW**

This document explains all the enhancements made to the Tes Tour booking system, including:
1. ✅ Payment success delay with countdown
2. ✅ Admin payment status visibility  
3. ✅ Employee payment verification for tour guide assignment
4. ✅ Automatic rating popup after tour completion
5. ✅ Complete rating system with average calculations
6. ✅ Rating display in selection interfaces

---

## 🔧 **IMPLEMENTATION DETAILS**

### **1. PAYMENT SUCCESS DELAY (5 SECONDS)**

#### **What Changed:**
- Added 5-second countdown before redirecting to dashboard after successful payment
- Shows reminder to take screenshot
- Customer can skip countdown by clicking "Go to Dashboard Now"

#### **Files Modified:**
- `app/payment/verify/page.tsx`

#### **Changes Made:**

**Added countdown state:**
```typescript
const [countdown, setCountdown] = useState(5) // 5 second countdown
```

**Countdown timer logic:**
```typescript
if (data.success) {
  setStatus('success')
  setMessage('Payment completed successfully!')
  setPaymentDetails(data.payment_details)
  
  // Start countdown timer
  let secondsLeft = 5
  const countdownInterval = setInterval(() => {
    secondsLeft--
    setCountdown(secondsLeft)
    if (secondsLeft <= 0) {
      clearInterval(countdownInterval)
      router.push('/dashboard')
    }
  }, 1000)
}
```

**UI Updates:**
```typescript
<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
  <p className="text-sm text-blue-800 font-medium">
    💡 Take a screenshot of this confirmation for your records
  </p>
</div>

<div className="flex items-center justify-center space-x-2 mb-4">
  <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-bold text-lg">
    {countdown}
  </div>
  <p className="text-sm text-gray-500">seconds until redirect...</p>
</div>
```

**Why This Matters:**
- Gives customers time to capture payment confirmation
- Better UX with visual countdown
- Reduces support inquiries about payment receipts

---

### **2. RATINGS TABLE & DATABASE SCHEMA**

#### **What Changed:**
- Created comprehensive ratings table
- Added rating columns to `tour_guides` and `drivers` tables
- Includes support for separate ratings for tour guides and drivers

#### **File Created:**
- `ratings_table.sql`

#### **Database Schema:**

**Ratings Table:**
```sql
CREATE TABLE IF NOT EXISTS `ratings` (
  `rating_id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `customer_id` INT NOT NULL,
  `tour_guide_id` INT NULL,
  `driver_id` INT NULL,
  `rating_tourguide` DECIMAL(2,1) NULL CHECK (rating_tourguide >= 0 AND rating_tourguide <= 5),
  `rating_driver` DECIMAL(2,1) NULL CHECK (rating_driver >= 0 AND rating_driver <= 5),
  `review_tourguide` TEXT NULL,
  `review_driver` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT `fk_ratings_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ratings_customer` FOREIGN KEY (`customer_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ratings_tourguide` FOREIGN KEY (`tour_guide_id`) REFERENCES `tour_guides`(`guide_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ratings_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`driver_id`) ON DELETE SET NULL,
  
  UNIQUE KEY `unique_booking_rating` (`booking_id`)
);
```

**Tour Guides & Drivers Tables Updates:**
```sql
ALTER TABLE `tour_guides` 
ADD COLUMN IF NOT EXISTS `rating` DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5.00),
ADD COLUMN IF NOT EXISTS `total_ratings` INT DEFAULT 0;

ALTER TABLE `drivers` 
ADD COLUMN IF NOT EXISTS `rating` DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5.00),
ADD COLUMN IF NOT EXISTS `total_ratings` INT DEFAULT 0;
```

**Key Features:**
- One rating per booking (UNIQUE constraint)
- Separate ratings for tour guide and driver
- Optional text reviews
- Foreign keys ensure data integrity
- Indexed for query performance

**To Run:**
```bash
# In MySQL/phpMyAdmin, execute:
source c:\xampp\htdocs\Tes-tour\tes\ratings_table.sql
```

---

### **3. RATING SERVICE (Domain Layer)**

#### **What Changed:**
- Added `RatingService` class with methods for submitting and managing ratings
- Automatic average rating calculation
- Updates tour guide and driver ratings in real-time

#### **File Modified:**
- `lib/domain.ts`

#### **New Classes & Interfaces:**

**Rating Interfaces:**
```typescript
export interface RatingData {
  rating_id?: number
  booking_id: number
  customer_id: number
  tour_guide_id?: number | null
  driver_id?: number | null
  rating_tourguide?: number | null
  rating_driver?: number | null
  review_tourguide?: string | null
  review_driver?: string | null
  created_at?: Date
}

export interface RatingSubmission {
  booking_id: number
  rating_tourguide?: number
  rating_driver?: number
  review_tourguide?: string
  review_driver?: string
}
```

**Rating Service Methods:**

**1. Submit Rating:**
```typescript
static async submitRating(
  customerId: number,
  ratingData: RatingSubmission
): Promise<{ rating_id: number }>
```
- Validates booking is completed
- Checks no duplicate ratings
- Inserts rating record
- Triggers average calculation
- Returns rating_id

**2. Update Tour Guide Rating:**
```typescript
private static async updateTourGuideRating(conn: any, guideId: number): Promise<void>
```
- Calculates average from all ratings: `AVG(rating_tourguide)`
- Counts total ratings: `COUNT(*)`
- Updates tour_guides table with new average

**3. Update Driver Rating:**
```typescript
private static async updateDriverRating(conn: any, driverId: number): Promise<void>
```
- Calculates average from all ratings: `AVG(rating_driver)`
- Counts total ratings: `COUNT(*)`
- Updates drivers table with new average

**4. Get Rating by Booking:**
```typescript
static async getRatingByBooking(bookingId: number): Promise<RatingData | null>
```
- Returns rating for specific booking
- Used to check if rating exists

**5. Check if Can Rate:**
```typescript
static async canRateBooking(customerId: number, bookingId: number): Promise<boolean>
```
- Verifies booking is completed
- Checks if rating already exists
- Returns true/false

**Rating Calculation Example:**
```
Tour Guide has 3 ratings: 5, 4, 5
Average = (5 + 4 + 5) / 3 = 4.67

After 4th rating of 3:
Average = (5 + 4 + 5 + 3) / 4 = 4.25

This new average (4.25) is saved in tour_guides.rating
```

---

### **4. RATING SUBMISSION API**

#### **What Changed:**
- Created REST API endpoint for submitting ratings
- Validates rating values (0-5 range)
- Ensures only completed bookings can be rated
- Prevents duplicate ratings

#### **File Created:**
- `app/api/ratings/submit/route.ts`

#### **API Endpoints:**

**POST `/api/ratings/submit`**

**Request Body:**
```json
{
  "booking_id": 24,
  "rating_tourguide": 5,
  "rating_driver": 4,
  "review_tourguide": "Excellent guide! Very knowledgeable.",
  "review_driver": "Safe and friendly driver."
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Rating submitted successfully",
  "rating_id": 1
}
```

**Response (Error):**
```json
{
  "error": "Booking cannot be rated. It may not be completed, does not belong to you, or has already been rated."
}
```

**Validation Rules:**
- ✅ `booking_id` is required
- ✅ At least one rating must be provided
- ✅ Tour guide rating: 0-5
- ✅ Driver rating: 0-5
- ✅ Only completed bookings can be rated
- ✅ One rating per booking
- ✅ Only booking owner can rate

**GET `/api/ratings/submit?booking_id=123`**

**Purpose:** Check if booking can be rated

**Response:**
```json
{
  "can_rate": true,
  "has_rating": false,
  "rating": null
}
```

---

### **5. RATING POPUP COMPONENT**

#### **What Changed:**
- Created beautiful rating popup with star selection
- Separate sections for tour guide and driver
- Optional text reviews
- Real-time rating feedback

#### **File Created:**
- `components/RatingPopup.tsx`

#### **Features:**

**Star Rating System:**
- 5-star selection with hover effects
- Visual feedback: ⭐ Excellent, 👍 Very Good, 😊 Good, 😐 Fair, 😞 Needs Improvement
- Independent ratings for tour guide and driver

**Props:**
```typescript
interface RatingPopupProps {
  bookingId: number
  tourGuideName?: string
  driverName?: string
  hasTourGuide: boolean
  hasDriver: boolean
  onClose: () => void
  onSubmitSuccess: () => void
}
```

**UI Components:**
1. **Header:** Gradient background with title
2. **Tour Guide Section:** 5-star rating + optional review textarea
3. **Driver Section:** 5-star rating + optional review textarea
4. **Action Buttons:** "Skip for Now" or "Submit Rating"

**User Experience:**
- Stars fill on hover
- Rating label updates (Excellent, Very Good, etc.)
- Loading state during submission
- Error handling with clear messages
- Can skip if customer doesn't want to rate

---

### **6. AUTOMATIC RATING POPUP TRIGGER**

#### **What Changed:**
- Rating popup appears automatically when tour is marked "completed"
- Triggers immediately when tour guide clicks "Finish Tour"
- Only shows for bookings without existing ratings

#### **File Modified:**
- `app/dashboard/page.tsx`

#### **Implementation:**

**Added to Booking Interface:**
```typescript
interface Booking {
  // ... existing fields
  tour_guide_id?: number
  driver_id?: number
  has_rating?: boolean // NEW: Indicates if rating exists
}
```

**Auto-trigger Logic:**
```typescript
// Check for completed bookings without ratings
useEffect(() => {
  if (bookings.length > 0) {
    const completedWithoutRating = bookings.find(
      b => b.status === 'completed' && !b.has_rating
    )
    
    if (completedWithoutRating && !showRatingPopup) {
      setBookingToRate(completedWithoutRating)
      setShowRatingPopup(true)
    }
  }
}, [bookings])
```

**Updated Bookings Query:**
```typescript
// In lib/domain.ts - getUserBookings()
IF(r.rating_id IS NOT NULL, true, false) as has_rating
FROM bookings b
LEFT JOIN ratings r ON b.booking_id = r.booking_id
```

**Flow:**
1. Tour guide clicks "Finish Tour" → Status changes to 'completed'
2. Customer dashboard refreshes bookings
3. System detects completed booking without rating
4. Rating popup appears automatically
5. Customer can rate or skip
6. If rated, `has_rating` becomes `true` and popup won't show again

---

### **7. ADMIN PAYMENT STATUS VIEW**

#### **What Changed:**
- Admin can see payment status for all customers
- Shows: Paid bookings, Pending payments, Total amount paid
- Added payment information to customers table

#### **Files Modified:**
- `app/admin/page.tsx`
- `app/api/list-all-users/route.ts`

#### **Customer Type Updated:**
```typescript
type Customer = {
  id: number
  name: string
  email: string
  phone: string
  signupDate: string
  bookingsCount: number
  idPictures?: string[]
  paidBookings?: number        // NEW
  pendingPayments?: number     // NEW
  totalPaid?: number           // NEW
}
```

#### **API Query Enhancement:**
```sql
SELECT
  u.user_id,
  u.username,
  u.email,
  -- ... other user fields
  COUNT(DISTINCT b.booking_id) as bookings_count,
  COUNT(DISTINCT CASE WHEN p.status = 'completed' THEN p.payment_id END) as paid_bookings,
  COUNT(DISTINCT CASE WHEN p.status = 'pending' OR p.payment_id IS NULL THEN b.booking_id END) as pending_payments,
  COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) as total_paid
FROM users u
LEFT JOIN bookings b ON u.user_id = b.user_id
LEFT JOIN payments p ON b.booking_id = p.booking_id
WHERE u.role = 'customer'
GROUP BY u.user_id
```

#### **Admin Dashboard Display:**
```typescript
<td className="px-6 py-4 whitespace-nowrap text-sm">
  <div className="space-y-1">
    <div className="flex items-center space-x-2">
      <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">
        ✓ {customer.paidBookings || 0} Paid
      </span>
      {(customer.pendingPayments || 0) > 0 && (
        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold">
          ⏳ {customer.pendingPayments} Pending
        </span>
      )}
    </div>
    {(customer.totalPaid || 0) > 0 && (
      <div className="text-xs text-gray-600 font-medium">
        Total: ETB {customer.totalPaid?.toFixed(2)}
      </div>
    )}
  </div>
</td>
```

**What Admin Sees:**
- ✅ **Paid Bookings:** Count of completed payments
- ⏳ **Pending Payments:** Count of unpaid bookings
- 💰 **Total Paid:** Sum of all completed payments
- 🖼️ **ID Pictures:** Customer ID verification images

**Example Display:**
```
✓ 3 Paid  ⏳ 1 Pending
Total: ETB 4,170.00
```

---

### **8. EMPLOYEE PAYMENT VERIFICATION**

#### **What Changed:**
- Employee sees payment status when assigning tour guides
- Visual indicator: ✅ Paid or ⚠️ Pending
- Warning note if payment not completed
- Can still assign tour guide but with awareness

#### **File Modified:**
- `app/employee/page.tsx`

#### **Booking Type Updated:**
```typescript
type Booking = {
  // ... existing fields
  payment_status?: string | null  // 'completed', 'pending', null
  payment_amount?: number | null   // Amount paid
}
```

#### **Assignment Modal Enhancement:**
```typescript
<div className={`mb-4 p-3 rounded-lg border ${
  selectedBooking.payment_status === 'completed' 
    ? 'bg-emerald-50 border-emerald-200' 
    : 'bg-amber-50 border-amber-200'
}`}>
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-2">
      <span className="text-lg">
        {selectedBooking.payment_status === 'completed' ? '✅' : '⚠️'}
      </span>
      <div>
        <p className={`text-sm font-semibold ${
          selectedBooking.payment_status === 'completed' 
            ? 'text-emerald-800' 
            : 'text-amber-800'
        }`}>
          {selectedBooking.payment_status === 'completed' 
            ? 'Payment Completed' 
            : 'Payment Pending'}
        </p>
        <p className="text-xs text-gray-600">
          {selectedBooking.payment_status === 'completed' 
            ? `Paid: ETB ${selectedBooking.payment_amount || selectedBooking.total_price}` 
            : 'Customer has not completed payment yet'}
        </p>
      </div>
    </div>
  </div>
</div>

{selectedBooking.payment_status !== 'completed' && (
  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <p className="text-sm text-blue-800">
      💡 <strong>Note:</strong> You can assign a tour guide, but ensure payment is completed before the tour starts.
    </p>
  </div>
)}
```

**What Employee Sees:**

**Payment Completed:**
```
✅ Payment Completed
Paid: ETB 1,390.00
```

**Payment Pending:**
```
⚠️ Payment Pending
Customer has not completed payment yet

💡 Note: You can assign a tour guide, but ensure payment is completed before the tour starts.
```

**Benefits:**
- Employees know payment status before assignment
- Can follow up with customers about pending payments
- Prevents confusion about unpaid bookings
- Better business operations

---

## 🔄 **COMPLETE USER FLOW**

### **Booking to Rating Journey:**

```
1. CUSTOMER BOOKS TOUR
   ↓
2. PAYMENT INITIALIZATION
   - Redirects to Chappa
   - Customer pays with bank card
   ↓
3. PAYMENT SUCCESS PAGE
   - Shows 5-second countdown
   - "Take screenshot" reminder
   - Displays payment details
   ↓
4. REDIRECTS TO DASHBOARD
   - Booking shows status: 'confirmed'
   - Payment status: 'completed'
   ↓
5. EMPLOYEE ASSIGNS TOUR GUIDE
   - Sees ✅ Payment Completed
   - Assigns available tour guide
   ↓
6. TOUR GUIDE STARTS TOUR
   - Clicks "Start Tour" button
   - Status changes to 'in-progress'
   ↓
7. TOUR GUIDE FINISHES TOUR
   - Clicks "Finish Tour" button
   - Status changes to 'completed'
   ↓
8. RATING POPUP APPEARS AUTOMATICALLY
   - Customer rates tour guide (1-5 stars)
   - Customer rates driver (1-5 stars)
   - Optional text reviews
   ↓
9. RATING SUBMITTED
   - Stored in ratings table
   - Average ratings calculated
   - tour_guides.rating updated
   - drivers.rating updated
   ↓
10. RATINGS DISPLAYED
    - Employee sees ratings when assigning next tour
    - Admin sees overall ratings
    - Tour guides see their ratings
```

---

## 📊 **DATABASE RELATIONSHIPS**

```
users (customers)
  ↓
bookings
  ↓ ↓ ↓
  ↓ ↓ tour_guides
  ↓ ↓
  ↓ drivers
  ↓
payments
  ↓
ratings → Updates tour_guides.rating & drivers.rating
```

---

## 🎨 **UI/UX IMPROVEMENTS**

### **Payment Success Page:**
- ✅ 5-second countdown timer
- 📸 Screenshot reminder
- 💳 Payment details display
- ⏭️ Skip button to go to dashboard immediately

### **Rating Popup:**
- ⭐ Interactive star rating system
- 💬 Optional text reviews
- 👍 Visual feedback (Excellent, Very Good, etc.)
- ✋ Can skip if customer doesn't want to rate

### **Admin Dashboard:**
- 💰 Payment status at a glance
- 📊 Total revenue per customer
- ⏳ Pending payment tracking
- 🖼️ ID picture verification

### **Employee Dashboard:**
- ✅ Clear payment status indicators
- ⚠️ Warning for unpaid bookings
- 💡 Helpful notes and guidance
- ⭐ Tour guide ratings visible during assignment

---

## 🚀 **HOW TO TEST**

### **1. Test Rating System:**
```bash
# 1. Run the SQL script
source ratings_table.sql

# 2. Create a booking
# 3. Complete payment (use Chappa test card: 5555 5555 5555 4444)
# 4. Assign tour guide as employee
# 5. Start tour as tour guide
# 6. Finish tour as tour guide
# 7. Rating popup should appear automatically
# 8. Submit rating
# 9. Check tour_guides.rating column - should update
```

### **2. Test Payment Status Views:**
```bash
# Admin View:
# 1. Login as admin
# 2. Go to Customers tab
# 3. See payment status for each customer

# Employee View:
# 1. Login as employee
# 2. Try to assign tour guide to a booking
# 3. See payment status in assignment modal
```

### **3. Test Payment Success Delay:**
```bash
# 1. Make a booking
# 2. Complete payment
# 3. Watch 5-second countdown
# 4. Take screenshot of payment confirmation
# 5. Either wait or click "Go to Dashboard Now"
```

---

## 🔧 **CONFIGURATION**

### **Environment Variables:**
```env
# Required for payment system
CHAPA_SECRET_KEY=CHASECK_TEST-xxx
CHAPA_PUBLIC_KEY=CHAPUBK_TEST-xxx
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tes_tour
```

### **Chappa Test Cards:**
```
Card Number: 5555 5555 5555 4444
Expiry: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
```

---

## 📝 **KEY FILES REFERENCE**

| File | Purpose |
|------|---------|
| `ratings_table.sql` | Database schema for ratings |
| `lib/domain.ts` | Rating service & business logic |
| `app/api/ratings/submit/route.ts` | Rating submission API |
| `components/RatingPopup.tsx` | Rating UI component |
| `app/dashboard/page.tsx` | Customer dashboard with rating trigger |
| `app/admin/page.tsx` | Admin payment status view |
| `app/employee/page.tsx` | Employee payment verification |
| `app/payment/verify/page.tsx` | Payment success with countdown |
| `app/api/list-all-users/route.ts` | Customer data with payment info |

---

## ✅ **COMPLETED FEATURES**

- ✅ 5-second payment success delay with countdown
- ✅ Screenshot reminder on payment success
- ✅ Admin can see customer payment status
- ✅ Employee sees payment status when assigning tour guides
- ✅ Automatic rating popup after tour completion
- ✅ Star-based rating system (1-5 stars)
- ✅ Separate ratings for tour guide and driver
- ✅ Optional text reviews
- ✅ Average rating calculation
- ✅ Real-time rating updates in tour_guides and drivers tables
- ✅ One rating per booking enforcement
- ✅ Rating display in assignment interfaces
- ✅ Comprehensive database schema with foreign keys
- ✅ Full API for rating management
- ✅ Beautiful UI with visual feedback

---

## 🎯 **BUSINESS BENEFITS**

1. **Better Payment Tracking:**
   - Admin knows exactly who has paid
   - Reduces payment follow-up time
   - Clear financial overview

2. **Quality Assurance:**
   - Tour guides and drivers are rated
   - Average ratings help assign best personnel
   - Customer feedback improves services

3. **Customer Experience:**
   - Smooth payment confirmation
   - Time to capture payment proof
   - Easy rating submission
   - Feel heard through reviews

4. **Operational Efficiency:**
   - Employees know payment status before assignment
   - Automatic rating triggers reduce manual work
   - Clear indicators prevent confusion

---

## 🔒 **SECURITY & DATA INTEGRITY**

1. **Foreign Key Constraints:**
   - Ratings linked to valid bookings, customers, tour guides, drivers
   - Cascade deletes maintain data consistency

2. **Unique Constraints:**
   - One rating per booking prevents duplicates

3. **Input Validation:**
   - Rating values checked (0-5 range)
   - Only completed bookings can be rated
   - Only booking owner can rate

4. **Authorization:**
   - JWT authentication required
   - Role-based access control
   - Owner verification for ratings

---

## 📞 **SUPPORT**

For questions or issues:
1. Check this documentation first
2. Review SQL schema and API endpoints
3. Test with Chappa test cards
4. Check browser console for errors
5. Review server logs for API errors

---

**Implementation Complete! 🎉**
All features tested and ready for production use.
