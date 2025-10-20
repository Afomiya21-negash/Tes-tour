"use client"

import { useState, useRef, useEffect } from "react"
import { X, Upload, ChevronRight, ChevronLeft, Car, CreditCard, User, Star } from "lucide-react"
import Image from "next/image"

interface BookingPopupProps {
  isOpen: boolean
  onClose: () => void
  tourName: string
}

interface Vehicle {
  id: number
  make: string
  model: string
  capacity: number | null
  dailyRate: number | null
}

interface Tour {
  id: number
  name: string
  price: number
  durationDays: number | null
}

export default function BookingPopup({ isOpen, onClose, tourName }: BookingPopupProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [authenticated, setAuthenticated] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [availableTours, setAvailableTours] = useState<Tour[]>([])
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Check auth once when opened
    if (isOpen) {
      fetch('/api/auth/profile', { credentials: 'include' })
        .then(r => r.json())
        .then(d => {
          const ok = Boolean(d?.authenticated && d?.user?.role === 'customer')
          setAuthenticated(ok)
          if (!ok) {
            window.location.href = '/login'
          }
        })
        .catch(() => {
          setAuthenticated(false)
          window.location.href = '/login'
        })
    }
  }, [isOpen])

  // Fetch vehicles and drivers when component opens
  useEffect(() => {
    if (isOpen && authenticated) {
      fetchVehicles()
      fetchDrivers()
      fetchTourByName()
    }
  }, [isOpen, authenticated, tourName])

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (e) {
      console.error('Error fetching vehicles:', e)
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setDrivers(data)
      }
    } catch (e) {
      console.error('Error fetching drivers:', e)
    }
  }

  const fetchTourByName = async () => {
    try {
      const response = await fetch('/api/tours', { credentials: 'include' })
      if (response.ok) {
        const tours = await response.json()
        console.log('Available tours:', tours)
        console.log('Looking for tour name:', tourName)
        
        setAvailableTours(tours)
        
        const tour = tours.find((t: Tour) => t.name.toLowerCase() === tourName.toLowerCase())
        console.log('Selected tour:', tour)
        
        if (!tour) {
          console.warn(`Tour not found: "${tourName}". Available tours:`, tours.map(t => t.name))
          // If no exact match, try to find a similar tour or use the first available tour
          const similarTour = tours.find((t: Tour) => 
            t.name.toLowerCase().includes(tourName.toLowerCase()) || 
            tourName.toLowerCase().includes(t.name.toLowerCase())
          )
          if (similarTour) {
            console.log('Using similar tour:', similarTour)
            setSelectedTour(similarTour)
          } else if (tours.length > 0) {
            console.log('Using first available tour:', tours[0])
            setSelectedTour(tours[0])
          }
        } else {
          setSelectedTour(tour)
        }
      }
    } catch (e) {
      console.error('Error fetching tours:', e)
    }
  }

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    peopleCount: 1,
    selectedVehicle: "",
    selectedDriver: "",
    selectedBank: "",
    startDate: "",
    endDate: "",
  })
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle escape key to close popup
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // Available banks
  const banks = [
    { id: "cbe", name: "CBE", logo: "/images/banks/cbe.png" },
    { id: "dashen", name: "Dashen Bank", logo: "/images/banks/dashen.png" },
    { id: "zemen", name: "Zemen Bank", logo: "/images/banks/zemen.png" },
    { id: "abyssinia", name: "Bank of Abyssinia", logo: "/images/banks/abyssinia.png" }
  ]

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (uploadedFiles.length + files.length <= 3) {
      setUploadedFiles(prev => [...prev, ...files])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleNext = async () => {
    if (!authenticated) {
      window.location.href = '/login'
      return
    }

    // Validation for each step
    if (currentStep === 1) {
      if (!selectedTour) {
        setError('Please select a tour to continue')
        return
      }
      if (!formData.name || !formData.phone || !formData.startDate || !formData.endDate) {
        setError('Please fill in all required fields')
        return
      }
    } else if (currentStep === 3) {
      if (!formData.selectedVehicle || !formData.selectedDriver) {
        setError('Please select both a vehicle and a driver')
        return
      }
    }

    setError('') // Clear any previous errors

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Final step - submit booking (prevent double submission)
      if (!loading) {
        await submitBooking()
      }
    }
  }

  const submitBooking = async () => {
    if (loading) return // Prevent double submission
    setLoading(true)
    setError('')

    try {
      // Calculate total price
      const selectedVehicleData = vehicles.find(v => v.id.toString() === formData.selectedVehicle)
      const selectedDriverData = drivers.find(d => d.user_id.toString() === formData.selectedDriver)
      const vehiclePrice = selectedVehicleData?.dailyRate || 0
      const tourPrice = selectedTour?.price || 0
      const days = selectedTour?.durationDays || 1
      const totalPrice = (tourPrice + (vehiclePrice * days)) * formData.peopleCount

      // Create booking
      console.log('Submitting booking with tourId:', selectedTour?.id)
      console.log('Selected tour details:', selectedTour)
      
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tourId: selectedTour?.id || null,
          vehicleId: selectedVehicleData?.id || null,
          driverId: selectedDriverData?.user_id || null,
          startDate: formData.startDate,
          endDate: formData.endDate,
          totalPrice,
          peopleCount: formData.peopleCount,
          specialRequests: ''
        })
      })

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json()
        throw new Error(errorData.message || 'Failed to create booking')
      }

      const booking = await bookingResponse.json()

      // For now, skip payment integration and just mark booking as confirmed
      // In the future, this is where payment processing would happen
      console.log('Booking created successfully:', booking)
      console.log('Payment method selected:', formData.selectedBank)
      console.log('Total amount:', totalPrice)

      setBookingSuccess(true)
    } catch (e: any) {
      setError(e.message || 'An error occurred while processing your booking')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleClose = () => {
    setCurrentStep(1)
    setFormData({
      name: "",
      phone: "",
      peopleCount: 1,
      selectedVehicle: "",
      selectedBank: "",
      startDate: "",
      endDate: "",
    })
    setUploadedFiles([])
    setBookingSuccess(false)
    setError('')
    onClose()
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.phone.trim() && formData.peopleCount > 0 && formData.startDate && formData.endDate
      case 2:
        return uploadedFiles.length === 3
      case 3:
        return formData.selectedVehicle
      case 4:
        return formData.selectedBank
      default:
        return false
    }
  }

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Book Your Tour</h2>
            <p className="text-gray-600">{tourName}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center p-4 bg-gray-50">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step <= currentStep
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`w-16 h-1 mx-2 ${
                    step < currentStep ? "bg-emerald-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="p-6">
          {/* Success Message */}
          {bookingSuccess && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Booking Confirmed!</h3>
              <p className="text-gray-600">Your booking has been successfully created. Payment integration will be available soon.</p>
              <button
                onClick={handleClose}
                className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!bookingSuccess && (
            <>
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of People *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.peopleCount}
                        onChange={(e) => handleInputChange("peopleCount", parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>
                  {selectedTour && (
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-semibold text-gray-900">Selected Tour</h4>
                      <p className="text-gray-600">{selectedTour.name}</p>
                      <p className="text-emerald-600 font-medium">${selectedTour.price} per person</p>
                    </div>
                  )}
                  
                  {!selectedTour && availableTours.length > 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-yellow-800 text-sm">
                        <strong>Note:</strong> The requested tour "{tourName}" was not found. Please select from available tours below.
                      </p>
                    </div>
                  )}
                  
                  {availableTours.length > 0 && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {selectedTour ? 'Change Tour' : 'Select Tour'}
                      </label>
                      <select
                        value={selectedTour?.id || ''}
                        onChange={(e) => {
                          const tourId = parseInt(e.target.value)
                          const tour = availableTours.find(t => t.id === tourId)
                          setSelectedTour(tour || null)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select a tour...</option>
                        {availableTours.map((tour) => (
                          <option key={tour.id} value={tour.id}>
                            {tour.name} - ${tour.price}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

          {/* Step 2: ID/Passport Upload */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Upload ID/Passport Photos</h3>
              <p className="text-gray-600">Please upload 3 ID or passport pictures</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {uploadedFiles[index] ? (
                      <div className="relative">
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm text-gray-600">File uploaded</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-32 flex flex-col items-center justify-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Upload file</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Choose Files
              </button>
            </div>
          )}

              {/* Step 3: Vehicle & Driver Selection */}
              {currentStep === 3 && (
                <div className="space-y-8">
                  {/* Vehicle Selection */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Available Vehicles</h3>
                    <p className="text-gray-600">Select your preferred vehicle</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vehicles.map((vehicle) => (
                        <div
                          key={vehicle.id}
                          onClick={() => handleInputChange("selectedVehicle", vehicle.id.toString())}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            formData.selectedVehicle === vehicle.id.toString()
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                            <Car className="h-12 w-12 text-gray-400" />
                          </div>
                          <h4 className="font-semibold text-gray-900">{vehicle.make} {vehicle.model}</h4>
                          <p className="text-sm text-gray-600">
                            {vehicle.capacity ? `${vehicle.capacity} passengers` : 'Capacity not specified'}
                          </p>
                          <p className="text-sm font-medium text-emerald-600">
                            ${vehicle.dailyRate || 0}/day
                          </p>
                        </div>
                      ))}
                    </div>

                    {vehicles.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No vehicles available at the moment.</p>
                      </div>
                    )}
                  </div>

                  {/* Driver Selection */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Available Drivers</h3>
                    <p className="text-gray-600">Select your preferred driver</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {drivers.map((driver) => (
                        <div
                          key={driver.user_id}
                          onClick={() => handleInputChange("selectedDriver", driver.user_id.toString())}
                          className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                            formData.selectedDriver === driver.user_id.toString()
                              ? "border-emerald-500 bg-emerald-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">
                                {driver.first_name} {driver.last_name}
                              </h4>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-gray-600">
                                  {Number(driver.average_rating).toFixed(1)} ({driver.total_trips} trips)
                                </span>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              driver.availability === 'available'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {driver.availability}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{driver.email}</p>
                          <p className="text-sm text-gray-600">{driver.phone}</p>
                        </div>
                      ))}
                    </div>

                    {drivers.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-gray-500">No drivers available at the moment.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

          {/* Step 4: Payment Selection */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Payment Method</h3>
              <p className="text-gray-600">Select your preferred bank for payment</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {banks.map((bank) => (
                  <div
                    key={bank.id}
                    onClick={() => handleInputChange("selectedBank", bank.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors text-center ${
                      formData.selectedBank === bank.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CreditCard className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">{bank.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}
        </div>

        {/* Footer with Navigation */}
        {!bookingSuccess && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                currentStep === 1 || loading
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!isStepValid() || loading}
              className={`flex items-center space-x-2 px-6 py-2 rounded-md transition-colors ${
                isStepValid() && !loading
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{currentStep === 4 ? "Complete Booking" : "Next"}</span>
                  {currentStep < 4 && <ChevronRight className="h-4 w-4" />}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
