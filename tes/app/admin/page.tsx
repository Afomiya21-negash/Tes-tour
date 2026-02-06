"use client"

import { useEffect, useState } from "react"
import { Star, UserPlus, Users, X, LogOut, BarChart3, Shield, Lock, Tag, RefreshCcw, CheckCircle, XCircle, Bell } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import ToastContainer from "@/components/ToastContainer"

type Employee = {
  id: number
  name: string
  email: string
  role: "tourguide" | "driver" | "employee"
  phone: string
  hireDate: string
}

type Customer = {
  id: number
  name: string
  email: string
  phone: string
  signupDate: string
  bookingsCount: number
  idPictures?: string[]
  paidBookings?: number
  pendingPayments?: number
  totalPaid?: number
}

type Rating = {
  id: number
  employeeName: string
  employeeRole: "tourguide" | "driver" | "employee"
  customerName: string
  rating: number
  comment: string
  date: string
}

type ChangeRequest = {
  request_id: number
  booking_id: number
  tour_name: string
  start_date: string
  end_date: string
  booking_status: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
  request_type: 'tour_guide' | 'driver' | 'both'
  current_guide_first_name?: string
  current_guide_last_name?: string
  current_driver_first_name?: string
  current_driver_last_name?: string
  new_guide_first_name?: string
  new_guide_last_name?: string
  new_driver_first_name?: string
  new_driver_last_name?: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  created_at: string
  processed_at?: string
  processed_by_first_name?: string
  processed_by_last_name?: string
}

type RefundRequest = {
  payment_id: number
  booking_id: number
  amount: number
  payment_status: string
  payment_method: string
  refund_request: string
  booking_status: string
  start_date: string
  end_date: string
  customer_first_name: string
  customer_last_name: string
  customer_email: string
}

export default function AdminDashboard() {
  const { toasts, removeToast, success, error: showError, warning, info } = useToast()
  const [activeTab, setActiveTab] = useState<"dashboard" | "ratings" | "customers" | "promotions" | "requests" | "refunds">("dashboard")
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
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
                  <p class="text-sm text-red-700">You must be logged in to access the admin dashboard.</p>
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

      if (data.user.role !== 'admin') {
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
                    <span class="font-semibold text-orange-800">Admin Access Required</span>
                  </div>
                  <p class="text-sm text-orange-700">You are logged in as ${data.user.role}. Admin privileges are required to access this page.</p>
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

      setLoading(false)
      fetchEmployees()
      fetchRatings()
      fetchCustomers()
      fetchChangeRequests()
      fetchTours()
      fetchPromotions()
      fetchRefundRequests()
    } catch (e) {
      // Show error popup before redirecting to login
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

  // Form states
  const [employeeName, setEmployeeName] = useState("")
  const [employeeEmail, setEmployeeEmail] = useState("")
  const [employeeRole, setEmployeeRole] = useState<"tourguide" | "driver" | "employee">("tourguide")
  const [employeePhone, setEmployeePhone] = useState("")
  const [licenseNo, setLicenseNo] = useState("")
  const [experience, setExperience] = useState<number | "">("")
  const [vehicleType, setVehicleType] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [position, setPosition] = useState("")
  const [department, setDepartment] = useState("")
  const [driverImage, setDriverImage] = useState<File | null>(null)
  const [driverImagePreview, setDriverImagePreview] = useState<string>("")

  // Mock data
  const [employees, setEmployees] = useState<Employee[]>([])

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  const [ratings, setRatings] = useState<Rating[]>([])
  const [loadingRatings, setLoadingRatings] = useState(false)

  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([])
  const [loadingChangeRequests, setLoadingChangeRequests] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null)
  const [showProcessRequestModal, setShowProcessRequestModal] = useState(false)
  const [selectedNewGuideId, setSelectedNewGuideId] = useState<string>('')
  const [selectedNewDriverId, setSelectedNewDriverId] = useState<string>('')
  const [availableGuides, setAvailableGuides] = useState<any[]>([])
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([])
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([])
  const [loadingRefundRequests, setLoadingRefundRequests] = useState(false)

  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    title: string
    message: string
    confirmText: string
    cancelText: string
    onConfirm: () => void
    type: 'danger' | 'warning' | 'info'
  } | null>(null)

  // Promotion states
  const [promotions, setPromotions] = useState<any[]>([])
  const [loadingPromotions, setLoadingPromotions] = useState(false)
  const [tours, setTours] = useState<any[]>([])
  const [showPromotionModal, setShowPromotionModal] = useState(false)
  const [promotionTitle, setPromotionTitle] = useState("")
  const [promotionDescription, setPromotionDescription] = useState("")
  const [selectedTourId, setSelectedTourId] = useState("")
  const [discountPercentage, setDiscountPercentage] = useState("")
  const [discountAmount, setDiscountAmount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/admin/employees', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load employees')
      const data = await res.json()
      setEmployees(Array.isArray(data?.employees) ? data.employees : [])
    } catch (e) {
      // keep empty state on failure
    }
  }

  const fetchRefundRequests = async () => {
    setLoadingRefundRequests(true)
    try {
      const res = await fetch('/api/payments/refund-requests', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load refund requests')
      const data = await res.json()
      setRefundRequests(Array.isArray(data?.refundRequests) ? data.refundRequests : [])
    } catch (e) {
      // keep empty state on failure
    } finally {
      setLoadingRefundRequests(false)
    }
  }

  const fetchRatings = async () => {
    setLoadingRatings(true)
    try {
      const res = await fetch('/api/employee/ratings', { credentials: 'include' })
      if (!res.ok) {
        console.log('Ratings API returned error:', res.status)
        setRatings([])
        return
      }
      const data = await res.json()

      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.log('Ratings data is not an array')
        setRatings([])
        return
      }

      // Transform the API data to match the Rating interface
      const transformedRatings: Rating[] = data.map((rating: any, index: number) => ({
        id: index + 1,
        employeeName: rating.employee_name || 'Unknown',
        employeeRole: rating.rating_type as "tourguide" | "driver" | "employee",
        customerName: rating.customer_name || 'Unknown',
        rating: Number(rating.rating) || 0,
        comment: rating.comment || '',
        date: rating.created_at ? new Date(rating.created_at).toISOString().split('T')[0] : 'N/A'
      }))

      setRatings(transformedRatings)
    } catch (e) {
      console.log('Error fetching ratings:', e)
      setRatings([])
    } finally {
      setLoadingRatings(false)
    }
  }

  const fetchCustomers = async () => {
    setLoadingCustomers(true)
    try {
      const res = await fetch('/api/list-all-users', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load customers')
      const data = await res.json()

      // Filter only customers and transform to match Customer interface
      const customerUsers = data.users.filter((user: any) => user.role === 'customer')
      const transformedCustomers: Customer[] = customerUsers.map((user: any, index: number) => ({
        id: user.user_id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        phone: user.phone_number || 'N/A',
        signupDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : 'N/A',
        bookingsCount: user.bookings_count || 0,
        paidBookings: user.paid_bookings || 0,
        pendingPayments: user.pending_payments || 0,
        totalPaid: user.total_paid || 0,
        idPictures: user.id_pictures || undefined
      }))

      setCustomers(transformedCustomers)
    } catch (e) {
      console.error('Failed to fetch customers:', e)
      setCustomers([])
    } finally {
      setLoadingCustomers(false)
    }
  }

  const fetchChangeRequests = async () => {
    setLoadingChangeRequests(true)
    try {
      const res = await fetch('/api/change-requests', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load change requests')
      const data = await res.json()
      setChangeRequests(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to fetch change requests:', e)
      setChangeRequests([])
    } finally {
      setLoadingChangeRequests(false)
    }
  }

  const openProcessRequestModal = async (request: ChangeRequest) => {
    setSelectedRequest(request)
    setSelectedNewGuideId('')
    setSelectedNewDriverId('')
    setShowProcessRequestModal(true)

    // Fetch available guides and drivers for the booking date range
    if (request.request_type === 'tour_guide' || request.request_type === 'both') {
      try {
        const res = await fetch(
          `/api/employee/tourguides?startDate=${request.start_date}&endDate=${request.end_date}`,
          { credentials: 'include' }
        )
        if (res.ok) {
          const guides = await res.json()
          setAvailableGuides(guides)
        }
      } catch (e) {
        console.error('Failed to fetch guides:', e)
      }
    }

    if (request.request_type === 'driver' || request.request_type === 'both') {
      try {
        const res = await fetch(
          `/api/drivers?startDate=${request.start_date}&endDate=${request.end_date}`,
          { credentials: 'include' }
        )
        if (res.ok) {
          const drivers = await res.json()
          setAvailableDrivers(drivers)
        }
      } catch (e) {
        console.error('Failed to fetch drivers:', e)
      }
    }
  }

  const processChangeRequest = async (action: 'approved' | 'rejected') => {
    if (!selectedRequest) return

    if (action === 'approved') {
      if (
        (selectedRequest.request_type === 'tour_guide' || selectedRequest.request_type === 'both') &&
        !selectedNewGuideId
      ) {
        warning('Please select a new tour guide')
        return
      }
      if (
        (selectedRequest.request_type === 'driver' || selectedRequest.request_type === 'both') &&
        !selectedNewDriverId
      ) {
        warning('Please select a new driver')
        return
      }
    }

    try {
      const res = await fetch(`/api/change-requests/${selectedRequest.request_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: action,
          new_tour_guide_id: selectedNewGuideId || null,
          new_driver_id: selectedNewDriverId || null
        })
      })

      if (res.ok) {
        success(`Request ${action} successfully`)
        setShowProcessRequestModal(false)
        setSelectedRequest(null)
        fetchChangeRequests() // Refresh the list
      } else {
        const data = await res.json()
        showError(data.error || 'Failed to process request')
      }
    } catch (error) {
      console.error('Error processing request:', error)
      showError('An error occurred while processing the request')
    }
  }

  // Remove the old useEffect since we now call these in checkAuth

  const handleRegisterEmployee = async () => {
    if (!employeeName || !employeeEmail || !employeePhone) {
      warning("Please fill in all fields")
      return
    }

    // Role-specific validation
    if (employeeRole === "driver") {
      if (!licenseNo) {
        warning("License number is required for drivers")
        return
      }
    } else if (employeeRole === "tourguide") {
      if (!licenseNo) {
        warning("License number is required for tour guides")
        return
      }
      if (experience === "" || Number.isNaN(Number(experience))) {
        warning("Experience (years) is required for tour guides")
        return
      }
    } else if (employeeRole === "employee") {
      // For general employees, require position and department
      if (!position) {
        warning('Please select a position for the employee')
        return
      }
      if (!department) {
        warning('Please enter a department for the employee')
        return
      }
    }
    // Employee role doesn't require additional validation

    try {
      let driverImageBase64 = null
      if (employeeRole === "driver" && driverImage) {
        driverImageBase64 = await convertImageToBase64(driverImage)
      }

      const res = await fetch("/api/admin/register-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: employeeName,
          email: employeeEmail,
          phoneNo: employeePhone,
          role: employeeRole,
          position: employeeRole === 'employee' ? position : (employeeRole === 'tourguide' ? 'Tour Guide' : (employeeRole === 'driver' ? 'Driver' : undefined)),
          department: employeeRole === 'employee' ? department : undefined,
          licenseNo: employeeRole !== "employee" ? licenseNo : undefined,
          vehicleType: employeeRole === "driver" ? vehicleType || null : undefined,
          experience: employeeRole === "tourguide" ? Number(experience) : undefined,
          specialization: employeeRole === "tourguide" ? specialization || null : undefined,
          picture: employeeRole === "driver" ? driverImageBase64 : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: "Failed to register" }))
        throw new Error(data?.message || "Failed to register")
      }

      const data = await res.json()

      const newEmployee: Employee = {
        id: data.user_id ?? Date.now(),
        name: employeeName,
        email: employeeEmail,
        role: employeeRole,
        phone: employeePhone,
        hireDate: new Date().toISOString().split("T")[0],
      }

     
      const credentialsMessage = `Employee registered successfully!

Generated Login Credentials:
Username: ${data.username}
Temporary Password: ${data.temp_password}

Please share these credentials with the employee securely.
They should change their password after first login.

IMPORTANT: Copy these credentials now - they will not be shown again!`

      
      setEmployees([...employees, newEmployee])
      fetchEmployees()
      // Reset form
      setEmployeeName("")
      setEmployeeEmail("")
      setEmployeeRole("tourguide")
      setEmployeePhone("")
      setLicenseNo("")
      setExperience("")
      setVehicleType("")
      setSpecialization("")
      setPosition("")
      setDepartment("")
      setDriverImage(null)
      setDriverImagePreview("")
      setShowRegisterModal(false)

      // Show popup instead of alert
      setTimeout(() => {
        const popup = document.createElement('div')
        popup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        popup.innerHTML = `
          <div class="bg-white rounded-lg w-full max-w-md">
            <div class="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 class="text-xl font-semibold text-gray-900">Employee Registration Successful</h3>
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
                  <span class="font-semibold text-green-800">Registration Complete</span>
                </div>
                <div class="text-sm text-green-700 whitespace-pre-line">${credentialsMessage}</div>
              </div>
              <button onclick="this.closest('.fixed').remove()" class="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors">
                I have copied the credentials
              </button>
            </div>
          </div>
        `
        document.body.appendChild(popup)
      }, 100)
    } catch (e: any) {
      showError(e?.message || "Failed to register employee")
    }
  }

  const handleDeleteEmployee = async (id: number) => {
    setConfirmModalConfig({
      title: 'Delete Employee',
      message: 'Are you sure you want to delete this employee? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: async () => {
        setShowConfirmModal(false)
        try {
          const res = await fetch(`/api/admin/employees/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          })
          if (!res.ok) {
            const data = await res.json().catch(() => ({ message: 'Failed to delete' }))
            throw new Error(data?.message || 'Failed to delete employee')
          }
          // Optimistically remove then refresh from server
          setEmployees((prev) => prev.filter((emp) => emp.id !== id))
          fetchEmployees()
          success('Employee removed successfully!')
        } catch (e: any) {
          showError(e?.message || 'Failed to remove employee')
        }
      }
    })
    setShowConfirmModal(true)
  }

  const handleDeleteCustomer = (id: number) => {
    setConfirmModalConfig({
      title: 'Delete Customer',
      message: 'Are you sure you want to delete this customer? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
      onConfirm: () => {
        setShowConfirmModal(false)
        success("Customer deleted successfully!")
      }
    })
    setShowConfirmModal(true)
  }

  const getAverageRating = (employeeName: string) => {
    const employeeRatings = ratings.filter((r) => r.employeeName === employeeName)
    if (employeeRatings.length === 0) return 0
    return employeeRatings.reduce((sum, r) => sum + r.rating, 0) / employeeRatings.length
  }

  const fetchPromotions = async () => {
    setLoadingPromotions(true)
    try {
      const res = await fetch('/api/promotions', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load promotions')
      const data = await res.json()
      setPromotions(data)
    } catch (e) {
      console.error('Failed to fetch promotions:', e)
      setPromotions([])
    } finally {
      setLoadingPromotions(false)
    }
  }

  const fetchTours = async () => {
    try {
      const res = await fetch('/api/tours', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load tours')
      const data = await res.json()
      setTours(data)
    } catch (e) {
      console.error('Failed to fetch tours:', e)
      setTours([])
    }
  }

  const handleCreatePromotion = async () => {
    if (!promotionTitle || !selectedTourId) {
      warning("Please fill in all required fields")
      return
    }

    try {
      const res = await fetch('/api/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tour_id: parseInt(selectedTourId),
          title: promotionTitle,
          description: promotionDescription,
          discount_percentage: discountPercentage || null,
          discount_amount: discountAmount || null,
          start_date: startDate || null,
          end_date: endDate || null
        })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to create promotion' }))
        throw new Error(data.error || 'Failed to create promotion')
      }

      const data = await res.json()

      // Reset form
      setPromotionTitle("")
      setPromotionDescription("")
      setSelectedTourId("")
      setDiscountPercentage("")
      setDiscountAmount("")
      setStartDate("")
      setEndDate("")
      setShowPromotionModal(false)

      // Refresh promotions
      fetchPromotions()

      success('Promotion created successfully!')
    } catch (e: any) {
      showError(e.message || 'Failed to create promotion')
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setDriverImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setDriverImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const tourguideRatings = ratings.filter((r) => r.employeeRole === "tourguide")
  const driverRatings = ratings.filter((r) => r.employeeRole === "driver")

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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
                    const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                    // Regardless of res.ok, clear UI state by navigating home
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
      <nav className="bg-green-50 border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "dashboard"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Employees</span>
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
              onClick={() => setActiveTab("customers")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "customers"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Customers</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("promotions")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "promotions"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Tag className="w-5 h-5" />
                <span>Promotions</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "requests"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <RefreshCcw className="w-5 h-5" />
                <span>
                  Change Requests
                  {changeRequests.filter(r => r.status === 'pending').length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {changeRequests.filter(r => r.status === 'pending').length}
                    </span>
                  )}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("refunds")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "refunds"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>
                  Refund Requests
                  {refundRequests.length > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {refundRequests.length}
                    </span>
                  )}
                </span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Registered Employees</h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Register Employee</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {employees.map((employee) => (
                <div
                  key={`employee-${employee.id}`}
                  className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold text-lg">{employee.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            employee.role === "tourguide"
                              ? "bg-green-100 text-green-800"
                              : employee.role === "driver"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {employee.role === "tourguide" ? "Tour Guide" : employee.role === "driver" ? "Driver" : "Employee"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>📧 {employee.email}</p>
                    <p>📱 {employee.phone}</p>
                    <p>📅 Hired: {employee.hireDate}</p>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">{getAverageRating(employee.name).toFixed(1)}</span>
                      <span className="text-gray-500">average rating</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteEmployee(employee.id)}
                    className="mt-4 w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg transition-colors"
                  >
                    Remove Employee
                  </button>
                </div>
              ))}
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
                      {tourguideRatings.map((rating) => (
                        <tr key={`tourguide-rating-${rating.id}`} className="hover:bg-green-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {rating.employeeName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rating.customerName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, starIdx) => (
                                <Star
                                  key={`tg-${rating.id}-star-${starIdx}`}
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
                      ))}
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
                      {driverRatings.map((rating) => (
                        <tr key={`driver-rating-${rating.id}`} className="hover:bg-green-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {rating.employeeName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rating.customerName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, starIdx) => (
                                <Star
                                  key={`dr-${rating.id}-star-${starIdx}`}
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
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Registered Customers</h2>

            <div className="bg-white border-2 border-green-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-green-200">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Signup Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      ID Pictures
                    </th>

                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-100">
                  {customers.map((customer) => (
                    <tr key={`customer-${customer.id}`} className="hover:bg-green-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{customer.signupDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                          {customer.bookingsCount} bookings
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs font-semibold">
                              ✓ {customer.paidBookings || 0} Paid
                            </span>
                            {(customer.pendingPayments || 0) > 0 && (
                              <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold">
                                ⏳ {customer.pendingPayments} Pending
                              </span>
                            )}
                          </div>
                          {(customer.totalPaid || 0) > 0 && (
                            <div className="text-xs text-gray-600 font-medium">
                              Total: ETB {customer.totalPaid?.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {customer.idPictures && customer.idPictures.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {customer.idPictures.slice(0, 3).map((pic: string, index: number) => (
                              <img
                                key={index}
                                src={pic}
                                alt={`ID ${index + 1}`}
                                className="w-8 h-8 object-cover rounded border cursor-pointer hover:w-16 hover:h-16 transition-all"
                                onClick={() => window.open(pic, '_blank')}
                              />
                            ))}
                            {customer.idPictures.length > 3 && (
                              <span className="text-xs text-gray-500 self-center">
                                +{customer.idPictures.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">No pictures</span>
                        )}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Promotions Tab */}
        {activeTab === "promotions" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tour Promotions</h2>
              <button
                onClick={() => setShowPromotionModal(true)}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Tag className="w-5 h-5" />
                <span>Create Promotion</span>
              </button>
            </div>

            <div className="bg-white border-2 border-green-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-green-200">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Tour
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-green-100">
                  {promotions.map((promotion) => (
                    <tr key={`promotion-${promotion.promoid}`} className="hover:bg-green-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {promotion.tour_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {promotion.title || 'Promotion'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {promotion.dis ? `${promotion.dis}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {promotion.date ? new Date(promotion.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {promotion.end_date ? new Date(promotion.end_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {(() => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          const startDate = promotion.date ? new Date(promotion.date) : null
                          const endDate = promotion.end_date ? new Date(promotion.end_date) : null
                          
                          if (startDate && endDate) {
                            startDate.setHours(0, 0, 0, 0)
                            endDate.setHours(0, 0, 0, 0)
                            if (today < startDate) {
                              return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Upcoming</span>
                            } else if (today > endDate) {
                              return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Expired</span>
                            } else {
                              return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                            }
                          } else if (startDate) {
                            startDate.setHours(0, 0, 0, 0)
                            if (today < startDate) {
                              return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Upcoming</span>
                            } else {
                              return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                            }
                          }
                          return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {promotions.length === 0 && (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No promotions created yet</p>
                  <p className="text-sm text-gray-400">Create your first promotion to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Change Requests Tab */}
        {activeTab === "requests" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Change Requests</h2>
              <p className="text-gray-600 mt-1">Manage customer requests to change tour guides or drivers</p>
            </div>

            {loadingChangeRequests ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
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
                          <div className="text-sm text-gray-500">{request.customer_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{request.tour_name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
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
                          {new Date(request.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {request.status === 'pending' && (
                            <button
                              onClick={() => openProcessRequestModal(request)}
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
            )}
          </div>
        )}

        {/* Refund Requests Tab */}
        {activeTab === "refunds" && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Refund Requests</h2>
              <p className="text-gray-600 mt-1">Approve refunds for bookings with no available tour guides.</p>
            </div>

            {loadingRefundRequests ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {refundRequests.map((req) => (
                      <tr key={req.payment_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {req.customer_first_name} {req.customer_last_name}
                          </div>
                          <div className="text-sm text-gray-500">{req.customer_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">Booking #{req.booking_id}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ETB {Number(req.amount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {req.refund_request || 'REFUND_REQUESTED'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                          <button
                            onClick={() => {
                              setConfirmModalConfig({
                                title: 'Approve Refund',
                                message: `Are you sure you want to approve the refund of ETB ${Number(req.amount).toFixed(2)} for this payment?`,
                                confirmText: 'Approve',
                                cancelText: 'Cancel',
                                type: 'warning',
                                onConfirm: async () => {
                                  setShowConfirmModal(false)
                                  try {
                                    const res = await fetch('/api/payments/refund-approve', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      credentials: 'include',
                                      body: JSON.stringify({ paymentId: req.payment_id }),
                                    })
                                    const data = await res.json().catch(() => ({}))
                                    if (!res.ok) {
                                      showError(data.error || 'Failed to approve refund')
                                      return
                                    }
                                    success('Refund approved and payment marked as refunded.')
                                    fetchRefundRequests()
                                  } catch {
                                    showError('Failed to approve refund')
                                  }
                                }
                              })
                              setShowConfirmModal(true)
                            }}
                            className="text-green-600 hover:text-green-900 font-medium"
                          >
                            Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {refundRequests.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No refund requests</p>
                    <p className="text-sm text-gray-400">Refund requests from employees will appear here.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Process Change Request Modal */}
      {showProcessRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Process Change Request</h2>
              <p className="text-sm text-gray-600 mt-1">
                Assign new guide/driver for {selectedRequest.tour_name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Request Details:</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Customer:</strong> {selectedRequest.customer_first_name} {selectedRequest.customer_last_name}</p>
                  <p><strong>Tour:</strong> {selectedRequest.tour_name}</p>
                  <p><strong>Dates:</strong> {new Date(selectedRequest.start_date).toLocaleDateString()} - {new Date(selectedRequest.end_date).toLocaleDateString()}</p>
                  <p><strong>Type:</strong> {selectedRequest.request_type}</p>
                  {selectedRequest.reason && <p><strong>Reason:</strong> {selectedRequest.reason}</p>}
                </div>
              </div>

              {(selectedRequest.request_type === 'tour_guide' || selectedRequest.request_type === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select New Tour Guide <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedNewGuideId}
                    onChange={(e) => setSelectedNewGuideId(e.target.value)}
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
                    value={selectedNewDriverId}
                    onChange={(e) => setSelectedNewDriverId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">-- Select Driver --</option>
                    {availableDrivers.map((driver) => (
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
                  setShowProcessRequestModal(false)
                  setSelectedRequest(null)
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => processChangeRequest('rejected')}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => processChangeRequest('approved')}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve & Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Create Promotion</h3>
              <button onClick={() => setShowPromotionModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tour *</label>
                <select
                  value={selectedTourId}
                  onChange={(e) => setSelectedTourId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option key="select-tour" value="">Select a tour</option>
                  {tours.map((tour, index) => (
                    <option key={`tour-${index}`} value={tour.tour_id}>
                      {tour.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Promotion Title *</label>
                <input
                  type="text"
                  value={promotionTitle}
                  onChange={(e) => setPromotionTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Early Bird Special"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={promotionDescription}
                  onChange={(e) => setPromotionDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discount %</label>
                  <input
                    type="number"
                    value={discountPercentage}
                    onChange={(e) => {
                      setDiscountPercentage(e.target.value)
                      if (e.target.value) setDiscountAmount("")
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 20"
                    min="0"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OR Fixed Amount</label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => {
                      setDiscountAmount(e.target.value)
                      if (e.target.value) setDiscountPercentage("")
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 500"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCreatePromotion}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Create Promotion
              </button>
              <button
                onClick={() => setShowPromotionModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Employee Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Register Employee</h3>
              <button onClick={() => setShowRegisterModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter employee name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={employeeEmail}
                  onChange={(e) => setEmployeeEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="employee@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={employeePhone}
                  onChange={(e) => setEmployeePhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="+251-911-234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={employeeRole}
                  onChange={(e) => setEmployeeRole(e.target.value as "tourguide" | "driver" | "employee")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option key="tourguide" value="tourguide">Tour Guide</option>
                  <option key="driver" value="driver">Driver</option>
                  <option key="employee" value="employee">Employee</option>
                </select>
              </div>

              {employeeRole === 'employee' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">-- Select Position --</option>
                      <option value="Human Resource">Human Resource</option>
                      <option value="Accountant">Accountant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">-- Select Department --</option>
                      <option value="Human Resource">Human Resource</option>
                      <option value="Finances">Finances</option>
                    </select>
                  </div>
                </>
              )}

              {(employeeRole === "tourguide" || employeeRole === "driver") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                  <input
                    type="text"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder={employeeRole === "tourguide" ? "TG-XXXX-XXXX" : "DRV-XXXX-XXXX"}
                  />
                </div>
              )}

              {employeeRole === "tourguide" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                    <input
                      type="number"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value === '' ? '' : Number.parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialization (optional)</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="History, Nature, Culture..."
                    />
                  </div>
                </>
              )}

              {employeeRole === "driver" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type (optional)</label>
                    <input
                      type="text"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="SUV, Minivan, Bus..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Driver Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {driverImagePreview && (
                      <div className="mt-2">
                        <img
                          src={driverImagePreview}
                          alt="Driver preview"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleRegisterEmployee}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Register
              </button>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmModalConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className={`text-xl font-semibold ${
                confirmModalConfig.type === 'danger' ? 'text-red-800' :
                confirmModalConfig.type === 'warning' ? 'text-orange-800' :
                'text-blue-800'
              }`}>
                {confirmModalConfig.title}
              </h3>
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className={`mb-4 border rounded-lg p-4 ${
                confirmModalConfig.type === 'danger' ? 'bg-red-50 border-red-200' :
                confirmModalConfig.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-sm ${
                  confirmModalConfig.type === 'danger' ? 'text-red-700' :
                  confirmModalConfig.type === 'warning' ? 'text-orange-700' :
                  'text-blue-700'
                }`}>
                  {confirmModalConfig.message}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={confirmModalConfig.onConfirm}
                  className={`flex-1 py-2 px-4 rounded-lg transition-colors text-white ${
                    confirmModalConfig.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                    confirmModalConfig.type === 'warning' ? 'bg-orange-600 hover:bg-orange-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {confirmModalConfig.confirmText}
                </button>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  {confirmModalConfig.cancelText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
