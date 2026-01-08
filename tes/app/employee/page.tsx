"use client"

import { useState, useEffect } from "react"
import { Star, UserPlus, BarChart3, Calendar, LogOut, Briefcase, X, Check, Lock, Bell, DollarSign, RefreshCcw, CheckCircle, XCircle } from "lucide-react"

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
  payment_amount?: number | null
  payment_refund_request?: string | null
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

type RefundNotification = {
  notification_id: number
  type: string
  booking_id: number
  customer_id: number
  customer_name: string
  customer_email: string
  message: string
  is_read: boolean
  created_at: string
  tour_name?: string
  payment_amount?: number
  booking_date?: string
}

type ChangeRequest = {
  request_id: number
  booking_id: number
  user_id: number
  request_type: 'tour_guide' | 'driver' | 'both'
  current_tour_guide_id: number | null
  current_driver_id: number | null
  new_tour_guide_id: number | null
  new_driver_id: number | null
  reason: string | null
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  created_at: string
  updated_at: string
  processed_at: string | null
  processed_by: number | null
  tour_name?: string
  start_date?: string
  end_date?: string
  customer_first_name?: string
  customer_last_name?: string
  current_guide_first_name?: string | null
  current_guide_last_name?: string | null
  current_driver_first_name?: string | null
  current_driver_last_name?: string | null
  new_guide_first_name?: string | null
  new_guide_last_name?: string | null
  new_driver_first_name?: string | null
  new_driver_last_name?: string | null
}

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState<"bookings" | "assign" | "ratings" | "notifications" | "change-requests">("bookings")
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([])
  const [tourGuides, setTourGuides] = useState<TourGuide[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [refundNotifications, setRefundNotifications] = useState<RefundNotification[]>([])
  const [unreadRefundCount, setUnreadRefundCount] = useState(0)
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([])
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null)
  const [availableGuides, setAvailableGuides] = useState<TourGuide[]>([])
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([])

  // Removed edit form states (Edit Details feature removed)

  // Check authentication on mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (!loading) {
      const interval = setInterval(() => {
        fetchRefundNotifications()
      }, 30000) // Every 30 seconds
      return () => clearInterval(interval)
    }
  }, [loading])

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

      //  Check if employee has HR access using the isHR flag from API
      // The API uses Employee.isHR() method from domain.ts which checks position and department
      // Debug: Log the user data to help troubleshoot
      console.log('Employee auth check:', { 
        user_id: data.user.user_id, 
        role: data.user.role, 
        isHR: data.user.isHR 
      })
      
      if (data.user.isHR === undefined || data.user.isHR === false) {
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
        fetchRatings(),
        fetchRefundNotifications(),
        fetchChangeRequests()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchRefundNotifications = async () => {
    try {
      const response = await fetch('/api/employee/notifications', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setRefundNotifications(data.notifications || [])
        setUnreadRefundCount(data.unreadCount || 0)
      } else if (response.status === 403) {
        // Not HR, no notifications
        setRefundNotifications([])
        setUnreadRefundCount(0)
      }
    } catch (error) {
      console.error('Error fetching refund notifications:', error)
    }
  }

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      const response = await fetch('/api/employee/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId })
      })
      if (response.ok) {
        setRefundNotifications(prev =>
          prev.map(n =>
            n.notification_id === notificationId ? { ...n, is_read: true } : n
          )
        )
        setUnreadRefundCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
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

  const fetchChangeRequests = async () => {
    try {
      const response = await fetch('/api/change-requests', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setChangeRequests(data)
      } else if (response.status === 403) {
        // Not HR, no access to change requests
        setChangeRequests([])
      }
    } catch (error) {
      console.error('Error fetching change requests:', error)
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

  const handleProcessChangeRequest = async (request: ChangeRequest) => {
    setSelectedRequest(request)
    setShowProcessModal(true)
    
    // Fetch available guides and drivers for the booking dates
    if (request.start_date && request.end_date) {
      try {
        // Fetch available tour guides
        const guidesResponse = await fetch(`/api/employee/tourguides?startDate=${encodeURIComponent(request.start_date)}&endDate=${encodeURIComponent(request.end_date)}`, {
          credentials: 'include'
        })
        if (guidesResponse.ok) {
          const guidesData = await guidesResponse.json()
          setAvailableGuides(guidesData)
        }

        // Fetch available drivers
        const driversResponse = await fetch(
          `/api/drivers?startDate=${request.start_date}&endDate=${request.end_date}`,
          { credentials: 'include' }
        )
        if (driversResponse.ok) {
          const driversData = await driversResponse.json()
          setAvailableDrivers(driversData)
        } else {
          // If drivers endpoint doesn't exist, set empty array
          setAvailableDrivers([])
        }
      } catch (error) {
        console.error('Error fetching available personnel:', error)
        setAvailableGuides([])
        setAvailableDrivers([])
      }
    }
  }

  const handleApproveRequest = async (newGuideId?: number | null, newDriverId?: number | null) => {
    if (!selectedRequest) return

    try {
      const response = await fetch(`/api/change-requests/${selectedRequest.request_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'approved',
          new_tour_guide_id: newGuideId,
          new_driver_id: newDriverId
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to process request' }))
        throw new Error(errorData.error || 'Failed to process request')
      }

      // Show success popup
      setTimeout(() => {
        const popup = document.createElement('div')
        popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        popup.innerHTML = `
          <div class="bg-white rounded-lg w-full max-w-md">
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 class="text-xl font-semibold text-green-800">Request Approved</h3>
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
                  <span class="font-semibold text-green-800">Change Request Processed</span>
                </div>
                <p class="text-sm text-green-700">The change request has been approved and assignments updated.</p>
              </div>
              <button onclick="this.closest('.fixed').remove()" class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                Continue
              </button>
            </div>
          </div>
        `
        document.body.appendChild(popup)
      }, 100)

      // Close modal and refresh data
      setShowProcessModal(false)
      setSelectedRequest(null)
      fetchChangeRequests()
      fetchBookings()
    } catch (error: any) {
      console.error('Error approving request:', error)

      // Show error popup
      setTimeout(() => {
        const popup = document.createElement('div')
        popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        popup.innerHTML = `
          <div class="bg-white rounded-lg w-full max-w-md">
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 class="text-xl font-semibold text-red-800">Processing Failed</h3>
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
                <p class="text-sm text-red-700">${error.message || 'Failed to process request. Please try again.'}</p>
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

  const handleRejectRequest = async () => {
    if (!selectedRequest) return

    try {
      const response = await fetch(`/api/change-requests/${selectedRequest.request_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'rejected' })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to reject request' }))
        throw new Error(errorData.error || 'Failed to reject request')
      }

      // Show success popup
      setTimeout(() => {
        const popup = document.createElement('div')
        popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        popup.innerHTML = `
          <div class="bg-white rounded-lg w-full max-w-md">
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 class="text-xl font-semibold text-orange-800">Request Rejected</h3>
              <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="p-6">
              <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <div class="flex items-center mb-2">
                  <svg class="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  <span class="font-semibold text-orange-800">Change Request Rejected</span>
                </div>
                <p class="text-sm text-orange-700">The change request has been rejected.</p>
              </div>
              <button onclick="this.closest('.fixed').remove()" class="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors">
                Continue
              </button>
            </div>
          </div>
        `
        document.body.appendChild(popup)
      }, 100)

      // Close modal and refresh data
      setShowProcessModal(false)
      setSelectedRequest(null)
      fetchChangeRequests()
    } catch (error: any) {
      console.error('Error rejecting request:', error)

      // Show error popup
      setTimeout(() => {
        const popup = document.createElement('div')
        popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        popup.innerHTML = `
          <div class="bg-white rounded-lg w-full max-w-md">
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 class="text-xl font-semibold text-red-800">Rejection Failed</h3>
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
                <p class="text-sm text-red-700">${error.message || 'Failed to reject request. Please try again.'}</p>
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
              {unreadRefundCount > 0 && (
                <div className="relative">
                  <Bell className="w-6 h-6 text-white" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadRefundCount > 9 ? '9+' : unreadRefundCount}
                  </span>
                </div>
              )}
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
            <button
              onClick={() => setActiveTab("notifications")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === "notifications"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
                {unreadRefundCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadRefundCount > 9 ? '9+' : unreadRefundCount}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab("change-requests")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors relative ${
                activeTab === "change-requests"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <RefreshCcw className="w-5 h-5" />
                <span>Change Requests</span>
                {changeRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {changeRequests.filter(r => r.status === 'pending').length > 9 ? '9+' : changeRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
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
                    id={`booking-${booking.booking_id}`}
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

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Refund Notifications</h2>
              {unreadRefundCount > 0 && (
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/employee/notifications', {
                        method: 'DELETE',
                        credentials: 'include'
                      })
                      if (response.ok) {
                        setRefundNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
                        setUnreadRefundCount(0)
                      }
                    } catch (error) {
                      console.error('Error marking all as read:', error)
                    }
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Mark All as Read
                </button>
              )}
            </div>

            {refundNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No refund notifications.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {refundNotifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className={`bg-white border-2 rounded-lg p-6 hover:shadow-lg transition-shadow ${
                      !notification.is_read ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <DollarSign className={`w-6 h-6 ${!notification.is_read ? 'text-blue-600' : 'text-gray-400'}`} />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Refund Request
                              {!notification.is_read && (
                                <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                  New
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Booking #{notification.booking_id}
                            </p>
                          </div>
                        </div>
                        
                        <div className="ml-9 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Customer: </span>
                              <span className="text-gray-900">{notification.customer_name}</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Email: </span>
                              <span className="text-gray-900">{notification.customer_email}</span>
                            </div>
                            {notification.tour_name && (
                              <div>
                                <span className="font-medium text-gray-700">Tour: </span>
                                <span className="text-gray-900">{notification.tour_name}</span>
                              </div>
                            )}
                            {notification.payment_amount && (
                              <div>
                                <span className="font-medium text-gray-700">Amount: </span>
                                <span className="text-gray-900">ETB {Number(notification.payment_amount).toFixed(2)}</span>
                              </div>
                            )}
                            {notification.booking_date && (
                              <div>
                                <span className="font-medium text-gray-700">Booking Date: </span>
                                <span className="text-gray-900">{formatDate(notification.booking_date)}</span>
                              </div>
                            )}
                            <div>
                              <span className="font-medium text-gray-700">Requested: </span>
                              <span className="text-gray-900">{formatDate(notification.created_at)}</span>
                            </div>
                          </div>
                          
                          {notification.message && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">{notification.message}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        {!notification.is_read && (
                          <button
                            onClick={() => markNotificationAsRead(notification.notification_id)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Mark Read
                          </button>
                        )}
                        <button
                          onClick={() => {
                            // Navigate to bookings tab and highlight this booking
                            setActiveTab('bookings')
                            // Scroll to booking if possible
                            setTimeout(() => {
                              const bookingElement = document.getElementById(`booking-${notification.booking_id}`)
                              if (bookingElement) {
                                bookingElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                bookingElement.classList.add('ring-4', 'ring-blue-500')
                                setTimeout(() => {
                                  bookingElement.classList.remove('ring-4', 'ring-blue-500')
                                }, 3000)
                              }
                            }, 100)
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          View Booking
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Change Requests Tab */}
        {activeTab === "change-requests" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Change Requests</h2>
              <p className="text-gray-600 mt-1">Manage customer requests to change tour guides or drivers</p>
            </div>

            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tour</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {changeRequests.map((request) => (
                    <tr key={request.request_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.customer_first_name} {request.customer_last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{request.tour_name || 'Custom Booking'}</div>
                        <div className="text-xs text-gray-500">
                          {request.start_date && request.end_date 
                            ? `${formatDate(request.start_date)} - ${formatDate(request.end_date)}`
                            : 'Not specified'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {request.request_type === 'both' ? 'Both' : request.request_type === 'tour_guide' ? 'Tour Guide' : 'Driver'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {request.current_guide_first_name && (
                          <div>Guide: {request.current_guide_first_name} {request.current_guide_last_name}</div>
                        )}
                        {request.current_driver_first_name && (
                          <div>Driver: {request.current_driver_first_name} {request.current_driver_last_name}</div>
                        )}
                        {!request.current_guide_first_name && !request.current_driver_first_name && (
                          <div>Not assigned</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.status === 'pending' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        )}
                        {request.status === 'completed' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Completed
                          </span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleProcessChangeRequest(request)}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            Process
                          </button>
                        )}
                        {request.status === 'completed' && request.new_guide_first_name && (
                          <div className="text-xs text-gray-500">
                            <div>New Guide: {request.new_guide_first_name} {request.new_guide_last_name}</div>
                          </div>
                        )}
                        {request.status === 'completed' && request.new_driver_first_name && (
                          <div className="text-xs text-gray-500">
                            <div>New Driver: {request.new_driver_first_name} {request.new_driver_last_name}</div>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {changeRequests.length === 0 && (
                <div className="text-center py-12">
                  <RefreshCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No change requests</p>
                  <p className="text-sm text-gray-400">Customer requests will appear here</p>
                </div>
              )}
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
              {/* Payment Status Check */}
              <div className={`mb-4 p-3 rounded-lg border ${
                selectedBooking.payment_status === 'completed' 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {selectedBooking.payment_status === 'completed' ? '✅' : '⚠️'}
                    </span>
                    <div>
                      <p className={`text-sm font-semibold ${
                        selectedBooking.payment_status === 'completed' 
                          ? 'text-emerald-800' 
                          : 'text-amber-800'
                      }`}>
                        {selectedBooking.payment_status === 'completed' 
                          ? 'Payment Completed' 
                          : 'Payment Pending'}
                      </p>
                      <p className="text-xs text-gray-600">
                        {selectedBooking.payment_status === 'completed' 
                          ? `Paid: ETB ${selectedBooking.payment_amount || selectedBooking.total_price}` 
                          : 'Customer has not completed payment yet'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Select a tour guide for <strong>{selectedBooking.tour_name}</strong>
              </p>
              
              {selectedBooking.payment_status !== 'completed' && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Note:</strong> You can assign a tour guide, but ensure payment is completed before the tour starts.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {/* Refund action (visible even if guides are available, for testing) */}
                <div className="space-y-3 text-center py-4">
                  {tourGuides.length === 0 && (
                    <p className="text-sm text-gray-600">
                      No tour guides available for the selected dates.
                    </p>
                  )}
                  {selectedBooking.payment_status === 'completed' && selectedBooking.payment_refund_request == null && (
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/payments/refund-request', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({ bookingId: selectedBooking.booking_id }),
                            })

                            const data = await response.json().catch(() => ({}))

                            if (!response.ok) {
                              throw new Error(data.error || 'Failed to request refund')
                            }

                            // Update local booking state
                            setBookings((prev) =>
                              prev.map((b) =>
                                b.booking_id === selectedBooking.booking_id
                                  ? { ...b, payment_refund_request: 'REFUND_REQUESTED' }
                                  : b
                              )
                            )

                            setSelectedBooking((prev) =>
                              prev
                                ? { ...prev, payment_refund_request: 'REFUND_REQUESTED' }
                                : prev
                            )

                            // Show success popup
                            setTimeout(() => {
                              const popup = document.createElement('div')
                              popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
                              popup.innerHTML = `
                                <div class="bg-white rounded-lg w-full max-w-md">
                                  <div class="flex justify-between items-center p-6 border-b border-gray-200">
                                    <h3 class="text-xl font-semibold text-emerald-800">Refund Requested</h3>
                                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                      </svg>
                                    </button>
                                  </div>
                                  <div class="p-6">
                                    <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-4">
                                      <p class="text-sm text-emerald-800">
                                        Your refund request has been sent to the admin for approval.
                                      </p>
                                    </div>
                                    <button onclick="this.closest('.fixed').remove()" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors">
                                      Close
                                    </button>
                                  </div>
                                </div>
                              `
                              document.body.appendChild(popup)
                            }, 100)
                          } catch (error: any) {
                            console.error('Error requesting refund:', error)
                            setTimeout(() => {
                              const popup = document.createElement('div')
                              popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
                              popup.innerHTML = `
                                <div class="bg-white rounded-lg w-full max-w-md">
                                  <div class="flex justify-between items-center p-6 border-b border-gray-200">
                                    <h3 class="text-xl font-semibold text-red-800">Refund Request Failed</h3>
                                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                      </svg>
                                    </button>
                                  </div>
                                  <div class="p-6">
                                    <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                      <p class="text-sm text-red-800">
                                        ${error.message || 'We could not send the refund request. Please try again.'}
                                      </p>
                                    </div>
                                    <button onclick="this.closest('.fixed').remove()" class="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
                                      Close
                                    </button>
                                  </div>
                                </div>
                              `
                              document.body.appendChild(popup)
                            }, 100)
                          }
                        }}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-sm"
                      >
                        Request Refund
                      </button>
                  )}
                  {selectedBooking.payment_refund_request === 'REFUND_REQUESTED' && (
                    <p className="text-xs text-amber-700">
                      Refund request already sent. Waiting for admin approval.
                    </p>
                  )}
                </div>
                {tourGuides.map((guide) => (
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

      {/* Process Change Request Modal */}
      {showProcessModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Process Change Request</h2>
              <p className="text-sm text-gray-600 mt-1">
                Assign new guide/driver for {selectedRequest.tour_name || 'Custom Booking'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Request Details:</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Customer:</strong> {selectedRequest.customer_first_name} {selectedRequest.customer_last_name}</p>
                  <p><strong>Tour:</strong> {selectedRequest.tour_name || 'Custom Booking'}</p>
                  <p><strong>Dates:</strong> {selectedRequest.start_date && selectedRequest.end_date 
                    ? `${formatDate(selectedRequest.start_date)} - ${formatDate(selectedRequest.end_date)}`
                    : 'Not specified'
                  }</p>
                  <p><strong>Type:</strong> {selectedRequest.request_type === 'both' ? 'Both' : selectedRequest.request_type === 'tour_guide' ? 'Tour Guide' : 'Driver'}</p>
                  {selectedRequest.reason && <p><strong>Reason:</strong> {selectedRequest.reason}</p>}
                </div>
              </div>

              {(selectedRequest.request_type === 'tour_guide' || selectedRequest.request_type === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Tour Guide <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedRequest.new_tour_guide_id || ''}
                    onChange={(e) => setSelectedRequest(prev => prev ? {...prev, new_tour_guide_id: Number(e.target.value) || null} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">-- Select Tour Guide --</option>
                    {availableGuides.map((guide) => (
                      <option key={guide.user_id} value={guide.user_id}>
                        {guide.first_name} {guide.last_name} - ⭐ {guide.average_rating ? Number(guide.average_rating).toFixed(1) : 'N/A'} ({guide.total_tours || 0} tours)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Only guides available for the tour dates are shown
                  </p>
                </div>
              )}

              {(selectedRequest.request_type === 'driver' || selectedRequest.request_type === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Driver <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedRequest.new_driver_id || ''}
                    onChange={(e) => setSelectedRequest(prev => prev ? {...prev, new_driver_id: Number(e.target.value) || null} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">-- Select Driver --</option>
                    {availableDrivers.map((driver: any) => (
                      <option key={driver.user_id} value={driver.user_id}>
                        {driver.first_name} {driver.last_name} - ⭐ {driver.average_rating ? Number(driver.average_rating).toFixed(1) : 'N/A'} ({driver.total_trips || 0} trips)
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Only drivers available for the tour dates are shown
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setShowProcessModal(false)
                  setSelectedRequest(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectRequest()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => {
                  const newGuideId = selectedRequest.request_type === 'tour_guide' || selectedRequest.request_type === 'both' 
                    ? selectedRequest.new_tour_guide_id 
                    : null
                  const newDriverId = selectedRequest.request_type === 'driver' || selectedRequest.request_type === 'both' 
                    ? selectedRequest.new_driver_id 
                    : null

                  // Validate selections
                  if ((selectedRequest.request_type === 'tour_guide' || selectedRequest.request_type === 'both') && !newGuideId) {
                    alert('Please select a new tour guide')
                    return
                  }
                  if ((selectedRequest.request_type === 'driver' || selectedRequest.request_type === 'both') && !newDriverId) {
                    alert('Please select a new driver')
                    return
                  }

                  handleApproveRequest(newGuideId, newDriverId)
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
