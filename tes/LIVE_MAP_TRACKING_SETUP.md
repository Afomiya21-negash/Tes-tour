# 🗺️ Live Map Tracking - Setup Complete!

## What's New?

I've completely redesigned the GPS tracking feature to use **Google Maps with real-time route visualization** - just like Uber!

### ✨ Key Features

1. **Real-Time Google Maps Display**
   - Live map showing all participants
   - Route path drawn as the tour guide moves
   - Color-coded markers (Green = Tour Guide, Blue = Customer, Red = Driver)

2. **Journey Control (Tour Guide)**
   - "Start Journey" button to begin tracking
   - "Stop Tracking" button to end
   - Auto-updates location every 10 seconds

3. **Live Stats Dashboard**
   - Journey duration
   - Distance traveled
   - Active participants count

4. **Customer View**
   - See tour guide's live location on map
   - View the route being traveled
   - Track journey progress in real-time

## 🚀 Setup Steps

### Step 1: Database (Already Done ✅)
The `location_tracking` table is still needed. Run this in phpMyAdmin if you haven't:

```sql
USE tes_tour;

CREATE TABLE IF NOT EXISTS location_tracking (
  location_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  user_id INT NOT NULL,
  user_type ENUM('customer', 'tourguide', 'driver') NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2) DEFAULT NULL,
  altitude DECIMAL(10, 2) DEFAULT NULL,
  speed DECIMAL(10, 2) DEFAULT NULL,
  heading DECIMAL(10, 2) DEFAULT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_booking_id (booking_id),
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

### Step 2: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project (or use existing)
3. Enable **Maps JavaScript API**
4. Create an API key
5. Add to your `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
```

**See `GOOGLE_MAPS_SETUP.md` for detailed instructions!**

### Step 3: Restart Server

```bash
npm run dev
```

## 📱 How to Use

### For Tour Guides:

1. **Go to Tour Guide Dashboard**
2. **Click "Update Location" tab**
3. **Select an active tour** from dropdown
4. **Click "Start Journey"** button
5. **Grant location permissions** when browser asks
6. **Map will show your live location** and draw the route as you move
7. **Click "Stop Tracking"** when tour ends

### For Customers:

1. **Go to Dashboard**
2. **Find your confirmed/in-progress booking**
3. **Click "Track Location"** button
4. **See the live map** with tour guide's location
5. **Watch the route** being drawn in real-time
6. **See journey stats** (duration, distance, etc.)

## 🎨 Visual Features

### Map Markers:
- 🟢 **Green** = Tour Guide (you're following them!)
- 🔵 **Blue** = Customer
- 🔴 **Red** = Driver

### Route Line:
- **Green polyline** shows the path traveled
- Updates automatically as tour guide moves

### Stats Cards:
- ⏱️ **Duration** - How long the journey has been active
- 📍 **Distance** - Total kilometers traveled
- 👥 **Participants** - Number of people actively sharing location

## 🔒 Privacy & Permissions

- Location sharing only works during active tours
- Tour guide must click "Start Journey" to begin
- Customers can see tour guide's location automatically
- All participants can see each other on the map
- Location data is stored for 7 days then auto-deleted

## 🆓 Google Maps Pricing

**Free Tier includes:**
- $200 credit per month
- 28,000 map loads/month
- More than enough for a tour company!

## 🐛 Troubleshooting

### "Location permission denied"
- Click the lock icon in browser address bar
- Allow location access
- Refresh the page

### "Map not loading"
- Check if Google Maps API key is added to `.env.local`
- Verify the API key is correct
- Make sure Maps JavaScript API is enabled in Google Cloud

### "No active tours"
- Tour must be "confirmed" or "in-progress" status
- Check that you're assigned to the booking

## 📂 Files Created/Modified

**New Files:**
- `components/LiveMapTracker.tsx` - Main map tracking component
- `GOOGLE_MAPS_SETUP.md` - Detailed Google Maps setup guide
- `LIVE_MAP_TRACKING_SETUP.md` - This file

**Modified Files:**
- `app/tourguide/page.tsx` - Added LiveMapTracker integration
- `app/dashboard/page.tsx` - Added LiveMapTracker for customers
- `package.json` - Added @react-google-maps/api

**Database:**
- `location_tracking` table (same as before)

## 🎉 Ready to Test!

1. ✅ Install packages: `npm install` (already done)
2. ⏳ Get Google Maps API key
3. ⏳ Add to `.env.local`
4. ⏳ Restart server
5. ✅ Create database table (if not done)
6. 🚀 Start a tour and test!

---

**Questions?** Check `GOOGLE_MAPS_SETUP.md` for detailed Google Maps configuration.
