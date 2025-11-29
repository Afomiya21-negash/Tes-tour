# GPS Location Tracking - Quick Setup Guide

## 🚀 Quick Start

### Step 1: Database Setup
Run the setup SQL script to create the location tracking table:

```bash
# Option 1: Using MySQL command line
mysql -u your_username -p tes_tour < setup-gps-tracking.sql

# Option 2: Using phpMyAdmin
# 1. Open phpMyAdmin
# 2. Select your database (tes_tour)
# 3. Click "Import" tab
# 4. Choose setup-gps-tracking.sql file
# 5. Click "Go"
```

### Step 2: Verify Database
Check that the table was created successfully:

```sql
USE tes_tour;
SHOW TABLES LIKE 'location_tracking';
DESCRIBE location_tracking;
```

You should see a table with these columns:
- location_id (Primary Key)
- booking_id
- user_id
- user_type
- latitude
- longitude
- accuracy
- altitude
- speed
- heading
- timestamp
- created_at

### Step 3: Test the Feature

#### For Tour Guides:
1. Log in as a tour guide
2. Navigate to Tour Guide Dashboard
3. Start a tour (or have a confirmed booking)
4. Click "Update Location" tab
5. Select an active tour
6. Click "Start Sharing Location"
7. Grant browser location permissions when prompted
8. You should see your location and customer locations

#### For Customers:
1. Log in as a customer
2. Navigate to Dashboard
3. Find a confirmed or in-progress booking
4. Click "Track Location" button
5. Grant browser location permissions when prompted
6. You should see tour guide's location
7. Optionally click "Start Sharing Location" to share your location

## 🔧 Configuration

### Update Intervals
The default update interval is 30 seconds. To change it:

**Tour Guide Dashboard** (`app/tourguide/page.tsx`):
```tsx
<GPSTracker 
  bookingId={selectedBookingForTracking} 
  userRole="tourguide"
  autoUpdate={true}
  updateInterval={30000}  // Change this value (in milliseconds)
/>
```

**Customer Dashboard** (`app/dashboard/page.tsx`):
```tsx
<GPSTracker 
  bookingId={selectedBookingForTracking.booking_id}
  userRole="customer"
  autoUpdate={true}
  updateInterval={30000}  // Change this value (in milliseconds)
/>
```

### Location Accuracy
The system uses high accuracy mode by default. This is configured in `GPSTracker.tsx`:

```tsx
navigator.geolocation.getCurrentPosition(
  successCallback,
  errorCallback,
  {
    enableHighAccuracy: true,  // Set to false for lower accuracy but better battery
    timeout: 10000,            // Timeout in milliseconds
    maximumAge: 0              // Don't use cached positions
  }
)
```

## 📱 Browser Requirements

### Required Permissions
- **Location Access**: Users must grant location permissions
- **HTTPS**: Required for geolocation API (except localhost)

### Testing on Localhost
For development, you can test on:
- `http://localhost:3000` ✅
- `http://127.0.0.1:3000` ✅

For production, you MUST use HTTPS:
- `https://yourdomain.com` ✅
- `http://yourdomain.com` ❌ (will not work)

## 🐛 Troubleshooting

### Issue: "Location not supported"
**Solution**: 
- Ensure you're using HTTPS (or localhost for testing)
- Check browser compatibility
- Try a different browser

### Issue: "Permission denied"
**Solution**:
1. Check browser location settings
2. Clear site permissions and try again
3. On mobile, check app-level permissions

### Issue: "Booking not found or not active"
**Solution**:
- Ensure booking status is "confirmed" or "in-progress"
- Check that you're assigned to the booking
- Verify booking_id is correct

### Issue: "Location not updating"
**Solution**:
1. Check network connectivity
2. Verify API endpoints are accessible
3. Check browser console for errors
4. Ensure database connection is working

### Issue: High battery drain
**Solution**:
- Increase update interval (e.g., 60000ms = 1 minute)
- Set `enableHighAccuracy: false` for lower accuracy
- Stop tracking when not needed

## 🔒 Security Checklist

- ✅ Only authenticated users can access location data
- ✅ Users can only see locations for their own bookings
- ✅ Location data is automatically cleaned after 7 days
- ✅ HTTPS required for production
- ✅ Authorization checks on all API endpoints

## 📊 Monitoring

### Check Location Data
```sql
-- See recent location updates
SELECT 
  lt.location_id,
  lt.booking_id,
  u.first_name,
  u.last_name,
  lt.user_type,
  lt.latitude,
  lt.longitude,
  lt.timestamp
FROM location_tracking lt
JOIN users u ON lt.user_id = u.user_id
ORDER BY lt.timestamp DESC
LIMIT 20;
```

### Check Active Tracking
```sql
-- See who is currently sharing location (last 5 minutes)
SELECT 
  lt.booking_id,
  COUNT(DISTINCT lt.user_id) as active_users,
  MAX(lt.timestamp) as last_update
FROM location_tracking lt
WHERE lt.timestamp > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
GROUP BY lt.booking_id;
```

### Clean Old Data
```sql
-- Run cleanup procedure
CALL cleanup_old_locations();
```

## 🎯 Testing Scenarios

### Scenario 1: Tour Guide Shares Location
1. Tour guide starts a tour
2. Tour guide enables location sharing
3. Customer views tour guide's location
4. Both see each other on the map

### Scenario 2: Multiple Participants
1. Booking has customer, tour guide, and driver
2. All three share their locations
3. Each can see the others' locations
4. Locations update in real-time

### Scenario 3: Location History
1. Track locations over time
2. View movement patterns
3. Access historical data via API

## 📈 Performance Tips

1. **Database Indexing**: Already optimized with indexes on:
   - booking_id
   - user_id
   - timestamp
   - Combined index (booking_id, user_id, timestamp)

2. **API Caching**: Consider implementing caching for frequently accessed locations

3. **Batch Updates**: The system batches location updates to reduce database load

4. **Cleanup**: Run the cleanup procedure weekly:
   ```sql
   CALL cleanup_old_locations();
   ```

## 🆘 Support

If you encounter issues:

1. Check the main `GPS_TRACKING_README.md` for detailed documentation
2. Review browser console for JavaScript errors
3. Check server logs for API errors
4. Verify database connection and permissions
5. Test with a different browser or device

## ✅ Success Indicators

You'll know it's working when:
- ✅ Location permissions are granted
- ✅ "Start Sharing Location" button works
- ✅ Current coordinates are displayed
- ✅ Other participants' locations are visible
- ✅ Locations update automatically
- ✅ "View on Map" opens Google Maps correctly

## 🎉 You're All Set!

The GPS tracking feature is now ready to use. Tour guides and customers can track each other's locations during active trips, just like Uber!

For more details, see `GPS_TRACKING_README.md`.
