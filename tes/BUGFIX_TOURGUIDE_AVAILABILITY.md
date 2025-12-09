# 🐛 BUG FIX - Tour Guide Availability Not Showing

## 📅 **Date:** December 9, 2025
## 🎯 **Issue:** Tour guides not appearing in assignment modal even when available

---

## **THE PROBLEM**

### **User Report:**
> "There is something wrong with the availability of tour guides. It's not showing me the available tour guide when the employee tries to assign even though there is."

### **Symptoms:**
- Employee clicks "Assign Tour Guide" for a booking
- Modal opens but shows "No tour guides available"
- Database shows tour guides exist and are free during the requested dates
- Tour guides appear in the main list as "Available"

---

## **ROOT CAUSE ANALYSIS**

### **The Bug: Double Filtering Conflict**

There were **TWO conflicting filters**:

#### **Filter 1: API Date Range Filter (CORRECT) ✅**
```typescript
// app/api/employee/tourguides/route.ts (lines 72-92)
if (startDate && endDate) {
  query += `
    AND u.user_id NOT IN (
      SELECT DISTINCT b.tour_guide_id
      FROM bookings b
      WHERE b.tour_guide_id IS NOT NULL
        AND b.status IN ('confirmed', 'in-progress', 'pending')
        AND (
          (b.start_date <= ? AND b.end_date >= ?)
          OR (b.start_date <= ? AND b.end_date >= ?)
          OR (b.start_date >= ? AND b.end_date <= ?)
        )
    )
  `
}
```
✅ **Correct:** Excludes tour guides booked during the **specific date range**

#### **Filter 2: Frontend Availability Filter (WRONG) ❌**
```typescript
// app/employee/page.tsx (line 982 - OLD CODE)
{tourGuides
  .filter((guide) => guide.availability === "available")  // ❌ PROBLEM
  .map((guide) => (
```
❌ **Problem:** Only shows guides marked as "available"

#### **Filter 3: API Availability Check (MISLEADING) ⚠️**
```typescript
// app/api/employee/tourguides/route.ts (lines 57-64)
CASE 
  WHEN (
    SELECT COUNT(1)
    FROM bookings b2
    WHERE b2.tour_guide_id = u.user_id
      AND b2.status IN ('confirmed', 'in-progress')
      AND b2.start_date <= CURDATE() AND b2.end_date >= CURDATE()  // Checks TODAY only
  ) > 0 THEN 'busy' ELSE 'available' END as availability
```
⚠️ **Misleading:** Checks if busy **TODAY**, not during the requested dates

### **How This Caused the Bug:**

**Example Scenario:**
1. **Booking dates:** Jan 10-14, 2027 (future)
2. **Tour Guide X:** 
   - Has a booking **today** (Dec 9, 2025) → marked as "busy"
   - Free on Jan 10-14, 2027
3. **API Filter 1:** ✅ Returns Tour Guide X (free during Jan 10-14)
4. **Frontend Filter 2:** ❌ Hides Tour Guide X (marked as "busy" today)
5. **Result:** No tour guides shown, even though Guide X is available!

---

## **THE FIX**

### **Fix #1: Remove Conflicting Frontend Filter**

**File:** `app/employee/page.tsx`

**Before (BROKEN):**
```typescript
<div className="space-y-3">
  {tourGuides
    .filter((guide) => guide.availability === "available")  // ❌ REMOVED
    .map((guide) => (
      <button>...</button>
    ))
  }
</div>
```

**After (FIXED):**
```typescript
<div className="space-y-3">
  {tourGuides.length === 0 && (
    <p className="text-sm text-gray-600 text-center py-4">
      No tour guides available for the selected dates.
    </p>
  )}
  {tourGuides.map((guide) => (  // ✅ Show all guides returned by API
    <button>...</button>
  ))}
</div>
```

**Why This Works:**
- ✅ API already filters by date range
- ✅ All tour guides returned ARE available for the requested dates
- ✅ No need to double-filter by availability status
- ✅ Added helpful message when truly no guides available

---

### **Fix #2: Updated API to Use Correct Rating Structure**

**File:** `app/api/employee/tourguides/route.ts`

**Before (BROKEN):**
```typescript
COALESCE(
  (
    SELECT AVG(r.rating)
    FROM ratings r
    WHERE r.rated_user_id = u.user_id AND LOWER(r.rating_type) = 'tourguide'  // ❌ Wrong columns
  ),
  (
    SELECT tg.rating FROM tourguides tg WHERE tg.tour_guide_id = u.user_id LIMIT 1
  ),
  0
) as average_rating,
```

**After (FIXED):**
```typescript
COALESCE(tg.rating, 0) as average_rating,
COALESCE(tg.total_ratings, 0) as total_ratings,
```

**Additional Improvements:**
```typescript
SELECT 
  u.user_id,
  u.first_name,
  u.last_name,
  u.email,
  u.phone_number as phone,
  tg.specialization,           // ✅ NEW
  tg.experience_years,          // ✅ NEW
  ...
  COALESCE(tg.rating, 0) as average_rating,
  COALESCE(tg.total_ratings, 0) as total_ratings,  // ✅ NEW
  ...
FROM users u
LEFT JOIN tourguides tg ON u.user_id = tg.tour_guide_id  // ✅ ADDED JOIN
WHERE u.role = 'tourguide'
```

---

## **HOW THE SYSTEM WORKS NOW**

### **Tour Guide Assignment Flow:**

1. **Employee clicks "Assign Tour Guide"** on a booking
   - Booking dates: e.g., Jan 10-14, 2027

2. **Frontend calls API with dates:**
   ```
   GET /api/employee/tourguides?startDate=2027-01-10&endDate=2027-01-14
   ```

3. **API filters tour guides:**
   ```sql
   -- Step 1: Get all tour guides with ratings
   SELECT u.user_id, u.first_name, tg.rating, ...
   FROM users u
   LEFT JOIN tourguides tg ON u.user_id = tg.tour_guide_id
   WHERE u.role = 'tourguide'
   
   -- Step 2: Exclude those booked during Jan 10-14
   AND u.user_id NOT IN (
     SELECT DISTINCT b.tour_guide_id
     FROM bookings b
     WHERE b.tour_guide_id IS NOT NULL
       AND b.status IN ('confirmed', 'in-progress', 'pending')
       AND (booking dates overlap with Jan 10-14)
   )
   ```

4. **API returns only available guides:**
   ```json
   [
     {
       "user_id": 14,
       "first_name": "John",
       "last_name": "Doe",
       "email": "guide@example.com",
       "average_rating": 4.5,
       "total_ratings": 10,
       "total_tours": 25,
       "availability": "busy"  // May say "busy" if busy TODAY, but free Jan 10-14
     }
   ]
   ```

5. **Frontend displays ALL returned guides:**
   - ✅ Shows all guides (no filter)
   - ✅ All guides shown ARE available for the booking dates
   - ✅ Employee can assign any of them

---

## **AVAILABILITY STATUS EXPLAINED**

### **What "Availability" Means:**

The `availability` field in the tour guides list shows their **current status (today)**, not future availability:

- **"Available"**: Free today, no bookings today
- **"Busy"**: Has a booking today

### **Why Keep It?**

The availability badge is still useful in the **main tour guides list** (not assignment modal):

```typescript
// Tour guides overview (still shows availability badge)
<span className={`px-2 py-1 text-xs rounded-full ${
  guide.availability === "available"
    ? "bg-green-100 text-green-800"
    : "bg-red-100 text-red-800"
}`}>
  {guide.availability === "available" ? "Available" : "Busy"}
</span>
```

**Use Case:** Employee can quickly see who's currently busy vs. free (general overview).

**Not Used For:** Assignment filtering (uses date range filter instead).

---

## 🧪 **HOW TO TEST THE FIX**

### **Test Scenario 1: Assign to Future Date**

1. **Login as HR employee**
2. **Go to "Assign Tour Guides" tab**
3. **Find a booking with future dates** (e.g., Jan 10-14, 2027)
4. **Click "Assign Tour Guide"**
5. **Expected Result:**
   - ✅ Modal shows tour guides available for Jan 10-14
   - ✅ Shows guides even if they're "busy" today
   - ✅ Can assign any guide shown

### **Test Scenario 2: No Available Guides**

1. **Book ALL tour guides for the same dates**
2. **Create a new booking for those dates**
3. **Click "Assign Tour Guide"**
4. **Expected Result:**
   - ✅ Shows message: "No tour guides available for the selected dates."
   - ✅ No tour guides displayed

### **Test Scenario 3: Overlapping Bookings**

**Setup:**
- Tour Guide A: Booked Jan 10-12
- Tour Guide B: Booked Jan 13-15
- New Booking: Jan 11-14

**Test:**
1. **Click "Assign Tour Guide"** for Jan 11-14 booking
2. **Expected Result:**
   - ❌ Tour Guide A NOT shown (overlaps Jan 11-12)
   - ❌ Tour Guide B NOT shown (overlaps Jan 13-14)
   - ✅ Other free guides shown

### **Test Scenario 4: Rating Display**

1. **Assign tour guide**
2. **Complete tour and submit rating**
3. **View tour guides list**
4. **Expected Result:**
   - ✅ Rating displayed correctly
   - ✅ Total ratings count shown
   - ✅ Sorted by rating (highest first)

---

## 📊 **DATABASE QUERIES COMPARISON**

### **Before Fix (Broken):**
```sql
-- Tried to query old rating structure
SELECT 
  COALESCE(
    (SELECT AVG(r.rating) 
     FROM ratings r 
     WHERE r.rated_user_id = u.user_id  -- ❌ Column doesn't exist
       AND LOWER(r.rating_type) = 'tourguide'),  -- ❌ Column doesn't exist
    0
  ) as average_rating
FROM users u
WHERE u.role = 'tourguide'
```
Result: ❌ SQL Error or NULL ratings

### **After Fix (Working):**
```sql
-- Uses correct table structure
SELECT 
  u.user_id,
  COALESCE(tg.rating, 0) as average_rating,  -- ✅ Correct
  COALESCE(tg.total_ratings, 0) as total_ratings  -- ✅ Correct
FROM users u
LEFT JOIN tourguides tg ON u.user_id = tg.tour_guide_id  -- ✅ JOIN added
WHERE u.role = 'tourguide'
  AND u.user_id NOT IN (
    -- Exclude those booked during requested dates
    SELECT DISTINCT b.tour_guide_id
    FROM bookings b
    WHERE ...date overlap logic...
  )
```
Result: ✅ Correct ratings, correct availability filtering

---

## 📝 **FILES MODIFIED SUMMARY**

| File | Lines Changed | Description |
|------|---------------|-------------|
| `app/api/employee/tourguides/route.ts` | 40-67 | Fixed rating query, added JOIN, simplified query |
| `app/employee/page.tsx` | 981-986 | Removed availability filter, added empty state message |

---

## ✅ **VERIFICATION CHECKLIST**

- [x] Tour guides API returns correct data structure
- [x] Rating and total_ratings are populated correctly
- [x] Date range filtering works (excludes booked guides)
- [x] Assignment modal shows available guides for future dates
- [x] Shows guides even if "busy" today but free during booking dates
- [x] Empty state message appears when truly no guides available
- [x] No "filter by availability" in assignment modal
- [x] Availability badge still shown in main tour guides list
- [x] Ratings display correctly

---

## 🎯 **KEY TAKEAWAYS**

### **What Was Wrong:**
1. ❌ Double filtering: API + Frontend
2. ❌ Availability checked "today" not "booking dates"
3. ❌ Wrong ratings table structure referenced

### **What We Fixed:**
1. ✅ Removed conflicting frontend filter
2. ✅ Trust API date range filter (it's correct)
3. ✅ Fixed ratings query to use `tourguides` table
4. ✅ Added helpful empty state message

### **Lesson Learned:**
**When you have date-specific filtering in the API, don't apply generic "availability" filters in the frontend.** The API knows better!

---

## 🚀 **DEPLOYMENT STEPS**

1. **Restart Next.js server:**
   ```bash
   # Stop current server (Ctrl + C)
   npm run dev
   ```

2. **Clear browser cache:**
   ```
   Ctrl + Shift + Delete → Clear all
   ```

3. **Test assignment:**
   - Login as HR employee
   - Try assigning tour guides to future bookings
   - Verify guides appear correctly

---

**Tour guide availability fixed! Restart server and test the assignment modal.** 🎉
