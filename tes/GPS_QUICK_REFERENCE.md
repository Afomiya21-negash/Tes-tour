# GPS Location Tracking - Quick Reference Card

## 🚀 Quick Setup (5 Minutes)

```bash
# 1. Run database setup
mysql -u root -p tes_tour < setup-gps-tracking.sql

# 2. Verify table exists
mysql -u root -p -e "USE tes_tour; DESCRIBE location_tracking;"

# 3. Start your Next.js server
npm run dev

# 4. Test the feature!
```

## 📍 Key Locations

| File | Purpose |
|------|---------|
| `setup-gps-tracking.sql` | Database setup script |
| `components/GPSTracker.tsx` | Main GPS component |
| `app/api/location/update/route.ts` | Update location API |
| `app/api/location/[bookingId]/route.ts` | Get locations API |
| `lib/domain.ts` | Location tracking service |

## 🎯 API Endpoints Cheat Sheet

```bash
# Update location
POST /api/location/update
Body: {booking_id, latitude, longitude, accuracy?, ...}
Returns: {success, location_id, message}

# Get all participants' locations
GET /api/location/{bookingId}
Returns: {success, booking_id, participants[]}

# Get location history
GET /api/location/history/{bookingId}/{userId}?limit=50
Returns: {success, booking_id, user_id, history[]}
```

## 🔑 Key Features

✅ Real-time location tracking  
✅ Auto-update every 30 seconds  
✅ Manual update on demand  
✅ View all participants  
✅ Google Maps integration  
✅ Location history  
✅ Privacy controls  
✅ Secure & authorized  

## 👥 User Roles

| Role | Can Track | Can Be Tracked |
|------|-----------|----------------|
| Customer | ✅ Yes | ✅ Yes |
| Tour Guide | ✅ Yes | ✅ Yes |
| Driver | ✅ Yes | ✅ Yes |

## 🔐 Security Checklist

- ✅ JWT authentication required
- ✅ HTTPS in production
- ✅ Only booking participants can access
- ✅ Only active bookings (confirmed/in-progress)
- ✅ Coordinate validation
- ✅ Auto-cleanup after 7 days

## 🎨 UI Components

### Tour Guide Dashboard
```
Tour Guide Dashboard → Update Location Tab → Select Tour → Start Sharing
```

### Customer Dashboard
```
Customer Dashboard → Booking Card → Track Location Button → Modal Opens
```

## 📊 Database Quick Reference

```sql
-- Check recent locations
SELECT * FROM location_tracking 
ORDER BY timestamp DESC LIMIT 10;

-- Count active trackers (last 5 min)
SELECT booking_id, COUNT(*) as trackers
FROM location_tracking
WHERE timestamp > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
GROUP BY booking_id;

-- Cleanup old data
CALL cleanup_old_locations();

-- Delete all location data (CAUTION!)
TRUNCATE TABLE location_tracking;
```

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Permission denied | Grant location access in browser |
| Not updating | Check HTTPS, network, booking status |
| High battery drain | Increase update interval |
| Indoor inaccuracy | Normal - GPS less accurate indoors |
| HTTPS required | Use HTTPS in production, localhost for dev |

## ⚙️ Configuration Options

```tsx
// Update interval (milliseconds)
<GPSTracker updateInterval={30000} />  // 30 seconds
<GPSTracker updateInterval={60000} />  // 1 minute

// Auto-update
<GPSTracker autoUpdate={true} />   // Automatic
<GPSTracker autoUpdate={false} />  // Manual only

// User role
<GPSTracker userRole="customer" />
<GPSTracker userRole="tourguide" />
<GPSTracker userRole="driver" />
```

## 📱 Browser Requirements

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 50+ | ✅ Supported |
| Firefox | 55+ | ✅ Supported |
| Safari | 10+ | ✅ Supported |
| Edge | 12+ | ✅ Supported |

**Requirements:**
- HTTPS (or localhost)
- Geolocation API
- JavaScript enabled

## 🔄 Update Flow (Simplified)

```
Browser → Get GPS → Send to API → Save to DB → Fetch Updates → Display
  ↑                                                              ↓
  └──────────────────── Repeat every 30s ─────────────────────┘
```

## 📈 Performance Tips

1. **Optimize Update Interval**
   - Default: 30 seconds
   - Busy tours: 15 seconds
   - Battery saving: 60 seconds

2. **Run Cleanup Weekly**
   ```sql
   CALL cleanup_old_locations();
   ```

3. **Monitor Database Size**
   ```sql
   SELECT COUNT(*) FROM location_tracking;
   ```

## 🧪 Testing Commands

```bash
# Test database connection
mysql -u root -p -e "USE tes_tour; SELECT COUNT(*) FROM location_tracking;"

# Check API endpoints
curl -X POST http://localhost:3000/api/location/update \
  -H "Content-Type: application/json" \
  -d '{"booking_id":1,"latitude":9.0320,"longitude":38.7469}'

# View logs
tail -f .next/server.log
```

## 📞 Quick Support

| Problem | Check |
|---------|-------|
| Can't see locations | Verify booking status, check authorization |
| Location not accurate | Wait for GPS to stabilize, check device |
| API errors | Check JWT token, database connection |
| UI not updating | Check browser console, network tab |

## 🎯 Success Indicators

✅ "Start Sharing Location" button works  
✅ Coordinates displayed  
✅ Other participants visible  
✅ Auto-updates working  
✅ "View on Map" opens Google Maps  
✅ No console errors  

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `GPS_QUICK_REFERENCE.md` | This file - quick reference |
| `GPS_SETUP_GUIDE.md` | Detailed setup instructions |
| `GPS_TRACKING_README.md` | Complete documentation |
| `GPS_IMPLEMENTATION_SUMMARY.md` | Implementation details |
| `GPS_ARCHITECTURE.md` | System architecture |

## 💡 Pro Tips

1. **Test on localhost first** before deploying to production
2. **Grant permissions** when browser prompts
3. **Use HTTPS** in production (required for geolocation)
4. **Monitor battery** on mobile devices
5. **Run cleanup** regularly to keep database lean
6. **Check booking status** - must be confirmed or in-progress
7. **Verify authorization** - user must be participant in booking

## 🔮 Future Enhancements

- [ ] WebSocket for real-time updates
- [ ] Route visualization
- [ ] Geofencing alerts
- [ ] Offline caching
- [ ] Battery optimization
- [ ] Distance calculations
- [ ] ETA predictions

## ✅ Pre-Flight Checklist

Before using GPS tracking:

- [ ] Database table created
- [ ] HTTPS enabled (production)
- [ ] Booking is confirmed or in-progress
- [ ] User is assigned to booking
- [ ] Browser supports geolocation
- [ ] Location permissions granted
- [ ] Network connection active

## 🎉 You're Ready!

GPS tracking is now set up and ready to use. Tour guides and customers can track each other during active trips!

---

**Need More Help?**
- See `GPS_SETUP_GUIDE.md` for detailed setup
- See `GPS_TRACKING_README.md` for full documentation
- See `GPS_ARCHITECTURE.md` for technical details

**Quick Start:** Run `setup-gps-tracking.sql` → Start server → Test feature!
