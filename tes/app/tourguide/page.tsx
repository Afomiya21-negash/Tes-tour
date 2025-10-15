"use client"

import { useState, useEffect } from "react"
import { MapPin, Calendar, Users, Star, LogOut, User, Clock, Navigation } from "lucide-react"

type Tour = {
  booking_id: number
  tour_name: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  start_date: string
  end_date: string
  destination: string
  status: string
  number_of_people: number
  special_requests: string
  vehicle_make: string
  vehicle_model: string
  driver_first_name: string
  driver_last_name: string
  driver_phone: string
}

type CustomerItinerary = {
  custom_itinerary_id: number
  booking_id: number
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  tour_name: string
  destination: string
  start_date: string
  end_date: string
  number_of_people: number
  special_requests: string
  itinerary_data: any
  created_at: string
  updated_at: string
}

type Review = {
  rating_id: number
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  tour_name: string
  destination: string
  rating: number
  comment: string
  created_at: string
  start_date: string
  end_date: string
}

export default function TourGuideDashboard() {
  const [activeTab, setActiveTab] = useState<"tours" | "itineraries" | "location" | "reviews">("tours")
  const [currentLocation, setCurrentLocation] = useState({
    lat: "9.0320",
    lng: "38.7469",
    address: "Addis Ababa, Ethiopia",
    lastUpdated: new Date().toLocaleTimeString(),
  })

  // State for real data
  const [tours, setTours] = useState<Tour[]>([])
  const [itineraries, setItineraries] = useState<CustomerItinerary[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    setError('')
    try {
      await Promise.all([
        fetchTours(),
        fetchItineraries(),
        fetchReviews()
      ])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchTours = async () => {
    try {
      const response = await fetch('/api/tourguide/tours', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setTours(data)
      }
    } catch (err) {
      console.error('Error fetching tours:', err)
    }
  }

  const fetchItineraries = async () => {
    try {
      const response = await fetch('/api/tourguide/itineraries', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setItineraries(data)
      }
    } catch (err) {
      console.error('Error fetching itineraries:', err)
    }
  }

  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/tourguide/reviews', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setReviews(data)
      }
    } catch (err) {
      console.error('Error fetching reviews:', err)
    }
  }

  // Helper functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getFullName = (firstName: string | null, lastName: string | null) => {
    if (!firstName && !lastName) return 'Unknown'
    return `${firstName || ''} ${lastName || ''}`.trim()
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'upcoming':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')
  }



  const handleUpdateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude.toFixed(4),
            lng: position.coords.longitude.toFixed(4),
            address: "Location updated (using browser geolocation)",
            lastUpdated: new Date().toLocaleTimeString(),
          })
          alert("Location updated successfully!")
        },
        (error) => {
          alert("Unable to get location. Using default location.")
          setCurrentLocation({
            ...currentLocation,
            lastUpdated: new Date().toLocaleTimeString(),
          })
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }



  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Tour Guide Dashboard</h1>
                <p className="text-green-100 text-sm">Welcome back, Nina</p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                } finally {
                  window.location.href = '/'
                }
              }}
              className="flex items-center space-x-2 bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

     
    

      {/* Navigation */}
      <nav className="bg-white border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("tours")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "tours"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>My Tours</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("itineraries")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "itineraries"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Customer Itineraries</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("location")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "location"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Navigation className="w-5 h-5" />
                <span>Update Location</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "reviews"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>My Reviews</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tours Tab */}
        {activeTab === "tours" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Tours</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading tours...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>{error}</p>
              </div>
            ) : tours.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No tours assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tours.map((tour) => (
                  <div
                    key={`tour-${tour.booking_id}`}
                    className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{tour.tour_name || 'Custom Tour'}</h3>
                        <p className="text-gray-600">Customer: {getFullName(tour.customer_first_name, tour.customer_last_name)}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(tour.status)}`}>
                        {getStatusText(tour.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span>{formatDate(tour.start_date)} - {formatDate(tour.end_date)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>{tour.destination}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span>{tour.number_of_people} people</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📱</span>
                        <span>{tour.customer_phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📧</span>
                        <span>{tour.customer_email}</span>
                      </div>
                      {tour.vehicle_make && (
                        <div className="flex items-center space-x-2">
                          <span>🚗</span>
                          <span>{tour.vehicle_make} {tour.vehicle_model}</span>
                        </div>
                      )}
                      {tour.driver_first_name && (
                        <div className="flex items-center space-x-2">
                          <span>👨‍✈️</span>
                          <span>Driver: {getFullName(tour.driver_first_name, tour.driver_last_name)} ({tour.driver_phone})</span>
                        </div>
                      )}
                    </div>
                    {tour.special_requests && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm font-medium text-yellow-800 mb-1">Special Requests:</p>
                        <p className="text-sm text-yellow-700">{tour.special_requests}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Itineraries Tab */}
        {activeTab === "itineraries" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Itineraries</h2>
            <div className="space-y-4">
              {itineraries.map((itinerary) => (
                <div
                  key={`itinerary-${itinerary.id}`}
                  className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{itinerary.tourName}</h3>
                      <p className="text-gray-600">Customer: {itinerary.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Date: {itinerary.date}</p>
                      <p className="text-sm text-gray-600">Group Size: {itinerary.numberOfPeople} people</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Destinations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {itinerary.destinations.map((dest, idx) => (
                          <li key={`dest-${itinerary.id}-${idx}`}>{dest}</li>
                        ))}
                      </ul>
                    </div>
                    {itinerary.specialRequests && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Special Requests:</h4>
                        <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          {itinerary.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Tab */}
      
        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Reviews</h2>
              <div className="bg-green-100 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-600">average rating</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={`review-${review.id}`}
                  className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.customerName}</h3>
                      <p className="text-sm text-gray-600">{review.tourName}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {[...Array(5)].map((_, starIdx) => (
                          <Star
                            key={`review-${review.id}-star-${starIdx}`}
                            className={`w-4 h-4 ${
                              starIdx < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{review.date}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
