# Itinerary Customization System - Setup Guide

## Overview
This system allows customers to customize their tour itineraries and automatically notifies tour guides of any changes.

## Features
- ✅ Customer itinerary customization interface
- ✅ Real-time notifications for tour guides
- ✅ View default vs customized itineraries
- ✅ Automatic tour guide notifications
- ✅ Notification badge with unread count

---

## Setup Instructions

### 1. Database Setup

Run the SQL script to create required tables:

```bash
mysql -u your_username -p your_database < setup-itinerary-customization.sql
```

Or manually execute the SQL file in your MySQL client.

**Tables Created:**
- `custom_itineraries` - Stores customer customized itineraries
- `itinerary_notifications` - Stores notifications for tour guides

### 2. File Structure

The following files have been created:

**API Routes:**
- `/app/api/itinerary/route.ts` - Get/Update itineraries
- `/app/api/itinerary/notifications/route.ts` - Notification management

**Components:**
- `/components/ItineraryCustomization.tsx` - Customer interface
- `/components/ItineraryNotifications.tsx` - Tour guide notification bell
- `/components/TourGuideItineraryView.tsx` - Tour guide view

---

## Integration Guide

### For Customer Dashboard

Add the itinerary customization component to customer bookings:

```tsx
import ItineraryCustomization from '@/components/ItineraryCustomization'

// In your customer dashboard or booking details page:
<ItineraryCustomization 
  bookingId={bookingId} 
  onClose={() => setShowItinerary(false)}
/>
```

### For Tour Guide Dashboard

Add notification bell and itinerary viewer:

```tsx
import ItineraryNotifications from '@/components/ItineraryNotifications'
import TourGuideItineraryView from '@/components/TourGuideItineraryView'

// In tour guide header/navbar:
<ItineraryNotifications 
  onViewItinerary={(bookingId) => {
    setSelectedBookingId(bookingId)
    setShowItineraryModal(true)
  }}
/>

// In modal or separate page:
{showItineraryModal && (
  <TourGuideItineraryView 
    bookingId={selectedBookingId}
    onClose={() => setShowItineraryModal(false)}
  />
)}
```

---

## Usage Flow

### Customer Side:
1. Customer views their booking
2. Clicks "View Itinerary" or similar button
3. Sees default tour itinerary
4. Clicks "Edit Itinerary" button
5. Modifies the description
6. Clicks "Save Changes"
7. Tour guide is automatically notified

### Tour Guide Side:
1. Notification bell shows unread count
2. Clicks bell to see notifications
3. Sees "Customer X updated itinerary for booking #123"
4. Clicks "View Itinerary"
5. Sees customized itinerary with changes highlighted
6. Can compare with default itinerary

---

## API Endpoints

### GET `/api/itinerary?booking_id={id}`
Fetch itinerary for a booking (customer or tour guide)

**Response:**
```json
{
  "itinerary_id": 1,
  "booking_id": 123,
  "tour_id": 5,
  "tour_name": "Historical Tour",
  "description": "Customized itinerary text...",
  "is_customized": true,
  "default_itinerary": "Original tour itinerary...",
  "updated_at": "2024-12-08T10:30:00Z"
}
```

### POST `/api/itinerary`
Create or update custom itinerary (customer only)

**Request:**
```json
{
  "booking_id": 123,
  "description": "My customized itinerary..."
}
```

### GET `/api/itinerary/notifications`
Get tour guide notifications

**Response:**
```json
{
  "notifications": [...],
  "unread_count": 3
}
```

### POST `/api/itinerary/notifications`
Mark notification as read

**Request:**
```json
{
  "notification_id": 5
}
```

---

## Database Schema

### custom_itineraries
```sql
- itinerary_id (PK)
- customer_id (FK -> users)
- tour_id (FK -> tours)
- booking_id (FK -> bookings)
- description (TEXT)
- is_customized (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### itinerary_notifications
```sql
- notification_id (PK)
- itinerary_id (FK -> custom_itineraries)
- tour_guide_id (FK -> users)
- booking_id (FK -> bookings)
- customer_id (FK -> users)
- message (TEXT)
- is_read (BOOLEAN)
- created_at (TIMESTAMP)
```

---

## Testing

1. **Create a booking** as a customer
2. **Navigate to booking details** and open itinerary
3. **Edit and save** the itinerary
4. **Login as tour guide** assigned to that booking
5. **Check notification bell** - should show unread count
6. **Click notification** to view customized itinerary

---

## Troubleshooting

**Notifications not showing:**
- Check tour guide is assigned to booking (`tourguide_id` in bookings table)
- Verify API endpoint returns data: `/api/itinerary/notifications`

**Cannot save itinerary:**
- Check user is authenticated as customer
- Verify booking belongs to logged-in customer
- Check browser console for errors

**Database errors:**
- Ensure all foreign keys exist (users, tours, bookings)
- Run the SQL setup script completely
- Check MySQL error logs

---

## Next Steps

To fully integrate:

1. Add "View Itinerary" button to customer booking cards
2. Add notification bell to tour guide navbar
3. Create booking details page with itinerary tab
4. Add email notifications (optional)
5. Add push notifications (optional)

---

## Support

For issues or questions, check:
- Browser console for JavaScript errors
- Network tab for API failures
- MySQL logs for database errors
