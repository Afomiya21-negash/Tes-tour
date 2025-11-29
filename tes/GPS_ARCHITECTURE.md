# GPS Location Tracking - System Architecture

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │  Tour Guide      │              │   Customer       │         │
│  │  Dashboard       │              │   Dashboard      │         │
│  │                  │              │                  │         │
│  │  - View Tours    │              │  - View Bookings │         │
│  │  - Track Tab     │              │  - Track Button  │         │
│  │  - GPS Tracker   │              │  - GPS Modal     │         │
│  └────────┬─────────┘              └────────┬─────────┘         │
│           │                                 │                    │
│           └────────────┬────────────────────┘                    │
│                        │                                         │
│                ┌───────▼────────┐                                │
│                │  GPSTracker    │                                │
│                │  Component     │                                │
│                │                │                                │
│                │  - Start/Stop  │                                │
│                │  - Update Loc  │                                │
│                │  - View Others │                                │
│                │  - Auto Update │                                │
│                └───────┬────────┘                                │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                         API LAYER                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Next.js API Routes                          │    │
│  │                                                           │    │
│  │  POST /api/location/update                               │    │
│  │  ├─ Validate JWT Token                                   │    │
│  │  ├─ Validate Coordinates                                 │    │
│  │  └─ Call LocationTrackingService.updateLocation()        │    │
│  │                                                           │    │
│  │  GET /api/location/[bookingId]                           │    │
│  │  ├─ Validate JWT Token                                   │    │
│  │  ├─ Check Authorization                                  │    │
│  │  └─ Call LocationTrackingService.getBookingLocations()   │    │
│  │                                                           │    │
│  │  GET /api/location/history/[bookingId]/[userId]          │    │
│  │  ├─ Validate JWT Token                                   │    │
│  │  └─ Call LocationTrackingService.getLocationHistory()    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                      DOMAIN LAYER                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │         LocationTrackingService                          │    │
│  │                                                           │    │
│  │  updateLocation(userId, userType, locationUpdate)        │    │
│  │  ├─ Verify booking exists and is active                  │    │
│  │  ├─ Check user authorization                             │    │
│  │  ├─ Insert location record                               │    │
│  │  └─ Return location_id                                   │    │
│  │                                                           │    │
│  │  getBookingLocations(bookingId, requestingUserId)        │    │
│  │  ├─ Verify user is participant                           │    │
│  │  ├─ Fetch customer location                              │    │
│  │  ├─ Fetch tour guide location                            │    │
│  │  ├─ Fetch driver location                                │    │
│  │  └─ Return all participants with latest locations        │    │
│  │                                                           │    │
│  │  getLocationHistory(bookingId, userId, limit)            │    │
│  │  ├─ Fetch location records                               │    │
│  │  └─ Return ordered by timestamp DESC                     │    │
│  │                                                           │    │
│  │  cleanupOldLocations()                                   │    │
│  │  └─ Delete records older than 7 days                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ MySQL2
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                      DATABASE LAYER                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              location_tracking Table                     │    │
│  │                                                           │    │
│  │  Columns:                                                │    │
│  │  - location_id (PK)                                      │    │
│  │  - booking_id (FK → bookings)                            │    │
│  │  - user_id (FK → users)                                  │    │
│  │  - user_type (customer/tourguide/driver)                 │    │
│  │  - latitude (DECIMAL 10,8)                               │    │
│  │  - longitude (DECIMAL 11,8)                              │    │
│  │  - accuracy, altitude, speed, heading                    │    │
│  │  - timestamp, created_at                                 │    │
│  │                                                           │    │
│  │  Indexes:                                                │    │
│  │  - idx_booking_id                                        │    │
│  │  - idx_user_id                                           │    │
│  │  - idx_timestamp                                         │    │
│  │  - idx_booking_user_timestamp (composite)                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Related Tables                              │    │
│  │                                                           │    │
│  │  - bookings (booking_id, user_id, tour_guide_id,         │    │
│  │              driver_id, status)                          │    │
│  │  - users (user_id, first_name, last_name, email, role)   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Diagram

### Location Update Flow

```
┌──────────────┐
│   Browser    │
│  Geolocation │
│     API      │
└──────┬───────┘
       │ getCurrentPosition()
       │
       ▼
┌──────────────────┐
│  GPSTracker      │
│  Component       │
│                  │
│  - Get coords    │
│  - Prepare data  │
└──────┬───────────┘
       │ POST /api/location/update
       │ {booking_id, lat, lng, ...}
       │
       ▼
┌──────────────────┐
│  API Route       │
│  /update         │
│                  │
│  - Verify JWT    │
│  - Validate data │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Location        │
│  Tracking        │
│  Service         │
│                  │
│  - Check auth    │
│  - Insert record │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Database       │
│                  │
│  INSERT INTO     │
│  location_       │
│  tracking        │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Response       │
│                  │
│  {success: true, │
│   location_id}   │
└──────────────────┘
```

### Location Retrieval Flow

```
┌──────────────────┐
│  GPSTracker      │
│  Component       │
│                  │
│  - Timer (15s)   │
│  - Fetch locs    │
└──────┬───────────┘
       │ GET /api/location/{bookingId}
       │
       ▼
┌──────────────────┐
│  API Route       │
│  /[bookingId]    │
│                  │
│  - Verify JWT    │
│  - Check auth    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Location        │
│  Tracking        │
│  Service         │
│                  │
│  - Get customer  │
│  - Get guide     │
│  - Get driver    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Database       │
│                  │
│  SELECT with     │
│  subqueries for  │
│  latest locs     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   Response       │
│                  │
│  {participants:  │
│   [...]}         │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  GPSTracker      │
│  Component       │
│                  │
│  - Update UI     │
│  - Show markers  │
└──────────────────┘
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Layers                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: HTTPS/TLS                                          │
│  ├─ Encrypted communication                                 │
│  └─ Required for Geolocation API                            │
│                                                              │
│  Layer 2: JWT Authentication                                │
│  ├─ Token in HTTP-only cookie                               │
│  ├─ Verified on every request                               │
│  └─ Contains user_id and role                               │
│                                                              │
│  Layer 3: Authorization                                     │
│  ├─ Verify user is participant in booking                   │
│  ├─ Check booking status (confirmed/in-progress)            │
│  └─ Validate user_type matches role                         │
│                                                              │
│  Layer 4: Input Validation                                  │
│  ├─ Coordinate bounds checking                              │
│  ├─ Booking ID validation                                   │
│  └─ SQL injection prevention (parameterized queries)        │
│                                                              │
│  Layer 5: Data Privacy                                      │
│  ├─ Auto-delete after 7 days                                │
│  ├─ User-controlled sharing                                 │
│  └─ No cross-booking data access                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Component Hierarchy

```
App
│
├── Tour Guide Dashboard
│   ├── Navigation Tabs
│   │   ├── Tours Tab
│   │   ├── Itineraries Tab
│   │   ├── Location Tab ← GPS Tracking
│   │   └── Reviews Tab
│   │
│   └── Location Tab Content
│       ├── Tour Selector Dropdown
│       └── GPSTracker Component
│           ├── Control Panel
│           │   ├── Start/Stop Button
│           │   └── Manual Update Button
│           ├── Current Location Display
│           └── Participants List
│               ├── Customer Card
│               ├── Tour Guide Card (self)
│               └── Driver Card
│
└── Customer Dashboard
    ├── Bookings List
    │   └── Booking Card
    │       ├── Booking Details
    │       └── Track Location Button
    │
    └── GPS Tracker Modal
        └── GPSTracker Component
            ├── Control Panel
            ├── Current Location Display
            └── Participants List
                ├── Customer Card (self)
                ├── Tour Guide Card
                └── Driver Card
```

## 🗄️ Database Relationships

```
┌─────────────────┐
│     users       │
│─────────────────│
│ user_id (PK)    │◄──┐
│ first_name      │   │
│ last_name       │   │
│ email           │   │
│ role            │   │
└─────────────────┘   │
                      │
                      │ FK: user_id
                      │
┌─────────────────┐   │
│    bookings     │   │
│─────────────────│   │
│ booking_id (PK) │◄──┼──┐
│ user_id (FK)    │───┘  │
│ tour_guide_id   │───┐  │
│ driver_id       │───┤  │
│ status          │   │  │
│ start_date      │   │  │
│ end_date        │   │  │
└─────────────────┘   │  │
                      │  │
                      │  │ FK: booking_id
                      │  │
┌─────────────────────┐ │
│ location_tracking   │ │
│─────────────────────│ │
│ location_id (PK)    │ │
│ booking_id (FK)     │─┘
│ user_id (FK)        │─┐
│ user_type           │ │
│ latitude            │ │
│ longitude           │ │
│ accuracy            │ │
│ timestamp           │ │
└─────────────────────┘ │
                        │
                        └──► Refers back to users table
```

## 🔄 State Management

### GPSTracker Component State

```javascript
{
  // Participants data
  participants: Participant[],
  
  // Loading states
  loading: boolean,
  error: string,
  
  // Location tracking state
  locationEnabled: boolean,
  currentPosition: GeolocationPosition | null,
  lastUpdate: Date | null,
  isTracking: boolean,
  
  // References
  watchIdRef: number | null,
  updateIntervalRef: NodeJS.Timeout | null
}
```

### Dashboard State

```javascript
// Tour Guide Dashboard
{
  activeTab: "tours" | "itineraries" | "location" | "reviews",
  selectedBookingForTracking: number | null,
  tours: Tour[],
  // ... other state
}

// Customer Dashboard
{
  showGPSTracker: boolean,
  selectedBookingForTracking: Booking | null,
  bookings: Booking[],
  // ... other state
}
```

## 🚀 Performance Considerations

### Optimization Strategies

```
1. Database Indexing
   ├─ Composite index on (booking_id, user_id, timestamp)
   ├─ Individual indexes on frequently queried columns
   └─ Optimized for latest location queries

2. Update Intervals
   ├─ Location updates: 30 seconds (configurable)
   ├─ UI refresh: 15 seconds
   └─ Prevents excessive API calls

3. Query Optimization
   ├─ Subqueries for latest locations
   ├─ Single query for all participants
   └─ Minimal data transfer

4. Data Cleanup
   ├─ Automatic deletion after 7 days
   ├─ Stored procedure for batch operations
   └─ Reduces table size and query time

5. Client-Side Caching
   ├─ Cache participant data
   ├─ Only update changed locations
   └─ Reduce re-renders
```

## 🌐 API Contract

### Request/Response Formats

```typescript
// POST /api/location/update
Request: {
  booking_id: number
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  speed?: number
  heading?: number
}

Response: {
  success: boolean
  location_id: number
  message: string
}

// GET /api/location/{bookingId}
Response: {
  success: boolean
  booking_id: number
  participants: Array<{
    user_id: number
    user_type: 'customer' | 'tourguide' | 'driver'
    first_name: string
    last_name: string
    email: string
    phone_number?: string
    latest_location?: {
      latitude: number
      longitude: number
      accuracy?: number
      timestamp: Date
    }
  }>
}
```

## 📱 Browser Geolocation API Integration

```
┌─────────────────────────────────────────────────────────┐
│          Browser Geolocation API Flow                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Check if geolocation is supported                   │
│     navigator.geolocation exists?                       │
│                                                          │
│  2. Request permission                                  │
│     getCurrentPosition() or watchPosition()             │
│                                                          │
│  3. User grants/denies permission                       │
│     ├─ Granted: Receive position                        │
│     └─ Denied: Show error message                       │
│                                                          │
│  4. Receive position data                               │
│     {                                                    │
│       coords: {                                          │
│         latitude, longitude,                            │
│         accuracy, altitude,                             │
│         speed, heading                                  │
│       },                                                 │
│       timestamp                                          │
│     }                                                    │
│                                                          │
│  5. Send to backend                                     │
│     POST /api/location/update                           │
│                                                          │
│  6. Watch for position changes                          │
│     watchPosition() → continuous updates                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

This architecture provides a scalable, secure, and efficient GPS tracking system that can handle multiple concurrent users while maintaining data privacy and system performance.
