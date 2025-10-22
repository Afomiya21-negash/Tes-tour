"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Users, CreditCard, Clock, CheckCircle, XCircle, Edit3 } from "lucide-react"
import ItineraryCustomizer from "@/components/ItineraryCustomizer"

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
  tour_guide_first_name?: string
  tour_guide_last_name?: string
  tour_guide_email?: string
  tour_guide_phone?: string
  driver_first_name?: string
  driver_last_name?: string
  driver_email?: string
  driver_phone?: string
  payment_amount?: number
  payment_status?: string
  payment_method?: string
  number_of_people?: number
  special_requests?: string
}

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [user, setUser] = useState<any>(null)
  const [showItineraryCustomizer, setShowItineraryCustomizer] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  useEffect(() => {
    checkAuth()
    fetchBookings()
  }, [])

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
              <button
                onClick={() => window.location.href = '/'}
                className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
              >
                Browse Tours
              </button>
              <button
                onClick={async () => {
                  try {
                    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                  } finally {
                    window.location.href = '/'
                  }
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
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
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${bookings.reduce((sum, b) => sum + (Number(b.payment_amount) || 0), 0).toFixed(2)}
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
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.tour_name || 'Custom Booking'}
                        </h3>
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">{booking.status}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {booking.destination || 'Not specified'}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                        </div>
                        {booking.vehicle_make && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {booking.vehicle_make} {booking.vehicle_model}
                          </div>
                        )}
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-1" />
                          ${Number(booking.total_price).toFixed(2)}
                        </div>
                      </div>
                      
                      {/* Tour Guide and Driver Information */}
                      {(booking.tour_guide_first_name || booking.driver_first_name) && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {booking.tour_guide_first_name && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <h4 className="font-medium text-blue-900 mb-1">Tour Guide</h4>
                              <p className="text-sm text-blue-700">
                                {booking.tour_guide_first_name} {booking.tour_guide_last_name}
                              </p>
                              {booking.tour_guide_phone && (
                                <p className="text-xs text-blue-600 mt-1">
                                  📞 {booking.tour_guide_phone}
                                </p>
                              )}
                            </div>
                          )}
                          
                          {booking.driver_first_name && (
                            <div className="bg-green-50 p-3 rounded-lg">
                              <h4 className="font-medium text-green-900 mb-1">Driver</h4>
                              <p className="text-sm text-green-700">
                                {booking.driver_first_name} {booking.driver_last_name}
                              </p>
                              {booking.driver_phone && (
                                <p className="text-xs text-green-600 mt-1">
                                  📞 {booking.driver_phone}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {booking.payment_status && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-600">Payment: </span>
                          <span className={`font-medium ${booking.payment_status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {booking.payment_status} {booking.payment_method && `via ${booking.payment_method}`}
                          </span>
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

                      {booking.tour_id && booking.status === 'confirmed' && (
                        <button
                          onClick={() => openItineraryCustomizer(booking)}
                          className="bg-emerald-600 text-white px-3 py-1 rounded-md hover:bg-emerald-700 transition-colors text-sm flex items-center space-x-1"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Customize Itinerary</span>
                        </button>
                      )}
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
        <ItineraryCustomizer
          bookingId={selectedBooking.booking_id}
          tourId={selectedBooking.tour_id}
          onClose={closeItineraryCustomizer}
        />
      )}
    </div>
  )
}
