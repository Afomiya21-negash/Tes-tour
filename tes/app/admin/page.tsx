"use client"

import { useEffect, useState } from "react"
import { Star, UserPlus, Users, X, LogOut, BarChart3, Shield, Lock, Tag } from "lucide-react"

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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "ratings" | "customers" | "promotions">("dashboard")
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
                <button onclick="this.closest('.fixed').remove(); window.location.href='/${data.user.role}'" class="text-gray-400 hover:text-gray-600">
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
                <button onclick="this.closest('.fixed').remove(); window.location.href='/${data.user.role}'" class="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors">
                  Go to ${data.user.role.charAt(0).toUpperCase() + data.user.role.slice(1)} Dashboard
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
      fetchTours()
      fetchPromotions()
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

  // Mock data
  const [employees, setEmployees] = useState<Employee[]>([])

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(false)

  const [ratings, setRatings] = useState<Rating[]>([])
  const [loadingRatings, setLoadingRatings] = useState(false)

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

  const fetchRatings = async () => {
    setLoadingRatings(true)
    try {
      const res = await fetch('/api/employee/ratings', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load ratings')
      const data = await res.json()

      // Transform the API data to match the Rating interface
      const transformedRatings: Rating[] = data.map((rating: any, index: number) => ({
        id: index + 1,
        employeeName: rating.employee_name,
        employeeRole: rating.rating_type as "tourguide" | "driver" | "employee",
        customerName: rating.customer_name,
        rating: Number(rating.rating),
        comment: rating.comment,
        date: rating.created_at ? new Date(rating.created_at).toISOString().split('T')[0] : 'N/A'
      }))

      setRatings(transformedRatings)
    } catch (e) {
      console.error('Failed to fetch ratings:', e)
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

  // Remove the old useEffect since we now call these in checkAuth

  const handleRegisterEmployee = async () => {
    if (!employeeName || !employeeEmail || !employeePhone) {
      alert("Please fill in all fields")
      return
    }

    // Role-specific validation
    if (employeeRole === "driver") {
      if (!licenseNo) {
        alert("License number is required for drivers")
        return
      }
    } else if (employeeRole === "tourguide") {
      if (!licenseNo) {
        alert("License number is required for tour guides")
        return
      }
      if (experience === "" || Number.isNaN(Number(experience))) {
        alert("Experience (years) is required for tour guides")
        return
      }
    } else if (employeeRole === "employee") {
      // For general employees, require position and department
      if (!position) {
        alert('Please select a position for the employee')
        return
      }
      if (!department) {
        alert('Please enter a department for the employee')
        return
      }
    }
    // Employee role doesn't require additional validation

    try {
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

      // Show the generated credentials to the admin in a popup
      const credentialsMessage = `Employee registered successfully!

Generated Login Credentials:
Username: ${data.username}
Temporary Password: ${data.temp_password}

Please share these credentials with the employee securely.
They should change their password after first login.

IMPORTANT: Copy these credentials now - they will not be shown again!`

      // Optimistic update (append), then refresh from server to ensure consistency
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
      alert(e?.message || "Failed to register employee")
    }
  }

  const handleDeleteEmployee = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee?")) return

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
      alert('Employee removed successfully!')
    } catch (e: any) {
      alert(e?.message || 'Failed to remove employee')
    }
  }

  const handleDeleteCustomer = (id: number) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      alert("Customer deleted successfully!")
    }
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
      alert("Please fill in all required fields")
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

      alert('Promotion created successfully!')
    } catch (e: any) {
      alert(e.message || 'Failed to create promotion')
    }
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
                  onClick={async () => {
                    if (confirm('This will add sample bookings, customers, and ratings to the database. Continue?')) {
                      try {
                        const res = await fetch('/api/admin/populate-sample-data', {
                          method: 'POST',
                          credentials: 'include'
                        })
                        const data = await res.json()
                        if (res.ok) {
                          alert(`Sample data populated successfully!\n\nBookings: ${data.data.bookings}\nCustomers: ${data.data.customers}\nPayments: ${data.data.payments}\nRatings: ${data.data.ratings}`)
                        } else {
                          alert(`Error: ${data.error}`)
                        }
                      } catch (error) {
                        alert('Failed to populate sample data')
                      }
                    }
                  }}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>Add Sample Data</span>
                </button>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Date
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rating.date}</td>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Date
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rating.date}</td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {promotion.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {promotion.discount_percentage ? `${promotion.discount_percentage}%` :
                         promotion.discount_amount ? `ETB ${promotion.discount_amount}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {promotion.start_date ? new Date(promotion.start_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {promotion.end_date ? new Date(promotion.end_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          promotion.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {promotion.is_active ? 'Active' : 'Inactive'}
                        </span>
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
      </main>

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
                  <option value="">Select a tour</option>
                  {tours.map((tour) => (
                    <option key={tour.tour_id} value={tour.tour_id}>
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
                  <option value="tourguide">Tour Guide</option>
                  <option value="driver">Driver</option>
                  <option value="employee">Employee</option>
                </select>
              </div>

              {employeeRole === 'employee' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. HR, Finance, Operations"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. Human Resources"
                    />
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
    </div>
  )
}
