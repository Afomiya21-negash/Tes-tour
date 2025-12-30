# ✅ Quick Test Checklist - GPS Tracking

## 🎯 Pre-Test Setup

### 1. Make sure tours have destination coordinates

```sql
-- Check current tours
SELECT tour_id, tour_name, destination, latitude, longitude 
FROM tours;

-- Add coordinates if missing (examples):
UPDATE tours SET latitude = 11.6300, longitude = 37.3900 WHERE tour_id = 1; -- Lalibela
UPDATE tours SET latitude = 13.2000, longitude = 38.0000 WHERE tour_id = 2; -- Simien Mountains
UPDATE tours SET latitude = 9.0320, longitude = 38.7469 WHERE tour_id = 3; -- Addis Ababa
```

### 2. Create a test booking (if needed)

```sql
-- Check existing bookings
SELECT 
  b.booking_id,
  b.status,
  CONCAT(u.first_name, ' ', u.last_name) as customer,
  CONCAT(tg.first_name, ' ', tg.last_name) as tour_guide,
  t.tour_name
FROM bookings b
LEFT JOIN users u ON b.user_id = u.user_id
LEFT JOIN users tg ON b.tour_guide_id = tg.tour_guide_id
LEFT JOIN tours t ON b.tour_id = t.tour_id
WHERE b.status IN ('confirmed', 'in-progress');

-- Create test booking if needed
INSERT INTO bookings (
  user_id, tour_guide_id, tour_id, 
  start_date, end_date, total_price, 
  status, number_of_people
) VALUES (
  1,  -- customer user_id (change this)
  2,  -- tour guide user_id (change this)
  1,  -- tour_id (change this)
  CURDATE(),
  DATE_ADD(CURDATE(), INTERVAL 3 DAY),
  1500.00,
  'confirmed',
  2
);
```

---

## 🧪 Test Steps

### Test 1: Tour Guide - Start Tour ✅

1. **Login as tour guide**
   - Email: (your tour guide email)
   - Password: (your tour guide password)

2. **Navigate to "Update Location" tab**
   - Should see dropdown with confirmed/in-progress bookings

3. **Select a booking**
   - Should see booking details
   - Should see green "Start Tour" button

4. **Click "Start Tour"**
   - ✅ Should see success message
   - ✅ Button should change to red "End Tour"
   - ✅ Status should change to "in-progress"

---

### Test 2: Tour Guide - Share Location ✅

1. **Click "Start Sharing" on the map**
   - ✅ Browser asks for location permission
   - ✅ Grant permission

2. **Wait a few seconds**
   - ✅ Green marker appears on map
   - ✅ Map centers on your location
   - ✅ "Sharing location..." message appears

3. **Move around (if possible)**
   - ✅ Marker should update position
   - ✅ Location updates every 5 seconds

---

### Test 3: Customer - Track Route ✅

1. **Login as customer** (different browser or incognito)
   - Email: (your customer email)
   - Password: (your customer password)

2. **Find the booking on dashboard**
   - Should see "Track Tour Guide" button
   - Status should be "in-progress"

3. **Click "Track Tour Guide"**
   - ✅ Modal opens with map
   - ✅ See green marker (tour guide location)
   - ✅ See red marker (destination)
   - ✅ See blue dashed route line
   - ✅ See stats: Distance, ETA, Speed

4. **Wait for updates**
   - ✅ Map updates every 5 seconds
   - ✅ Stats update automatically
   - ✅ Route line adjusts as tour guide moves

---

### Test 4: Tour Guide - End Tour ✅

1. **Go back to tour guide dashboard**
   - "Update Location" tab

2. **Click "End Tour" (red button)**
   - ✅ Should see success message
   - ✅ Status changes to "completed"
   - ✅ Booking removed from active tours list

3. **Customer side**
   - ✅ Tracking should stop
   - ✅ "Track Tour Guide" button should disappear

---

## 🔍 Troubleshooting

### ❌ "Start Tour" button not showing
- Check booking status is `confirmed`
- Check you're logged in as the assigned tour guide
- Check booking dates include today

### ❌ No route line showing
- Check tour has `latitude` and `longitude` in database
- Run: `SELECT latitude, longitude FROM tours WHERE tour_id = ?`

### ❌ Location not updating
- Check browser granted location permission
- Check browser console for errors (F12)
- Check network tab for API calls to `/api/location/update`

### ❌ Customer can't see tracking
- Check tour status is `in-progress` (not just `confirmed`)
- Check tour guide clicked "Start Sharing"
- Check booking dates include today

### ❌ Distance/ETA showing "--"
- Check tour has destination coordinates
- Wait for first location update (5 seconds)

---

## 📊 Expected Results

### Tour Guide View:
```
┌─────────────────────────────────────┐
│ Ethiopian Highlands Adventure       │
│ Customer: John Doe                  │
│ Status: in-progress                 │
│                                     │
│ [🟢 Start Tour] [🔴 End Tour]      │
│                                     │
│ 🚗 How to use:                     │
│ 1. Click "Start Tour"               │
│ 2. Click "Start Sharing"            │
│ 3. Drive to destination             │
│ 4. Click "End Tour"                 │
└─────────────────────────────────────┘
```

### Customer View:
```
┌─────────────────────────────────────┐
│ 🚗 Live Tour Tracking               │
│ Ethiopian Highlands Adventure       │
│ 📍 Destination: Lalibela            │
├─────────────────────────────────────┤
│ ┌─────────┬─────────┬─────────┐    │
│ │ 📏 45km │ ⏱️ 68min│ 🚗 65km/h│    │
│ └─────────┴─────────┴─────────┘    │
├─────────────────────────────────────┤
│                                     │
│      🔴 Lalibela (Destination)     │
│       ╱╱╱ (Route line)              │
│      ╱                              │
│     🟢 Tour Guide (Live)           │
│                                     │
│  [Updates every 5 seconds]          │
└─────────────────────────────────────┘
```

---

## ✅ Success Criteria

- [x] Tour guide can start tour
- [x] Tour guide can share location
- [x] Customer can see live tracking
- [x] Route line displays correctly
- [x] Distance, ETA, Speed display correctly
- [x] Map updates every 5 seconds
- [x] Tour guide can end tour

---

## 🎉 All Tests Passed?

If all tests pass, your Uber-style GPS tracking is working perfectly! 🚀

**Next Steps:**
- Test with real users
- Monitor performance
- Collect feedback
- Enjoy the feature! ✨

