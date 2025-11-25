"use client"

import { useState, useEffect } from "react"
import { MapPin, Calendar, Users, Star, LogOut, User, Clock, Navigation, Lock } from "lucide-react"

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
  tour_id: number
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  tour_name: string
  destination: string
  start_date: string
  end_date: string
  number_of_people: number
  special_requests: string
  duration_days: number
  itinerary_data: any
  itinerary_type: string
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

  // TASK 2: Handle tour status updates (Start/Finish)
  const handleUpdateTourStatus = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch('/api/tourguide/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ booking_id: bookingId, status: newStatus })
      })

      if (response.ok) {
        const data = await response.json()
        alert(data.message)
        // Refresh tours to show updated status
        await fetchTours()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to update status'}`)
      }
    } catch (error) {
      console.error('Error updating tour status:', error)
      alert('Failed to update tour status. Please try again.')
    }
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
                
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = '/change-password'}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-white"
              >
                <Lock className="w-5 h-5" />
                <span>Change Password</span>
              </button>
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Assigned Tours</h2>
              <div className="bg-green-100 px-4 py-2 rounded-lg">
                <span className="text-green-800 font-semibold">{tours.length} Tours Assigned</span>
              </div>
            </div>
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
                <p className="text-sm mt-2">You will see your assigned tours here once an employee assigns you to a booking.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {tours.map((tour) => (
                  <div
                    key={`tour-${tour.booking_id}`}
                    className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{tour.tour_name || 'Custom Tour'}</h3>
                        {/* TASK 2: Display tour status */}
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tour.status)}`}>
                          {getStatusText(tour.status)}
                        </span>
                      </div>
                      {/* TASK 2: Start/Finish Tour Buttons */}
                      <div className="flex gap-2">
                        {(tour.status.toLowerCase() === 'confirmed' || tour.status.toLowerCase() === 'pending') && (
                          <button
                            onClick={() => handleUpdateTourStatus(tour.booking_id, 'in-progress')}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Start Tour
                          </button>
                        )}
                        {tour.status.toLowerCase() === 'in-progress' && (
                          <button
                            onClick={() => handleUpdateTourStatus(tour.booking_id, 'completed')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Finish Tour
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Customer Information Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Customer Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-800">Name:</span>
                          <span className="text-blue-700">{getFullName(tour.customer_first_name, tour.customer_last_name)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-800">Group Size:</span>
                          <span className="text-blue-700">{tour.number_of_people} </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-800">📱 Phone:</span>
                          <span className="text-blue-700">{tour.customer_phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-800">📧 Email:</span>
                          <span className="text-blue-700">{tour.customer_email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tour Details Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <div>
                          <span className="font-medium">Duration:</span>
                          <br />
                          <span>{formatDate(tour.start_date)} - {formatDate(tour.end_date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <div>
                          <span className="font-medium">Destination:</span>
                          <br />
                          <span>{tour.destination}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-green-600" />
                        <div>
                          <span className="font-medium">Group Size:</span>
                          <br />
                          <span>{tour.number_of_people} {tour.number_of_people === 1 ? 'person' : 'people'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle and Driver Information */}
                    {(tour.vehicle_make || tour.driver_first_name) && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <span className="mr-2">🚗</span>
                          Transportation Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {tour.vehicle_make && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-800">Vehicle:</span>
                              <span className="text-gray-700">{tour.vehicle_make} {tour.vehicle_model}</span>
                            </div>
                          )}
                          {tour.driver_first_name && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-800">Driver:</span>
                              <span className="text-gray-700">{getFullName(tour.driver_first_name, tour.driver_last_name)}</span>
                            </div>
                          )}
                          {tour.driver_phone && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-800">Driver Phone:</span>
                              <span className="text-gray-700">{tour.driver_phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Special Requests */}
                    {tour.special_requests && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                          <span className="mr-2">⚠️</span>
                          Special Requests
                        </h4>
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tour Itineraries</h2>
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <span className="text-blue-800 font-semibold">{itineraries.length} Tour{itineraries.length !== 1 ? 's' : ''} with Itineraries</span>
              </div>
            </div>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading itineraries...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                <p>{error}</p>
              </div>
            ) : itineraries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
               
                <p>No tour itineraries available yet.</p>
                <p className="text-sm mt-2">Itineraries will appear here for tours you are assigned to.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {itineraries.map((itinerary) => (
                  <div
                    key={`itinerary-${itinerary.booking_id}`}
                    className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{itinerary.tour_name  || 'Custom Tour'}</h3>
                        <p className="text-gray-600 text-sm">Tour ID: #{itinerary.tour_id} | Booking ID: #{itinerary.booking_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatDate(itinerary.start_date)} - {formatDate(itinerary.end_date)}</p>
                        <p className="text-sm text-gray-600">{itinerary.duration_days} days tour</p>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Customer Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-blue-800">Name:</span>
                          <br />
                          <span className="text-blue-700">{getFullName(itinerary.customer_first_name, itinerary.customer_last_name)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-blue-800">Group Size:</span>
                          <br />
                          <span className="text-blue-700">{itinerary.number_of_people} people</span>
                        </div>
                        <div>
                          <span className="font-medium text-blue-800">Phone:</span>
                          <br />
                          <span className="text-blue-700">{itinerary.customer_phone}</span>
                        </div>
                      </div>
                    </div>

                    {/* Destination Information */}
                    {itinerary.destination && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          Destination: {itinerary.destination}
                        </h4>
                      </div>
                    )}

                    {/* Detailed Itinerary */}
                    {itinerary.itinerary_data?.days && itinerary.itinerary_data.days.length > 0 && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Day-by-Day Itinerary
                        </h4>
                        <div className="space-y-4">
                          {itinerary.itinerary_data.days.map((day: any, idx: number) => (
                            <div key={`day-${itinerary.booking_id}-${idx}`} className="bg-white border border-gray-300 rounded-lg p-4">
                              <div className="flex items-start space-x-3">
                                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                  {day.day}
                                </div>
                                <div className="flex-1">
                                  <h5 className="font-semibold text-gray-900 mb-2">Day {day.day}: {day.title}</h5>
                                  <p className="text-gray-700 text-sm leading-relaxed mb-2">{day.description}</p>
                                  {day.location && (
                                    <div className="flex items-center text-xs text-gray-600">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      <span>{day.location}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Special Requests */}
                    {itinerary.special_requests && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                          <span className="mr-2">⚠️</span>
                          Special Requests
                        </h4>
                        <p className="text-sm text-yellow-700">{itinerary.special_requests}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                  key={`review-${review.rating_id}`}
                  className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{`${review.customer_first_name} ${review.customer_last_name}`.trim()}</h3>
                      <p className="text-sm text-gray-600">{review.tour_name}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {[...Array(5)].map((_, starIdx) => (
                          <Star
                            key={`review-${review.rating_id}-star-${starIdx}`}
                            className={`w-4 h-4 ${
                              starIdx < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{new Date(review.created_at).toLocaleDateString()}</p>
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
