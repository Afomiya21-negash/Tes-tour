"use client"

import { useState, useEffect } from 'react'
import { MapPin, Calendar, User, Clock, FileText, X } from 'lucide-react'

interface TourGuideItineraryViewProps {
  bookingId: number
  onClose?: () => void
}

interface ItineraryData {
  itinerary_id: number | null
  booking_id: number
  tour_id: number
  tour_name: string
  description: string
  is_customized: boolean
  default_itinerary: string
  created_at: string | null
  updated_at: string | null
}

interface BookingDetails {
  booking_id: number
  customer_name: string
  customer_email: string
  customer_phone: string
  start_date: string
  end_date: string
  people_count: number
  status: string
}

export default function TourGuideItineraryView({ bookingId, onClose }: TourGuideItineraryViewProps) {
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null)
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [bookingId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch itinerary
      const itineraryResponse = await fetch(`/api/itinerary?booking_id=${bookingId}`, {
        credentials: 'include'
      })

      if (!itineraryResponse.ok) {
        throw new Error('Failed to fetch itinerary')
      }

      const itineraryData = await itineraryResponse.json()
      setItinerary(itineraryData)

      // Fetch booking details
      const bookingResponse = await fetch(`/api/bookings/${bookingId}`, {
        credentials: 'include'
      })

      if (bookingResponse.ok) {
        const bookingData = await bookingResponse.json()
        setBooking(bookingData)
      }

    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (error || !itinerary) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error || 'Failed to load itinerary'}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Itinerary</h2>
            <p className="text-gray-600 mt-1">{itinerary.tour_name}</p>
            <div className="flex items-center gap-2 mt-2">
              {itinerary.is_customized ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  <FileText className="w-3 h-3" />
                  Customized by Customer
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                  <FileText className="w-3 h-3" />
                  Default Itinerary
                </span>
              )}
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Booking Info */}
        {booking && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Customer</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{booking.customer_name}</p>
              <p className="text-xs text-gray-600 mt-1">{booking.customer_email}</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Tour Dates</span>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Group Size</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{booking.people_count} people</p>
            </div>
          </div>
        )}

        {/* Update Info */}
        {itinerary.is_customized && itinerary.updated_at && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-xl">ℹ️</div>
              <div className="flex-1">
                <p className="text-sm text-blue-800">
                  <strong>Customer Customization:</strong> This itinerary was customized by the customer on{' '}
                  {new Date(itinerary.updated_at).toLocaleDateString()} at{' '}
                  {new Date(itinerary.updated_at).toLocaleTimeString()}. 
                  Please review the changes below.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Itinerary Content */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Itinerary Details</h3>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                {itinerary.description}
              </pre>
            </div>
          </div>

          {/* Show default itinerary if customized */}
          {itinerary.is_customized && itinerary.default_itinerary && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                View Original Default Itinerary
              </summary>
              <div className="mt-3 bg-white border border-gray-200 rounded-lg p-4">
                <pre className="whitespace-pre-wrap font-sans text-gray-600 text-sm leading-relaxed">
                  {itinerary.default_itinerary}
                </pre>
              </div>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Print Itinerary
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
