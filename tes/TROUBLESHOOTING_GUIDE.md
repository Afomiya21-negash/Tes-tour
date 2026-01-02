# 🆘 TROUBLESHOOTING GUIDE

## 🔍 **Issue 1: "Assignment Pending" Message**

### Problem:
```
⏳ Assignment Pending
Our team will assign a tour guide and driver to your booking soon.
```

### Solution:

#### Step 1: Restart Dev Server
```bash
# Stop server (Ctrl+C in terminal)
npm run dev
```

#### Step 2: Clear Browser Cache
```
1. Press F12 (open DevTools)
2. Right-click refresh button 🔄
3. Select "Empty Cache and Hard Reload"
```

#### Step 3: Create a NEW Booking
**Important:** Old bookings will still show "Assignment Pending"
- Only NEW bookings (created after the fix) will show tour guide immediately

#### Step 4: Verify Tour Has Tour Guide
```sql
-- Check if tour has a tour guide assigned
SELECT tour_id, name, tour_guide_id 
FROM tours 
WHERE name LIKE '%YOUR_TOUR_NAME%';
```

If `tour_guide_id` is NULL, assign one:
```sql
UPDATE tours 
SET tour_guide_id = 14 
WHERE tour_id = YOUR_TOUR_ID;
```

#### Step 5: Check Database
```sql
-- Check the latest booking
SELECT 
  booking_id,
  tour_id,
  driver_id,
  tour_guide_id, -- Should NOT be NULL!
  status
FROM bookings
ORDER BY booking_id DESC
LIMIT 1;
```

**Expected:** `tour_guide_id` should have a value (e.g., 14)

---

## 🐌 **Issue 2: App Still Lagging/Slow**

### Problem:
- Pages take 3-5 seconds to load
- Buttons lag when clicked
- Map takes forever to load

### Solution:

#### Step 1: Verify Indexes Were Created

**Open phpMyAdmin → Select `tes_tour` database → Click "SQL" tab → Run:**

```sql
-- Check if indexes exist
SHOW INDEX FROM bookings;
```

**Expected:** Should show 8+ indexes including:
- `idx_bookings_user_id`
- `idx_bookings_tour_id`
- `idx_bookings_status`
- `idx_bookings_driver_id`
- `idx_bookings_tour_guide_id`

**If you see ONLY `PRIMARY` index, indexes are MISSING!**

#### Step 2: Create Indexes (If Missing)

**Run this SQL script:**

```sql
-- Run the complete script
SOURCE scripts/check-and-fix-performance.sql;

-- OR copy/paste from scripts/add-critical-indexes.sql
```

**OR manually create the most critical ones:**

```sql
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX idx_bookings_tour_guide_id ON bookings(tour_guide_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### Step 3: Restart MySQL

**In AMPPS:**
1. Stop MySQL
2. Start MySQL
3. Wait 10 seconds

#### Step 4: Restart Dev Server

```bash
# Stop server (Ctrl+C)
rm -rf .next
npm run dev
```

#### Step 5: Clear Browser Cache

```
1. Press Ctrl+Shift+Delete
2. Select "All time"
3. Check "Cached images and files"
4. Click "Clear data"
```

#### Step 6: Test Performance

**Open browser DevTools (F12) → Network tab:**

1. Reload the page
2. Check `/api/bookings` timing
3. **Should be < 100ms** (was 500-2000ms)

**If still slow:**
- Check for errors in browser console (F12)
- Check for errors in terminal
- Try different browser (Chrome recommended)

---

## 🗺️ **Issue 3: Map Still Slow**

### Problem:
- Map takes 5-10 seconds to load
- Map freezes when loading

### Solution:

#### Step 1: Check Browser Console
```
1. Press F12
2. Go to Console tab
3. Look for errors (red text)
```

#### Step 2: Disable Browser Extensions
```
1. Open incognito/private window
2. Test map there
3. If faster, disable extensions one by one
```

#### Step 3: Check Network Speed
```
1. Press F12
2. Go to Network tab
3. Check if Leaflet CSS/JS are loading
4. Should be < 500ms each
```

#### Step 4: Verify Map Optimizations

**Check `components/MapTrackerClient.tsx`:**

Should have these optimizations:
- ✅ Icons created outside component
- ✅ Polling interval = 15000ms (15 seconds)
- ✅ `fetchingRef` to prevent cascading fetches

---

## 💳 **Issue 4: Payment Errors**

### Problem:
- "Payment initialization failed"
- "Invalid API key"

### Solution:

#### Step 1: Check Environment Variables

**File: `.env.local`**

```bash
CHAPPA_SECRET_KEY=your_secret_key_here
NEXT_PUBLIC_CHAPPA_PUBLIC_KEY=your_public_key_here
```

#### Step 2: Restart Dev Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

#### Step 3: Check Chappa API Status

Visit: https://dashboard.chapa.co/

---

## 🔐 **Issue 5: Authentication Errors**

### Problem:
- "Authentication required"
- Redirected to login page

### Solution:

#### Step 1: Clear Cookies

```
1. Press F12
2. Go to Application tab
3. Click "Cookies"
4. Delete all cookies
5. Reload page
```

#### Step 2: Login Again

```
1. Go to /login
2. Enter credentials
3. Check "Remember me"
4. Login
```

---

## 📊 **Issue 6: Database Connection Errors**

### Problem:
- "Server error"
- "Database connection failed"

### Solution:

#### Step 1: Check AMPPS

```
1. Open AMPPS
2. Check if MySQL is running (green light)
3. If not, click "Start"
```

#### Step 2: Check Database Credentials

**File: `lib/db.js`**

```javascript
host: 'localhost',
user: 'root',
password: 'mysql',
database: 'tes_tour',
```

#### Step 3: Test Database Connection

**Open phpMyAdmin:**
```
http://localhost/phpmyadmin
```

**Login with:**
- Username: `root`
- Password: `mysql`

**If can't login, reset MySQL password in AMPPS**

---

## 🔄 **Issue 7: Changes Not Showing**

### Problem:
- Made changes but not visible
- Old code still running

### Solution:

#### Step 1: Hard Refresh

```
1. Press Ctrl+Shift+R (Windows)
2. Or Cmd+Shift+R (Mac)
```

#### Step 2: Clear Next.js Cache

```bash
# Stop server (Ctrl+C)
rm -rf .next
npm run dev
```

#### Step 3: Clear Browser Cache

```
1. Press Ctrl+Shift+Delete
2. Select "All time"
3. Clear cache
```

#### Step 4: Restart Everything

```bash
# Stop server
# Stop AMPPS
# Start AMPPS
# Start server
npm run dev
```

---

## 🆘 **Still Having Issues?**

### Check These:

1. **Browser Console (F12)** - Look for errors
2. **Terminal** - Look for errors
3. **Network Tab (F12)** - Check API responses
4. **Database** - Verify data exists

### Common Fixes:

- ✅ Restart dev server
- ✅ Clear browser cache
- ✅ Restart MySQL
- ✅ Try different browser
- ✅ Restart computer

---

## 📞 **Need More Help?**

Check these files:
- `FIX_ASSIGNMENT_PENDING_ISSUE.md` - Assignment pending fix
- `QUICK_PERFORMANCE_FIX.md` - Performance optimization
- `README_PERFORMANCE.md` - Performance overview
- `PERFORMANCE_OPTIMIZATION_GUIDE.md` - Detailed guide

