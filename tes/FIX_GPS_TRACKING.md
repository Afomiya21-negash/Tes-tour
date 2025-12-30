# 🔧 Fix GPS Tracking Issues

## ✅ Issues Fixed

I've fixed the following issues:

1. **Next.js 15 params error** - Updated to `await params`
2. **Wrong column name** - Changed `t.tour_name` to `t.name`
3. **Missing API endpoint** - Created `/api/location/track/[bookingId]`
4. **Missing coordinates** - Tours table needs latitude/longitude columns

---

## 🚀 Quick Fix Steps

### Step 1: Add Coordinates to Tours Table

Run this SQL in phpMyAdmin:

```sql
USE tes_tour;

-- Add latitude and longitude columns
ALTER TABLE `tours` 
ADD COLUMN `latitude` DECIMAL(10,8) DEFAULT NULL,
ADD COLUMN `longitude` DECIMAL(11,8) DEFAULT NULL;

-- Add coordinates for your tours (examples below)
-- Lalibela
UPDATE tours SET latitude = 12.0333, longitude = 39.0333 WHERE tour_id = 1;

-- Simien Mountains
UPDATE tours SET latitude = 13.2000, longitude = 38.0000 WHERE tour_id = 2;

-- Add more as needed...
```

**OR** run the migration script:

```bash
# In phpMyAdmin, import this file:
tes/scripts/add-tour-coordinates.sql
```

---

### Step 2: Verify Your Booking

Check that your booking has the right status and tour guide:

```sql
SELECT 
  b.booking_id,
  b.status,
  b.tour_guide_id,
  CONCAT(u.first_name, ' ', u.last_name) as tour_guide_name,
  t.name as tour_name,
  t.latitude,
  t.longitude
FROM bookings b
LEFT JOIN users u ON b.tour_guide_id = u.user_id
LEFT JOIN tours t ON b.tour_id = t.tour_id
WHERE b.booking_id = 19;  -- Your booking ID
```

**Expected:**
- `status` should be `in-progress` (not `confirmed`)
- `tour_guide_id` should not be NULL
- `latitude` and `longitude` should not be NULL

---

### Step 3: Start the Tour

**As Tour Guide:**

1. Login to tour guide dashboard
2. Go to "Update Location" tab
3. Select booking #19
4. Click **"Start Tour"** (green button)
   - This changes status from `confirmed` to `in-progress`
5. Click **"Start Sharing"** on the map
   - Grant location permission
   - Wait for green marker to appear

---

### Step 4: Test Customer View

**As Customer:**

1. Login to customer dashboard
2. Find booking #19
3. Click **"Track Tour Guide"**
4. You should see:
   - 🟢 Green marker (tour guide location)
   - 🔴 Red marker (destination)
   - 🔵 Blue route line
   - 📏 Distance, ⏱️ ETA, 🚗 Speed

---

## 🔍 Debugging

### Check if tour has coordinates:

```sql
SELECT tour_id, name, destination, latitude, longitude 
FROM tours 
WHERE tour_id = (SELECT tour_id FROM bookings WHERE booking_id = 19);
```

If `latitude` or `longitude` is NULL, add them:

```sql
UPDATE tours 
SET latitude = 12.0333, longitude = 39.0333  -- Lalibela coordinates
WHERE tour_id = 1;
```

### Check if tour guide is sharing location:

```sql
SELECT * FROM location_tracking 
WHERE booking_id = 19 
ORDER BY timestamp DESC 
LIMIT 5;
```

If no rows, tour guide hasn't clicked "Start Sharing" yet.

### Check booking status:

```sql
SELECT booking_id, status FROM bookings WHERE booking_id = 19;
```

If status is `confirmed`, tour guide needs to click "Start Tour" first.

---

## 📋 Common Coordinates for Ethiopian Destinations

```sql
-- Lalibela
UPDATE tours SET latitude = 12.0333, longitude = 39.0333 WHERE destination LIKE '%Lalibela%';

-- Simien Mountains
UPDATE tours SET latitude = 13.2000, longitude = 38.0000 WHERE destination LIKE '%Simien%';

-- Gondar
UPDATE tours SET latitude = 12.6000, longitude = 37.4667 WHERE destination LIKE '%Gondar%';

-- Bahir Dar
UPDATE tours SET latitude = 11.5933, longitude = 37.3900 WHERE destination LIKE '%Bahir Dar%';

-- Axum
UPDATE tours SET latitude = 14.1200, longitude = 38.7200 WHERE destination LIKE '%Axum%';

-- Danakil Depression
UPDATE tours SET latitude = 14.2417, longitude = 40.3000 WHERE destination LIKE '%Danakil%' OR destination LIKE '%Dallol%';

-- Addis Ababa
UPDATE tours SET latitude = 9.0320, longitude = 38.7469 WHERE destination LIKE '%Addis%';
```

---

## ✅ Files Fixed

1. ✅ `app/api/tour/destination/[bookingId]/route.ts` - Fixed params and column name
2. ✅ `app/api/location/track/[bookingId]/route.ts` - Created new endpoint
3. ✅ `scripts/add-tour-coordinates.sql` - Migration script

---

## 🧪 Test Again

After running the SQL:

1. **Tour Guide:** Click "Start Tour" → "Start Sharing"
2. **Customer:** Click "Track Tour Guide"
3. **Should work!** 🎉

---

## 🚨 Still Not Working?

### Error: "Waiting for tour to start"
- Tour guide must click "Start Tour" first
- Check booking status is `in-progress`

### Error: No route line showing
- Check tour has latitude/longitude
- Run: `SELECT latitude, longitude FROM tours WHERE tour_id = ?`

### Error: No green marker (tour guide)
- Tour guide must click "Start Sharing"
- Check browser granted location permission
- Check: `SELECT * FROM location_tracking WHERE booking_id = 19`

### Error: 404 on /api/location/track/19
- Restart Next.js dev server: `npm run dev`
- New API endpoint needs server restart

---

## 🎯 Quick SQL Fix for Booking #19

```sql
-- 1. Add coordinates to tours table
ALTER TABLE `tours` 
ADD COLUMN `latitude` DECIMAL(10,8) DEFAULT NULL,
ADD COLUMN `longitude` DECIMAL(11,8) DEFAULT NULL;

-- 2. Add coordinates for the tour
UPDATE tours t
JOIN bookings b ON t.tour_id = b.tour_id
SET t.latitude = 12.0333, t.longitude = 39.0333  -- Lalibela
WHERE b.booking_id = 19;

-- 3. Make sure booking is in-progress
UPDATE bookings 
SET status = 'in-progress' 
WHERE booking_id = 19;

-- 4. Verify
SELECT 
  b.booking_id,
  b.status,
  t.name,
  t.latitude,
  t.longitude
FROM bookings b
JOIN tours t ON b.tour_id = t.tour_id
WHERE b.booking_id = 19;
```

---

## ✨ Done!

After running the SQL and restarting the dev server, GPS tracking should work! 🚀

