# GPS Location Tracking Feature

## Overview
This feature enables real-time GPS location tracking between customers and tour guides during active trips, similar to Uber's tracking system. Both parties can see each other's locations on a map and track their whereabouts throughout the tour.

## Features

### For Tour Guides
- **Start/Stop Location Sharing**: Tour guides can enable GPS tracking for active tours
- **View Customer Location**: See real-time location of customers on the tour
- **Automatic Updates**: Location updates automatically every 30 seconds
- **Manual Update**: Option to manually update location at any time
- **Tour Selection**: Select from active (confirmed or in-progress) tours to track

### For Customers
- **Track Tour Guide**: View tour guide's real-time location during the trip
- **Share Own Location**: Optionally share location with tour guide
- **View All Participants**: See locations of tour guide, driver (if assigned), and other participants
- **Location History**: Access to location history for the trip
- **Map Integration**: Open any participant's location in Google Maps

## Database Schema

### Location Tracking Table
```sql
CREATE TABLE location_tracking (
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

## Installation

### 1. Database Setup
Run the migration script to create the location tracking table:

```bash
# Navigate to your MySQL client or phpMyAdmin
# Execute the SQL file:
source lib/migrations/create_location_tracking.sql
```

Or manually execute:
```sql
USE your_database_name;
SOURCE /path/to/tes/lib/migrations/create_location_tracking.sql;
```

### 2. Verify Installation
Check that the table was created:
```sql
SHOW TABLES LIKE 'location_tracking';
DESCRIBE location_tracking;
```

## API Endpoints

### 1. Update Location
**POST** `/api/location/update`

Update the current user's location for a specific booking.

**Request Body:**
```json
{
  "booking_id": 123,
  "latitude": 9.0320,
  "longitude": 38.7469,
  "accuracy": 10.5,
  "altitude": 2355.0,
  "speed": 5.2,
  "heading": 180.0
}
```

**Response:**
```json
{
  "success": true,
  "location_id": 456,
  "message": "Location updated successfully"
}
```

### 2. Get Booking Locations
**GET** `/api/location/{bookingId}`

Get latest locations for all participants in a booking.

**Response:**
```json
{
  "success": true,
  "booking_id": 123,
  "participants": [
    {
      "user_id": 1,
      "user_type": "customer",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone_number": "+251911234567",
      "latest_location": {
        "latitude": 9.0320,
        "longitude": 38.7469,
        "accuracy": 10.5,
        "timestamp": "2024-01-15T10:30:00Z"
      }
    },
    {
      "user_id": 2,
      "user_type": "tourguide",
      "first_name": "Jane",
      "last_name": "Smith",
      "email": "jane@example.com",
      "latest_location": {
        "latitude": 9.0325,
        "longitude": 38.7475,
        "accuracy": 8.2,
        "timestamp": "2024-01-15T10:31:00Z"
      }
    }
  ]
}
```

### 3. Get Location History
**GET** `/api/location/history/{bookingId}/{userId}?limit=50`

Get location history for a specific user on a booking.

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 50, max: 200)

**Response:**
```json
{
  "success": true,
  "booking_id": 123,
  "user_id": 1,
  "history": [
    {
      "location_id": 456,
      "booking_id": 123,
      "user_id": 1,
      "user_type": "customer",
      "latitude": 9.0320,
      "longitude": 38.7469,
      "accuracy": 10.5,
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## Usage

### Tour Guide Dashboard

1. Navigate to the Tour Guide Dashboard
2. Click on the "Update Location" tab in the navigation
3. Select an active tour from the dropdown
4. Click "Start Sharing Location" to begin tracking
5. The system will automatically update your location every 30 seconds
6. View customer and driver locations in real-time
7. Click "Stop Sharing" when the tour is complete

### Customer Dashboard

1. Navigate to your Dashboard
2. Find a confirmed or in-progress booking
3. Click the "Track Location" button
4. View the tour guide's location in real-time
5. Optionally enable location sharing to let the guide see your location
6. Click on any participant to view their location on Google Maps

## Security & Privacy

### Authorization
- Only participants in a booking can access location data
- Users must be authenticated with a valid JWT token
- Location updates are only allowed for confirmed or in-progress bookings

### Data Retention
- Location data is automatically cleaned up after 7 days
- Only the latest 50 location points are typically displayed
- Historical data can be accessed via the API with appropriate permissions

### Privacy Controls
- Users can start and stop location sharing at any time
- Location sharing is opt-in for customers
- Tour guides are expected to share location during active tours

## Browser Compatibility

The GPS tracking feature requires:
- Modern browser with Geolocation API support
- HTTPS connection (required for geolocation in most browsers)
- User permission to access location

### Supported Browsers
- Chrome 50+
- Firefox 55+
- Safari 10+
- Edge 12+

## Troubleshooting

### Location Not Updating
1. Check browser permissions for location access
2. Ensure HTTPS is enabled
3. Verify the booking is in "confirmed" or "in-progress" status
4. Check network connectivity

### Permission Denied Error
- Grant location permissions in browser settings
- On mobile, check app-level location permissions
- Reload the page after granting permissions

### Accuracy Issues
- GPS accuracy depends on device and environment
- Indoor locations may have reduced accuracy
- Wait a few seconds for GPS to stabilize

## Technical Details

### Components
- **GPSTracker.tsx**: Main tracking component used by both customers and tour guides
- **LocationTrackingService**: Backend service for managing location data
- **API Routes**: RESTful endpoints for location operations

### Update Frequency
- Default: 30 seconds (configurable)
- Manual updates available on demand
- Automatic refresh of all participants every 15 seconds

### Data Flow
1. Browser requests user's location via Geolocation API
2. Location sent to backend via POST /api/location/update
3. Backend validates authorization and stores location
4. Frontend polls GET /api/location/{bookingId} every 15 seconds
5. UI updates with latest locations for all participants

## Future Enhancements

Potential improvements:
- WebSocket support for real-time updates
- Route history visualization
- Geofencing alerts
- Offline location caching
- Battery optimization modes
- Distance calculations between participants
- ETA predictions

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify database migration was successful
3. Check browser console for errors
4. Review API endpoint responses
5. Contact system administrator

## License

This feature is part of the Tes Tour application and follows the same license terms.
