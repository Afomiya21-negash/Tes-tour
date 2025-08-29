"use client"

import { useState, useRef, useEffect } from "react"
import { X, Upload, ChevronRight, ChevronLeft, Car, CreditCard } from "lucide-react"
import Image from "next/image"

interface BookingPopupProps {
  isOpen: boolean
  onClose: () => void
  tourName: string
}

export default function BookingPopup({ isOpen, onClose, tourName }: BookingPopupProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    peopleCount: 1,
    selectedVehicle: "",
    selectedBank: "",
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

  // Available vehicles
  const vehicles = [
    {
      id: "toyota-hilux",
      name: "Toyota Hilux",
      image: "/images/vehicles/hilux.jpg",
      capacity: "4-6 passengers",
      price: "$150/day"
    },
    {
      id: "toyota-landcruiser",
      name: "Toyota Land Cruiser",
      image: "/images/vehicles/landcruiser.jpg", 
      capacity: "6-8 passengers",
      price: "$200/day"
    },
    {
      id: "toyota-coaster",
      name: "Toyota Coaster",
      image: "/images/vehicles/coaster.jpg",
      capacity: "12-15 passengers", 
      price: "$300/day"
    },
    {
      id: "nissan-patrol",
      name: "Nissan Patrol",
      image: "/images/vehicles/patrol.jpg",
      capacity: "6-8 passengers",
      price: "$180/day"
    }
  ]

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

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
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
    })
    setUploadedFiles([])
    onClose()
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.phone.trim() && formData.peopleCount > 0
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
                    onClick={() => handleInputChange("selectedVehicle", vehicle.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      formData.selectedVehicle === vehicle.id
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                      <Car className="h-12 w-12 text-gray-400" />
                    </div>
                    <h4 className="font-semibold text-gray-900">{vehicle.name}</h4>
                    <p className="text-sm text-gray-600">{vehicle.capacity}</p>
                    <p className="text-sm font-medium text-emerald-600">{vehicle.price}</p>
                  </div>
                ))}
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
        </div>

        {/* Footer with Navigation */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              currentStep === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
          
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className={`flex items-center space-x-2 px-6 py-2 rounded-md transition-colors ${
              isStepValid()
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span>{currentStep === 4 ? "Complete Booking" : "Next"}</span>
            {currentStep < 4 && <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
