"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Users, CreditCard, Clock, CheckCircle, XCircle, Edit3, HelpCircle, LogOut, Navigation, RefreshCcw } from "lucide-react"
import ItineraryCustomization from "@/components/ItineraryCustomization"
import FreeMapTracker from "@/components/FreeMapTracker"
import RatingPopup from "@/components/RatingPopup"

interface Booking {
  booking_id: number
  start_date: string
  end_date: string
  total_price: number
  booking_date: string
  status: string
  tour_id?: number
  tour_name?: string
  destination?: string
  duration_days?: number
  vehicle_make?: string
  vehicle_model?: string
  vehicle_capacity?: number
  tour_guide_id?: number
  tour_guide_first_name?: string
  tour_guide_last_name?: string
  tour_guide_email?: string
  tour_guide_phone?: string
  driver_id?: number
  driver_first_name?: string
  driver_last_name?: string
  driver_email?: string
  driver_phone?: string
  payment_amount?: number
  payment_status?: string
  payment_method?: string
  payment_refund_request?: string | null
  number_of_people?: number
  has_rating?: boolean
}

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [showItineraryCustomizer, setShowItineraryCustomizer] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showGPSTracker, setShowGPSTracker] = useState(false)
  const [selectedBookingForTracking, setSelectedBookingForTracking] = useState<Booking | null>(null)
  const [showRatingPopup, setShowRatingPopup] = useState(false)
  const [bookingToRate, setBookingToRate] = useState<Booking | null>(null)
  const [showChangeRequestModal, setShowChangeRequestModal] = useState(false)
  const [bookingToChange, setBookingToChange] = useState<Booking | null>(null)
  const [changeRequestType, setChangeRequestType] = useState<'tour_guide' | 'driver' | 'both'>('both')
  const [changeRequestReason, setChangeRequestReason] = useState('')

  useEffect(() => {
    checkAuth()
    fetchBookings()
  }, [])

  // Check for completed bookings without ratings and show rating popup
  useEffect(() => {
    if (bookings.length > 0) {
      const completedWithoutRating = bookings.find(
        b => b.status === 'completed' && !b.has_rating
      )
      
      if (completedWithoutRating && !showRatingPopup) {
        setBookingToRate(completedWithoutRating)
        setShowRatingPopup(true)
      }
    }
  }, [bookings])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/profile', { credentials: 'include' })
      const data = await response.json()
      
      if (!data.authenticated || data.user.role !== 'customer') {
        window.location.href = '/login'
        return
      }
      
      setUser(data.user)
    } catch (e) {
      window.location.href = '/login'
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        setError('Failed to fetch bookings')
      }
    } catch (e) {
      setError('An error occurred while fetching bookings')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in-progress':
        return 'bg-orange-100 text-orange-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'in-progress':
        return <MapPin className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const openItineraryCustomizer = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowItineraryCustomizer(true)
  }

  const closeItineraryCustomizer = () => {
    setShowItineraryCustomizer(false)
    setSelectedBooking(null)
  }

  const openGPSTracker = (booking: Booking) => {
    setSelectedBookingForTracking(booking)
    setShowGPSTracker(true)
  }

  const closeGPSTracker = () => {
    setShowGPSTracker(false)
    setSelectedBookingForTracking(null)
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Force redirect anyway
      window.location.href = '/login';
    }
  }

  const openChangeRequestModal = (booking: Booking) => {
    setBookingToChange(booking)
    setShowChangeRequestModal(true)
    setChangeRequestReason('')
    // Default to 'both' but allow user to select
    setChangeRequestType('both')
  }

  const closeChangeRequestModal = () => {
    setShowChangeRequestModal(false)
    setBookingToChange(null)
    setChangeRequestReason('')
    setChangeRequestType('both')
  }

  const submitChangeRequest = async () => {
    if (!bookingToChange) return

    try {
      const response = await fetch('/api/change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          booking_id: bookingToChange.booking_id,
          request_type: changeRequestType,
          reason: changeRequestReason
        })
      })

      if (response.ok) {
        alert('Change request submitted successfully! We will assign a new guide/driver within 24 hours.')
        closeChangeRequestModal()
        fetchBookings() // Refresh bookings
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to submit change request')
      }
    } catch (error) {
      console.error('Error submitting change request:', error)
      alert('An error occurred while submitting your request')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.first_name || user?.username}!</p>
            </div>
            <div className="flex items-center space-x-3">
              <a
                href="/support"
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <HelpCircle className="h-5 w-5" />
                <span className="font-medium">Help & Support</span>
              </a>
           
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </p>
              </div>
            </div>
          </div>
          
          
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Bookings</h2>
          </div>
          
          {bookings.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-600 mb-4">Start exploring our amazing tours and make your first booking!</p>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition-colors"
              >
                Browse Tours
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {bookings.map((booking) => (
                <div key={booking.booking_id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2 gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.tour_name || 'Custom Booking'}
                        </h3>
                        {/* TASK 1: Show booking status badge */}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">{booking.status.replace('-', ' ')}</span>
                        </span>
                      </div>
                      
                      {/* Basic Tour Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                          <div>
                            <span className="font-medium">Destination:</span>
                            <br />
                            <span>{booking.destination || 'Not specified'}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                          <div>
                            <span className="font-medium">Duration:</span>
                            <br />
                            <span>{formatDate(booking.start_date)} - {formatDate(booking.end_date)}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2 text-emerald-600" />
                          <div>
                            <span className="font-medium">Total Cost:</span>
                            <br />
                            <span>{Number(booking.total_price).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Group Size and Special Requests */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-2 text-emerald-600" />
                          <div>
                            <span className="font-medium">Group Size:</span>
                            <span className="ml-2">{booking.number_of_people}</span>
                          </div>
                        </div>
                     
                      </div>

                      {/* Vehicle Information */}
                      {booking.vehicle_make && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="mr-2">🚗</span>
                            Vehicle Details
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-800">Vehicle:</span>
                              <br />
                              <span className="text-gray-700">{booking.vehicle_make} {booking.vehicle_model}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800">Capacity:</span>
                              <br />
                              <span className="text-gray-700">{booking.vehicle_capacity} passengers</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-800">Status:</span>
                              <br />
                              <span className="text-green-600">Assigned</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Tour Guide and Driver Information */}
                      {(booking.tour_guide_first_name || booking.driver_first_name) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {booking.tour_guide_first_name && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                                <span className="mr-2">👨‍🏫</span>
                                Your Tour Guide
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium text-blue-800">Name:</span>
                                  <span className="ml-2 text-blue-700">
                                    {booking.tour_guide_first_name} {booking.tour_guide_last_name}
                                  </span>
                                </div>
                                {booking.tour_guide_phone && (
                                  <div>
                                    <span className="font-medium text-blue-800">📞 Phone:</span>
                                    <span className="ml-2 text-blue-700">{booking.tour_guide_phone}</span>
                                  </div>
                                )}
                                {booking.tour_guide_email && (
                                  <div>
                                    <span className="font-medium text-blue-800">📧 Email:</span>
                                    <span className="ml-2 text-blue-700">{booking.tour_guide_email}</span>
                                  </div>
                                )}
                                <div className="mt-2">
                                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    Assigned by Employee
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {booking.driver_first_name && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                                <span className="mr-2">👨‍✈️</span>
                                Your Driver
                              </h4>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium text-green-800">Name:</span>
                                  <span className="ml-2 text-green-700">
                                    {booking.driver_first_name} {booking.driver_last_name}
                                  </span>
                                </div>
                                {booking.driver_phone && (
                                  <div>
                                    <span className="font-medium text-green-800">📞 Phone:</span>
                                    <span className="ml-2 text-green-700">{booking.driver_phone}</span>
                                  </div>
                                )}
                                {booking.driver_email && (
                                  <div>
                                    <span className="font-medium text-green-800">📧 Email:</span>
                                    <span className="ml-2 text-green-700">{booking.driver_email}</span>
                                  </div>
                                )}
                                <div className="mt-2">
                                  <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                    Vehicle Assigned
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Assignment Status */}
                      {!booking.tour_guide_first_name && !booking.driver_first_name && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center">
                            <span className="text-yellow-600 mr-2">⏳</span>
                            <div>
                              <span className="font-medium text-yellow-800">Assignment Pending</span>
                              <br />
                              <span className="text-sm text-yellow-700">
                                Our team will assign a tour guide and driver to your booking soon.
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {booking.payment_status && (
                        <div className="mt-2 text-sm space-y-1">
                          <div>
                            <span className="text-gray-600">Payment: </span>
                            <span className={`font-medium ${
                              booking.payment_status === 'completed'
                                ? 'text-green-600'
                                : booking.payment_status === 'refunded'
                                ? 'text-red-600'
                                : 'text-yellow-600'
                            }`}>
                              {booking.payment_status} {booking.payment_method && `via ${booking.payment_method}`}
                            </span>
                          </div>
                          {booking.payment_status === 'refunded' && (
                            <div className="mt-1 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                              <p className="font-semibold mb-1">We’re sorry for the inconvenience.</p>
                              <p>
                                We could not find available tour guides for your selected dates.
                                We have returned the money back to you. Thank you for choosing Tes Tour.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Booked on</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(booking.booking_date)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {booking.tour_id && (booking.status === 'confirmed' || booking.status === 'in-progress') && (
                          <button
                            onClick={() => openItineraryCustomizer(booking)}
                            className="bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700 transition-colors text-sm flex items-center space-x-1 w-full justify-center"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Customize Itinerary</span>
                          </button>
                        )}
                        {(booking.status === 'confirmed' || booking.status === 'in-progress') && (
                          <button
                            onClick={() => openGPSTracker(booking)}
                            className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 transition-colors text-sm flex items-center space-x-1 w-full justify-center"
                          >
                            <Navigation className="h-3 w-3" />
                            <span>Track Location</span>
                          </button>
                        )}
                        {booking.status === 'in-progress' && (
                          <button
                            onClick={() => openChangeRequestModal(booking)}
                            className="bg-orange-600 text-white px-3 py-1 rounded-md hover:bg-orange-700 transition-colors text-sm flex items-center space-x-1 w-full justify-center"
                          >
                            <RefreshCcw className="h-3 w-3" />
                            <span>Change Guide/Driver</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Itinerary Customizer Modal */}
      {showItineraryCustomizer && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ItineraryCustomization
              bookingId={selectedBooking.booking_id}
              onClose={closeItineraryCustomizer}
            />
          </div>
        </div>
      )}

      {/* GPS Tracker Modal */}
      {showGPSTracker && selectedBookingForTracking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">GPS Location Tracking</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedBookingForTracking.tour_name || 'Custom Booking'} - Booking #{selectedBookingForTracking.booking_id}
                </p>
              </div>
              <button
                onClick={closeGPSTracker}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-8 w-8" />
              </button>
            </div>
            <div className="p-6">
              <FreeMapTracker 
                bookingId={selectedBookingForTracking.booking_id}
                userRole="customer"
                isJourneyActive={selectedBookingForTracking.status === 'in-progress'}
              />
            </div>
          </div>
        </div>
      )}

      {/* Rating Popup */}
      {showRatingPopup && bookingToRate && (
        <RatingPopup
          bookingId={bookingToRate.booking_id}
          tourGuideName={bookingToRate.tour_guide_first_name && bookingToRate.tour_guide_last_name 
            ? `${bookingToRate.tour_guide_first_name} ${bookingToRate.tour_guide_last_name}`
            : undefined}
          driverName={bookingToRate.driver_first_name && bookingToRate.driver_last_name
            ? `${bookingToRate.driver_first_name} ${bookingToRate.driver_last_name}`
            : undefined}
          hasTourGuide={!!bookingToRate.tour_guide_id}
          hasDriver={!!bookingToRate.driver_id}
          onClose={() => {
            setShowRatingPopup(false)
            setBookingToRate(null)
          }}
          onSubmitSuccess={() => {
            setShowRatingPopup(false)
            setBookingToRate(null)
            // Refresh bookings to update has_rating status
            fetchBookings()
          }}
        />
      )}

      {/* Change Request Modal */}
      {showChangeRequestModal && bookingToChange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Request Change</h2>
              <p className="text-sm text-gray-600 mt-1">
                Request a new tour guide or driver for your tour
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  ⏱️ We will assign a new guide/driver within <strong>24 hours</strong> of your request.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Current Assignment:</h3>
                <div className="space-y-1 text-sm text-gray-700">
                  {bookingToChange.tour_guide_first_name && (
                    <p>
                      <strong>Tour Guide:</strong> {bookingToChange.tour_guide_first_name} {bookingToChange.tour_guide_last_name}
                    </p>
                  )}
                  {bookingToChange.driver_first_name && (
                    <p>
                      <strong>Driver:</strong> {bookingToChange.driver_first_name} {bookingToChange.driver_last_name}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like to change?
                </label>
                <div className="space-y-2">
                  {bookingToChange.tour_guide_id && bookingToChange.driver_id && (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="changeType"
                        value="both"
                        checked={changeRequestType === 'both'}
                        onChange={(e) => setChangeRequestType(e.target.value as any)}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Both Tour Guide & Driver</span>
                    </label>
                  )}
                  {bookingToChange.tour_guide_id && (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="changeType"
                        value="tour_guide"
                        checked={changeRequestType === 'tour_guide'}
                        onChange={(e) => setChangeRequestType(e.target.value as any)}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Tour Guide Only</span>
                    </label>
                  )}
                  {bookingToChange.driver_id && (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="changeType"
                        value="driver"
                        checked={changeRequestType === 'driver'}
                        onChange={(e) => setChangeRequestType(e.target.value as any)}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">Driver Only</span>
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for change (optional)
                </label>
                <textarea
                  value={changeRequestReason}
                  onChange={(e) => setChangeRequestReason(e.target.value)}
                  placeholder="Tell us why you'd like to make this change..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeChangeRequestModal}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitChangeRequest}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
