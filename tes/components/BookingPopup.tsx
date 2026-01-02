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
  imageUrl?: string | null
}

interface Promotion {
  discount_percentage: number
  // add other promotion fields here if your API returns them
}

interface Tour {
  id: number
  name: string
  price: number
  durationDays: number | null
  promotions?: Promotion[] | null
}

export default function BookingPopup({ isOpen, onClose, tourName }: BookingPopupProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [authenticated, setAuthenticated] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [error, setError] = useState<string>('')
  const [previousIdPictures, setPreviousIdPictures] = useState<string[]>([])

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
            return
          }
          // Autofill name and phone from profile
          const first = d?.user?.first_name || ''
          const last = d?.user?.last_name || ''
          const phone = d?.user?.phone_number || ''
          const displayName = (first || last) ? `${first} ${last}`.trim() : (d?.user?.username || '')
          setFormData(prev => ({
            ...prev,
            name: prev.name || displayName,
            phone: prev.phone || phone,
          }))
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
      fetchPreviousIdPictures()
    }
  }, [isOpen, authenticated, tourName])

  const fetchPreviousIdPictures = async () => {
    try {
      const res = await fetch('/api/bookings', { credentials: 'include' })
      if (!res.ok) return
      const data = await res.json()
      // Find the most recent booking with stored pictures
      const withPics = (data || []).find((b: any) => b.id_pictures)
      if (withPics && typeof withPics.id_pictures === 'string') {
        try {
          const parsed = JSON.parse(withPics.id_pictures)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPreviousIdPictures(parsed as string[])
          }
        } catch {}
      }
    } catch {}
  }

  const fetchTourByName = async () => {
    try {
      const response = await fetch('/api/tours', { credentials: 'include' })
      if (response.ok) {
        const tours = await response.json()
        console.log('Available tours:', tours)
        console.log('Looking for tour name:', tourName)

        // Normalize tour name for better matching
        const normalizedTourName = tourName.toLowerCase().trim()

        // Find the exact tour by name first
        let tour = tours.find((t: Tour) => t.name.toLowerCase().trim() === normalizedTourName)

        if (!tour) {
          // Try partial matching if exact match fails
          tour = tours.find((t: Tour) => {
            const normalizedTourDbName = t.name.toLowerCase().trim()
            return normalizedTourDbName.includes(normalizedTourName) ||
                   normalizedTourName.includes(normalizedTourDbName)
          })
        }

        if (!tour) {
          // Try keyword-based matching for common tour types
          const keywords = normalizedTourName.split(/[\s-]+/)
          tour = tours.find((t: Tour) => {
            const normalizedTourDbName = t.name.toLowerCase().trim()
            return keywords.some(keyword =>
              keyword.length > 2 && normalizedTourDbName.includes(keyword)
            )
          })
        }

        console.log('Selected tour:', tour)

        if (tour) {
          setSelectedTour(tour)
        } else {
          console.warn(`Tour not found: "${tourName}". Available tours:`, tours.map((t: any) => t.name))
          setError(`Tour "${tourName}" not found in database. Please check the tour name or contact support.`)
        }
      } else {
        setError('Failed to load tour information from server')
      }
    } catch (e) {
      console.error('Error fetching tours:', e)
      setError('Failed to load tour information')
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

  //  Fetch vehicles function (moved here after formData declaration)
  const fetchVehicles = async () => {
    try {
      //  Pass date parameters to filter only available vehicles
      let url = '/api/vehicles'
      if (formData.startDate && formData.endDate) {
        url += `?startDate=${encodeURIComponent(formData.startDate)}&endDate=${encodeURIComponent(formData.endDate)}`
      }
      const response = await fetch(url, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (e) {
      console.error('Error fetching vehicles:', e)
    }
  }

  //Fetch drivers function 
  const fetchDrivers = async () => {
    try {
      // Pass date parameters to filter only available drivers
      let url = '/api/drivers'
      if (formData.startDate && formData.endDate) {
        url += `?startDate=${encodeURIComponent(formData.startDate)}&endDate=${encodeURIComponent(formData.endDate)}`
      }
      const response = await fetch(url, { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setDrivers(data)
      }
    } catch (e) {
      console.error('Error fetching drivers:', e)
    }
  }

  // Refetch vehicles and drivers when dates change to show only available ones
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      fetchVehicles()
      fetchDrivers()
    }
  }, [formData.startDate, formData.endDate])

  // Available banks
  const banks = [
    { id: "cbe", name: "CBE", logo: "/images/banks/cbe.png" },
    { id: "dashen", name: "Dashen Bank", logo: "/images/banks/dashen.png" },
    { id: "zemen", name: "Zemen Bank", logo: "/images/banks/zemen.png" },
    { id: "abyssinia", name: "Bank of Abyssinia", logo: "/images/banks/abyssinia.png" }
  ]

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (error) setError('')
  }
  
  // Validate Ethiopian phone number
  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Ethiopian phone numbers should be:
    // - 10 digits starting with 0 (e.g., 0911234567)
    // - 9 digits without leading 0 (e.g., 911234567)
    // - 12 digits with country code (e.g., 251911234567)
    
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return true // Valid: 0911234567
    }
    if (cleaned.length === 9) {
      return true // Valid: 911234567
    }
    if (cleaned.length === 12 && cleaned.startsWith('251')) {
      return true // Valid: 251911234567
    }
    
    return false
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
      // Validate phone number format
      if (!validatePhone(formData.phone)) {
        setError('Please enter a valid Ethiopian phone number (e.g., 0911234567 or 911234567)')
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

      // Calculate tour price with promotion discount if available
      let tourPrice = selectedTour?.price || 0
      if (selectedTour?.promotions && selectedTour.promotions.length > 0) {
        const discountPercentage = selectedTour.promotions[0].discount_percentage
        tourPrice = Math.round(tourPrice * (1 - discountPercentage / 100))
      }

      const days = selectedTour?.durationDays || 1
      const totalPrice = (tourPrice + (vehiclePrice * days)) * formData.peopleCount

      // Create booking with FormData to handle file uploads
      console.log('Submitting booking with tourId:', selectedTour?.id)
      console.log('Selected tour details:', selectedTour)

      const bookingFormData = new FormData()
      bookingFormData.append('tourId', selectedTour?.id?.toString() || '')
      bookingFormData.append('vehicleId', selectedVehicleData?.id?.toString() || '')
      bookingFormData.append('driverId', selectedDriverData?.user_id?.toString() || '')
      bookingFormData.append('tourGuideId', selectedTour?.tour_guide_id?.toString() || '') // ✅ FIX: Pass tour guide ID from tour
      bookingFormData.append('startDate', formData.startDate)
      bookingFormData.append('endDate', formData.endDate)
      bookingFormData.append('totalPrice', totalPrice.toString())
      bookingFormData.append('peopleCount', formData.peopleCount.toString())
      bookingFormData.append('specialRequests', '')
      bookingFormData.append('customerName', formData.name)
      bookingFormData.append('customerPhone', formData.phone)

      // Add uploaded files
      uploadedFiles.forEach((file, index) => {
        bookingFormData.append(`idPicture${index}`, file)
      })

      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        credentials: 'include',
        body: bookingFormData
      })

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json()
        throw new Error(errorData.message || 'Failed to create booking')
      }

      const booking = await bookingResponse.json()

      // Initialize payment immediately after booking creation
      console.log('Booking created successfully:', booking)
      console.log('Initializing payment...')

      // Initialize payment with Chappa
      const paymentResponse = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          booking_id: booking.booking_id,
          payment_method: formData.selectedBank // Pass selected bank
        })
      })

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json()
        console.error('Payment initialization failed:', errorData)
        throw new Error(errorData.error || errorData.details || 'Failed to initialize payment')
      }

      const paymentData = await paymentResponse.json()

      if (paymentData.success && paymentData.checkout_url) {
        // Redirect to Chappa payment page
        window.location.href = paymentData.checkout_url
      } else {
        throw new Error('Failed to get payment checkout URL')
      }
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
      selectedDriver: "",
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
        return uploadedFiles.length === 3 || previousIdPictures.length >= 3
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
                        placeholder="0911234567 or 911234567"
                        title="Enter Ethiopian phone number (9-10 digits)"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter 9 or 10 digits (e.g., 0911234567)
                      </p>
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
                      <div className="flex items-center gap-2">
                        <p className="text-gray-600">{selectedTour.name}</p>
                        {selectedTour.promotions && selectedTour.promotions.length > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            {selectedTour.promotions[0].discount_percentage}% OFF
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedTour.promotions && selectedTour.promotions.length > 0 ? (
                          <>
                            <p className="text-gray-400 line-through text-sm">ETB {selectedTour.price}</p>
                            <p className="text-emerald-600 font-medium">
                              ETB {Math.round(selectedTour.price * (1 - selectedTour.promotions[0].discount_percentage / 100))} per person
                            </p>
                          </>
                        ) : (
                          <p className="text-emerald-600 font-medium">ETB {selectedTour.price} per person</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!selectedTour && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-yellow-800 text-sm">
                        <strong>Note:</strong> The requested tour "{tourName}" was not found. Please try again or contact support.
                      </p>
                    </div>
                  )}
                  
                  {selectedTour && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Selected Tour
                      </label>
                      <div className="w-full px-4 py-3 border border-emerald-200 rounded-md bg-emerald-50 relative">
                        {selectedTour.promotions && selectedTour.promotions.length > 0 && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                            {selectedTour.promotions[0].discount_percentage}% OFF
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-emerald-900">{selectedTour.name}</h4>
                            <p className="text-sm text-emerald-700">
                              Duration: {selectedTour.durationDays} days
                            </p>
                            {selectedTour.promotions && selectedTour.promotions.length > 0 && (
                              <p className="text-xs text-red-600 font-medium mt-1">
                                🎉 Limited Time Offer!
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {selectedTour.promotions && selectedTour.promotions.length > 0 ? (
                              <>
                                <p className="text-sm text-gray-500 line-through">ETB {selectedTour.price}</p>
                                <p className="text-lg font-bold text-emerald-900">
                                  ETB {Math.round(selectedTour.price * (1 - selectedTour.promotions[0].discount_percentage / 100))}
                                </p>
                                <p className="text-xs text-emerald-600">per person</p>
                              </>
                            ) : (
                              <>
                                <p className="text-lg font-bold text-emerald-900">ETB {selectedTour.price}</p>
                                <p className="text-xs text-emerald-600">per person</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

          {/* Step 2: ID/Passport Upload */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">Upload ID/Passport Photos</h3>
              <p className="text-gray-600">Please upload 3 ID or passport pictures</p>

              {previousIdPictures.length >= 3 && (
                <div className="bg-green-50 border border-green-200 p-4 rounded">
                  <p className="text-sm text-green-800 font-medium mb-2">We found your previously uploaded ID pictures. You can reuse them or upload new ones.</p>
                  <div className="grid grid-cols-3 gap-4">
                    {previousIdPictures.slice(0,3).map((url, i) => (
                      <div key={`prev-id-${i}`} className="border rounded overflow-hidden">
                        <img src={url} alt={`Previous ID ${i+1}`} className="w-full h-32 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
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
                    ) : previousIdPictures[index] ? (
                      <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <img src={previousIdPictures[index]} alt={`ID ${index+1}`} className="w-full h-full object-cover" />
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
                          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden mb-3">
                            {vehicle.imageUrl ? (
                              <Image
                                src={vehicle.imageUrl}
                                alt={`${vehicle.make} ${vehicle.model}`}
                                width={300}
                                height={128}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to icon if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0"></path></svg></div>';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Car className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <h4 className="font-semibold text-gray-900">{vehicle.make} {vehicle.model}</h4>
                          <p className="text-sm text-gray-600">
                            {vehicle.capacity ? `${vehicle.capacity} passengers` : 'Capacity not specified'}
                          </p>
                          <p className="text-sm font-medium text-emerald-600">
                            ETB {vehicle.dailyRate || 0}/day
                          </p>
                        </div>
                      ))}
                    </div>

                    {vehicles.length === 0 && (
                      <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <Car className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                        <p className="text-gray-700 font-medium">No vehicles available for the selected dates</p>
                        <p className="text-sm text-gray-600 mt-2">
                          {formData.startDate && formData.endDate 
                            ? 'All vehicles are booked during this period. Please try different dates.'
                            : 'Please select your travel dates to see available vehicles.'}
                        </p>
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
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                              {driver.picture ? (
                                <img
                                  src={driver.picture}
                                  alt={`${driver.first_name} ${driver.last_name}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-6 w-6 text-gray-400" />
                              )}
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
                      <div className="text-center py-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <User className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                        <p className="text-gray-700 font-medium">No drivers available for the selected dates</p>
                        <p className="text-sm text-gray-600 mt-2">
                          {formData.startDate && formData.endDate 
                            ? 'All drivers are booked during this period. Please try different dates or contact support.'
                            : 'Please select your travel dates to see available drivers.'}
                        </p>
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
