"use client"

import { useState, useEffect } from "react"
import { Star, UserPlus, BarChart3, Calendar, LogOut, Briefcase, X, Check, Lock } from "lucide-react"

type Booking = {
  booking_id: number
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  customer_phone: string
  tour_name: string
  start_date: string
  end_date: string
  total_price: number
  booking_date: string
  status: string
  destination: string
  duration_days: number
  vehicle_make: string
  vehicle_model: string
  vehicle_capacity: number
  number_of_people?: number
  special_requests?: string
  tour_guide_first_name?: string | null
  tour_guide_last_name?: string | null
  driver_first_name?: string | null
  driver_last_name?: string | null
  payment_status?: string | null
}

type TourGuide = {
  user_id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  average_rating: number
  total_tours: number
  availability: "available" | "busy"
}

type Rating = {
  rating_id: number
  employee_name: string
  rating_type: "tourguide" | "driver"
  customer_name: string
  rating: number
  comment: string
  created_at: string
  tour_name: string
}

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState<"bookings" | "assign" | "ratings">("bookings")
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tourGuides, setTourGuides] = useState<TourGuide[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])

  // Removed edit form states (Edit Details feature removed)

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' })
      const data = await response.json()

      if (!data.authenticated) {
        // Show warning popup before redirecting to login
        setTimeout(() => {
          const popup = document.createElement('div')
          popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
          popup.innerHTML = `
            <div class="bg-white rounded-lg w-full max-w-md">
              <div class="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 class="text-xl font-semibold text-red-800">Access Denied</h3>
                <button onclick="this.closest('.fixed').remove(); window.location.href='/login'" class="text-gray-400 hover:text-gray-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div class="p-6">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div class="flex items-center mb-2">
                    <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                    <span class="font-semibold text-red-800">Authentication Required</span>
                  </div>
                  <p class="text-sm text-red-700">You must be logged in to access the employee dashboard.</p>
                </div>
                <button onclick="this.closest('.fixed').remove(); window.location.href='/login'" class="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Go to Login
                </button>
              </div>
            </div>
          `
          document.body.appendChild(popup)
        }, 100)
        return
      }

      if (data.user.role !== 'employee') {
        // Show warning popup before redirecting to appropriate page
        setTimeout(() => {
          const popup = document.createElement('div')
          popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
          popup.innerHTML = `
            <div class="bg-white rounded-lg w-full max-w-md">
              <div class="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 class="text-xl font-semibold text-orange-800">Access Restricted</h3>
                <button onclick="this.closest('.fixed').remove(); window.location.href='${data.user.role === 'customer' ? '/dashboard' : '/' + data.user.role}'" class="text-gray-400 hover:text-gray-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div class="p-6">
                <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div class="flex items-center mb-2">
                    <svg class="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    <span class="font-semibold text-orange-800">Employee Access Required</span>
                  </div>
                  <p class="text-sm text-orange-700">You are logged in as ${data.user.role}. Employee privileges are required to access this page.</p>
                </div>
                <button onclick="this.closest('.fixed').remove(); window.location.href='${data.user.role === 'customer' ? '/dashboard' : '/' + data.user.role}'" class="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Go to ${data.user.role === 'customer' ? 'Dashboard' : (data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1) + ' Dashboard')}
                </button>
              </div>
            </div>
          `
          document.body.appendChild(popup)
        }, 100)
        return
      }

      // TASK 1 FIX: Check if employee has HR access using the isHR flag from API
      // The API uses Employee.isHR() method from domain.ts which checks position and department
      if (!data.user.isHR) {
        // Show access denied popup for non-HR employees (e.g., Accountant)
        setTimeout(() => {
          const popup = document.createElement('div')
          popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
          popup.innerHTML = `
            <div class="bg-white rounded-lg w-full max-w-md">
              <div class="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 class="text-xl font-semibold text-red-800">Access Denied</h3>
                <button onclick="this.closest('.fixed').remove(); window.location.href='/'" class="text-gray-400 hover:text-gray-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div class="p-6">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div class="flex items-center mb-2">
                    <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    <span class="font-semibold text-red-800">HR Access Required</span>
                  </div>
                  <p class="text-sm text-red-700">This page is only accessible to Human Resource department employees.</p>
                  <p class="text-sm text-red-700 mt-2">Accountants and other employees do not have permission to access employee management.</p>
                </div>
                <button onclick="this.closest('.fixed').remove(); window.location.href='/'" class="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Go to Homepage
                </button>
              </div>
            </div>
          `
          document.body.appendChild(popup)
        }, 100)
        return
      }

      setLoading(false)
      fetchAllData()
    } catch (e) {
     
      setTimeout(() => {
        const popup = document.createElement('div')
        popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        popup.innerHTML = `
          <div class="bg-white rounded-lg w-full max-w-md">
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 class="text-xl font-semibold text-red-800">Connection Error</h3>
              <button onclick="this.closest('.fixed').remove(); window.location.href='/login'" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="p-6">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div class="flex items-center mb-2">
                  <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="font-semibold text-red-800">Connection Failed</span>
                </div>
                <p class="text-sm text-red-700">Unable to verify authentication. Please try logging in again.</p>
              </div>
              <button onclick="this.closest('.fixed').remove(); window.location.href='/login'" class="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                Go to Login
              </button>
            </div>
          </div>
        `
        document.body.appendChild(popup)
      }, 100)
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchBookings(),
        fetchTourGuides(),
        fetchRatings()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/employee/bookings', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  // ISSUE 2 FIX: Accept date parameters to filter available tour guides
  const fetchTourGuides = async (startDate?: string, endDate?: string) => {
    try {
      let url = '/api/employee/tourguides'
      // Add date parameters if provided to filter only available tour guides
      if (startDate && endDate) {
        url += `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
      }
      
      const response = await fetch(url, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setTourGuides(data)
      } else if (response.status === 403) {
        setError('Access denied: HR role required to view this dashboard')
        setTimeout(() => { window.location.href = '/' }, 2500)
        return
      }
    } catch (error) {
      console.error('Error fetching tour guides:', error)
    }
  }

  const fetchRatings = async () => {
    try {
      const response = await fetch('/api/employee/ratings', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setRatings(data)
      } else if (response.status === 403) {
        setError('Access denied: HR role required to view this dashboard')
        setTimeout(() => { window.location.href = '/' }, 2500)
        return
      }
    } catch (error) {
      console.error('Error fetching ratings:', error)
    }
  }

  // Removed edit handlers (Edit Details feature removed)

  const handleAssignTourGuide = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowAssignModal(true)
    // ISSUE 2 FIX: Fetch tour guides filtered by booking dates to show only available ones
    fetchTourGuides(booking.start_date, booking.end_date)
  }

  const handleConfirmAssignment = async (tourGuideId: number, tourGuideName: string) => {
    if (!selectedBooking) return

    try {
      // Make API call to assign the tour guide
      const response = await fetch('/api/employee/assign-tourguide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bookingId: selectedBooking.booking_id,
          tourGuideId: tourGuideId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to assign tour guide' }))
        throw new Error(errorData.error || 'Failed to assign tour guide')
      }

      // Update local state to reflect the assignment
      const updatedBookings = bookings.map((booking) =>
        booking.booking_id === selectedBooking.booking_id
          ? {
              ...booking,
              tour_guide_first_name: tourGuideName.split(' ')[0],
              tour_guide_last_name: tourGuideName.split(' ')[1] || '',
              status: "confirmed" as const,
            }
          : booking,
      )

      setBookings(updatedBookings)
      setShowAssignModal(false)
      setSelectedBooking(null)

      // Show success popup
      setTimeout(() => {
        const popup = document.createElement('div')
        popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        popup.innerHTML = `
          <div class="bg-white rounded-lg w-full max-w-md">
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 class="text-xl font-semibold text-green-800">Assignment Successful</h3>
              <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="p-6">
              <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div class="flex items-center mb-2">
                  <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="font-semibold text-green-800">Tour Guide Assigned</span>
                </div>
                <p class="text-sm text-green-700">${tourGuideName} has been successfully assigned to the booking.</p>
              </div>
              <button onclick="this.closest('.fixed').remove()" class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                Continue
              </button>
            </div>
          </div>
        `
        document.body.appendChild(popup)
      }, 100)

      // Refresh data to show updated assignments
      fetchBookings()
    } catch (error: any) {
      console.error('Error assigning tour guide:', error)

      // Show error popup
      setTimeout(() => {
        const popup = document.createElement('div')
        popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        popup.innerHTML = `
          <div class="bg-white rounded-lg w-full max-w-md">
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 class="text-xl font-semibold text-red-800">Assignment Failed</h3>
              <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="p-6">
              <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div class="flex items-center mb-2">
                  <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="font-semibold text-red-800">Error</span>
                </div>
                <p class="text-sm text-red-700">${error.message || 'Failed to assign tour guide. Please try again.'}</p>
              </div>
              <button onclick="this.closest('.fixed').remove()" class="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                Try Again
              </button>
            </div>
          </div>
        `
        document.body.appendChild(popup)
      }, 100)
    }
  }

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "confirmed":
        return "Confirmed"
      case "in-progress":
        return "In Progress"
      case "completed":
        return "Completed"
    }
  }

  const tourguideRatings = ratings.filter((r) => r.rating_type === "tourguide")
  const driverRatings = ratings.filter((r) => r.rating_type === "driver")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getFullName = (firstName: string | null, lastName: string | null) => {
    if (!firstName && !lastName) return 'Not assigned'
    return `${firstName || ''} ${lastName || ''}`.trim()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="p-8 bg-red-50 border border-red-200 rounded-lg max-w-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-red-500 mt-2">Redirecting to home page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Briefcase className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Employee Dashboard</h1>
                <p className="text-green-100 text-sm">Manage bookings and assignments</p>
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

      {/* Stats Bar */}
     

      {/* Navigation */}
      <nav className="bg-white border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "bookings"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Manage Bookings</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("assign")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "assign"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Assign Tour Guides</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("ratings")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "ratings"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>View Ratings</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Manage Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Trip Bookings</h2>
            {bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No bookings found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={`booking-${booking.booking_id}`}
                    className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{booking.tour_name || 'Custom Booking'}</h3>
                        <p className="text-gray-600">Customer: {getFullName(booking.customer_first_name, booking.customer_last_name)}</p>
                        <p className="text-sm text-gray-500">{booking.customer_email} • {booking.customer_phone}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <span>
                          {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📍</span>
                        <span>{booking.destination}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>👥</span>
                        <span>{booking.number_of_people} people</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🎯</span>
                          <span>Tour Guide: {getFullName(booking.tour_guide_first_name ?? null, booking.tour_guide_last_name ?? null)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🚗</span>
                        <span>Driver: {getFullName(booking.driver_first_name ?? null, booking.driver_last_name ?? null)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>💰</span>
                        <span>${Number(booking.total_price).toFixed(2)} ({booking.payment_status})</span>
                      </div>
                    </div>
                    {booking.special_requests && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Special Requests:</p>
                        <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                          {booking.special_requests}
                        </p>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      {!booking.tour_guide_first_name && (
                        <button
                          onClick={() => handleAssignTourGuide(booking)}
                          className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Assign Guide</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Assign Tour Guides Tab */}
        {activeTab === "assign" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Assign Tour Guides</h2>

            {/* Available Tour Guides */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-green-600 mb-4">Available Tour Guides</h3>
              {tourGuides.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>No tour guides found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tourGuides.map((guide) => (
                    <div
                      key={`guide-${guide.user_id}`}
                      className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold text-lg">
                            {guide.first_name?.charAt(0) || 'T'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {getFullName(guide.first_name, guide.last_name)}
                          </h4>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              guide.availability === "available"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {guide.availability === "available" ? "Available" : "Busy"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>📧 {guide.email}</p>
                        <p>📱 {guide.phone}</p>
                        <p>🎯 {guide.total_tours} tours completed</p>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-gray-900">
                            {Number(guide.average_rating).toFixed(1)}
                          </span>
                          <span className="text-gray-500">rating</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Assignments */}
            <div>
              <h3 className="text-xl font-semibold text-green-600 mb-4">Bookings Pending Assignment</h3>
              <div className="space-y-4">
                {bookings
                  .filter((b) => !b.tour_guide_first_name)
                  .map((booking) => (
                    <div
                      key={`pending-${booking.booking_id}`}
                      className="bg-white border-2 border-yellow-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{booking.tour_name || 'Custom Booking'}</h4>
                          <p className="text-gray-600">Customer: {getFullName(booking.customer_first_name, booking.customer_last_name)}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            {formatDate(booking.start_date)} - {formatDate(booking.end_date)} • {booking.destination}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAssignTourGuide(booking)}
                          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Assign Guide</span>
                        </button>
                      </div>
                    </div>
                  ))}
                {bookings.filter((b) => !b.tour_guide_first_name).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Check className="w-12 h-12 mx-auto mb-2 text-green-600" />
                    <p>All bookings have been assigned tour guides!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Assignments */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold text-green-600 mb-4">Recent Tour Guide Assignments</h3>
              <div className="space-y-4">
                {bookings
                  .filter((b) => !!b.tour_guide_first_name)
                  .map((booking) => (
                    <div
                      key={`assigned-${booking.booking_id}`}
                      className="bg-white border-2 border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{booking.tour_name || 'Custom Booking'}</h4>
                          <p className="text-gray-600">Customer: {getFullName(booking.customer_first_name, booking.customer_last_name)}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            {formatDate(booking.start_date)} - {formatDate(booking.end_date)} • {booking.destination}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-900">Assigned Tour Guide</p>
                          <p className="text-sm text-blue-700">
                            {getFullName(booking.tour_guide_first_name ?? null, booking.tour_guide_last_name ?? null)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                {bookings.filter((b) => !!b.tour_guide_first_name).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Check className="w-12 h-12 mx-auto mb-2 text-green-600" />
                    <p>No assignments yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === "ratings" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Employee Ratings</h2>

            <div className="space-y-6">
              {/* Tour Guides Ratings */}
              <div>
                <h3 className="text-xl font-semibold text-green-600 mb-4">Tour Guides</h3>
                <div className="bg-white border-2 border-green-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-green-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Tour Guide
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Comment
                        </th>
                       
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-green-100">
                      {tourguideRatings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No tour guide ratings found.
                          </td>
                        </tr>
                      ) : (
                        tourguideRatings.map((rating) => (
                          <tr key={`tg-rating-${rating.rating_id}`} className="hover:bg-green-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {rating.employee_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rating.customer_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, starIdx) => (
                                  <Star
                                    key={`tg-${rating.rating_id}-star-${starIdx}`}
                                    className={`w-4 h-4 ${
                                      starIdx < rating.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-gray-200 text-gray-200"
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 font-semibold">{rating.rating}/5</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{rating.comment}</td>
                   
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Drivers Ratings */}
              <div>
                <h3 className="text-xl font-semibold text-green-600 mb-4">Drivers</h3>
                <div className="bg-white border-2 border-green-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-green-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Driver
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Comment
                        </th>
                       
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-green-100">
                      {driverRatings.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                            No driver ratings found.
                          </td>
                        </tr>
                      ) : (
                        driverRatings.map((rating) => (
                          <tr key={`dr-rating-${rating.rating_id}`} className="hover:bg-green-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {rating.employee_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rating.customer_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center space-x-1">
                                {[...Array(5)].map((_, starIdx) => (
                                  <Star
                                    key={`dr-${rating.rating_id}-star-${starIdx}`}
                                    className={`w-4 h-4 ${
                                      starIdx < rating.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-gray-200 text-gray-200"
                                    }`}
                                  />
                                ))}
                                <span className="ml-2 font-semibold">{rating.rating}/5</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{rating.comment}</td>
                        
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Booking Modal removed */}

      {/* Assign Tour Guide Modal */}
      {showAssignModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Assign Tour Guide</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Select a tour guide for <strong>{selectedBooking.tour_name}</strong>
              </p>
              <div className="space-y-3">
                {tourGuides
                  .filter((guide) => guide.availability === "available")
                  .map((guide) => (
                    <button
                      key={`assign-guide-${guide.user_id}`}
                      onClick={() => handleConfirmAssignment(guide.user_id, getFullName(guide.first_name, guide.last_name))}
                      className="w-full p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{getFullName(guide.first_name, guide.last_name)}</p>
                          <p className="text-sm text-gray-600">{guide.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-900">{Number(guide.average_rating).toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-gray-600">{guide.total_tours} tours</p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAssignModal(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
