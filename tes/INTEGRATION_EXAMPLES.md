# Integration Examples

## 1. Add to Customer Dashboard

### Option A: Add to Booking Card

```tsx
// In your customer dashboard where bookings are displayed
import { useState } from 'react'
import ItineraryCustomization from '@/components/ItineraryCustomization'

export default function CustomerBookings() {
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null)
  const [showItinerary, setShowItinerary] = useState(false)

  return (
    <div>
      {/* Existing booking cards */}
      {bookings.map(booking => (
        <div key={booking.id} className="booking-card">
          {/* ... existing booking info ... */}
          
          <button
            onClick={() => {
              setSelectedBooking(booking.id)
              setShowItinerary(true)
            }}
            className="btn-primary"
          >
            View & Customize Itinerary
          </button>
        </div>
      ))}

      {/* Itinerary Modal */}
      {showItinerary && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ItineraryCustomization
              bookingId={selectedBooking}
              onClose={() => setShowItinerary(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
```

### Option B: Add as Separate Tab

```tsx
// In booking details page with tabs
import ItineraryCustomization from '@/components/ItineraryCustomization'

export default function BookingDetails({ bookingId }: { bookingId: number }) {
  const [activeTab, setActiveTab] = useState('details')

  return (
    <div>
      {/* Tabs */}
      <div className="tabs">
        <button onClick={() => setActiveTab('details')}>Details</button>
        <button onClick={() => setActiveTab('itinerary')}>Itinerary</button>
        <button onClick={() => setActiveTab('tracking')}>Tracking</button>
      </div>

      {/* Tab Content */}
      {activeTab === 'itinerary' && (
        <ItineraryCustomization bookingId={bookingId} />
      )}
    </div>
  )
}
```

---

## 2. Add to Tour Guide Dashboard

### Add Notification Bell to Navbar

```tsx
// In your tour guide layout or navbar component
import ItineraryNotifications from '@/components/ItineraryNotifications'
import TourGuideItineraryView from '@/components/TourGuideItineraryView'
import { useState } from 'react'

export default function TourGuideNavbar() {
  const [viewingBookingId, setViewingBookingId] = useState<number | null>(null)

  return (
    <nav className="navbar">
      {/* ... existing nav items ... */}
      
      {/* Notification Bell */}
      <ItineraryNotifications
        onViewItinerary={(bookingId) => setViewingBookingId(bookingId)}
      />

      {/* Itinerary Viewer Modal */}
      {viewingBookingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TourGuideItineraryView
              bookingId={viewingBookingId}
              onClose={() => setViewingBookingId(null)}
            />
          </div>
        </div>
      )}
    </nav>
  )
}
```

### Add to Tour Guide Booking List

```tsx
// In tour guide's assigned bookings page
import TourGuideItineraryView from '@/components/TourGuideItineraryView'
import { Eye } from 'lucide-react'

export default function TourGuideBookings() {
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null)

  return (
    <div>
      {/* Booking List */}
      {bookings.map(booking => (
        <div key={booking.id} className="booking-card">
          {/* ... booking info ... */}
          
          {booking.has_custom_itinerary && (
            <span className="badge-custom">
              Customized Itinerary
            </span>
          )}
          
          <button
            onClick={() => setSelectedBooking(booking.id)}
            className="btn-secondary"
          >
            <Eye className="w-4 h-4" />
            View Itinerary
          </button>
        </div>
      ))}

      {/* Modal */}
      {selectedBooking && (
        <div className="modal-overlay">
          <TourGuideItineraryView
            bookingId={selectedBooking}
            onClose={() => setSelectedBooking(null)}
          />
        </div>
      )}
    </div>
  )
}
```

---

## 3. Complete Dashboard Example

### Customer Dashboard Page

```tsx
"use client"

import { useState, useEffect } from 'react'
import ItineraryCustomization from '@/components/ItineraryCustomization'
import { Calendar, MapPin, Edit } from 'lucide-react'

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState([])
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [showItinerary, setShowItinerary] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    const res = await fetch('/api/bookings', { credentials: 'include' })
    const data = await res.json()
    setBookings(data)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

      <div className="grid gap-6">
        {bookings.map((booking: any) => (
          <div key={booking.booking_id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{booking.tour_name}</h3>
                <div className="flex items-center gap-4 mt-2 text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(booking.start_date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {booking.people_count} people
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setSelectedBookingId(booking.booking_id)
                  setShowItinerary(true)
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                <Edit className="w-4 h-4" />
                Customize Itinerary
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Itinerary Modal */}
      {showItinerary && selectedBookingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ItineraryCustomization
              bookingId={selectedBookingId}
              onClose={() => {
                setShowItinerary(false)
                setSelectedBookingId(null)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
```

### Tour Guide Dashboard Page

```tsx
"use client"

import { useState, useEffect } from 'react'
import ItineraryNotifications from '@/components/ItineraryNotifications'
import TourGuideItineraryView from '@/components/TourGuideItineraryView'

export default function TourGuideDashboard() {
  const [bookings, setBookings] = useState([])
  const [viewingBookingId, setViewingBookingId] = useState<number | null>(null)

  useEffect(() => {
    fetchMyBookings()
  }, [])

  const fetchMyBookings = async () => {
    const res = await fetch('/api/tourguide/bookings', { credentials: 'include' })
    const data = await res.json()
    setBookings(data)
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header with Notifications */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tours</h1>
        <ItineraryNotifications
          onViewItinerary={(bookingId) => setViewingBookingId(bookingId)}
        />
      </div>

      {/* Bookings List */}
      <div className="grid gap-6">
        {bookings.map((booking: any) => (
          <div key={booking.booking_id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{booking.tour_name}</h3>
                <p className="text-gray-600 mt-1">
                  Customer: {booking.customer_name}
                </p>
                {booking.has_custom_itinerary && (
                  <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Customized Itinerary
                  </span>
                )}
              </div>
              
              <button
                onClick={() => setViewingBookingId(booking.booking_id)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                View Itinerary
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Itinerary Viewer Modal */}
      {viewingBookingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <TourGuideItineraryView
              bookingId={viewingBookingId}
              onClose={() => setViewingBookingId(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## 4. Quick Start Checklist

- [ ] Run `setup-itinerary-customization.sql` in MySQL
- [ ] Add `ItineraryCustomization` component to customer booking page
- [ ] Add `ItineraryNotifications` bell to tour guide navbar
- [ ] Add `TourGuideItineraryView` modal to tour guide dashboard
- [ ] Test: Customer edits itinerary
- [ ] Test: Tour guide receives notification
- [ ] Test: Tour guide views customized itinerary

---

## Styling Tips

All components use Tailwind CSS. To customize:

```tsx
// Change button colors
className="bg-emerald-600 hover:bg-emerald-700"  // Change to your brand color

// Adjust modal size
className="max-w-4xl"  // Change to max-w-2xl, max-w-6xl, etc.

// Modify notification badge color
className="bg-red-500"  // Change to bg-blue-500, bg-orange-500, etc.
```
