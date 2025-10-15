"use client"

import { useState, useRef, useEffect } from "react"
import { X, Upload, ChevronRight, ChevronLeft, Car, CreditCard } from "lucide-react"
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
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
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

  // Fetch vehicles when component opens
  useEffect(() => {
    if (isOpen && authenticated) {
      fetchVehicles()
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

  const fetchTourByName = async () => {
    try {
      const response = await fetch('/api/tours', { credentials: 'include' })
      if (response.ok) {
        const tours = await response.json()
        const tour = tours.find((t: Tour) => t.name === tourName)
        setSelectedTour(tour || null)
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

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Final step - submit booking
      await submitBooking()
    }
  }

  const submitBooking = async () => {
    setLoading(true)
    setError('')

    try {
      // Calculate total price
      const selectedVehicleData = vehicles.find(v => v.id.toString() === formData.selectedVehicle)
      const vehiclePrice = selectedVehicleData?.dailyRate || 0
      const tourPrice = selectedTour?.price || 0
      const days = selectedTour?.durationDays || 1
      const totalPrice = (tourPrice + (vehiclePrice * days)) * formData.peopleCount

      // Create booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tourId: selectedTour?.id || null,
          vehicleId: selectedVehicleData?.id || null,
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

      // Create payment
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bookingId: booking.booking_id,
          amount: totalPrice,
          paymentMethod: formData.selectedBank,
          transactionId: `TXN_${Date.now()}_${booking.booking_id}`
        })
      })

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json()
        throw new Error(errorData.message || 'Failed to process payment')
      }

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
              <p className="text-gray-600">Your booking has been successfully created and payment processed.</p>
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

              {/* Step 3: Vehicle Selection */}
              {currentStep === 3 && (
                <div className="space-y-6">
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
                    <div className="text-center py-8">
                      <p className="text-gray-500">No vehicles available at the moment.</p>
                    </div>
                  )}
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
