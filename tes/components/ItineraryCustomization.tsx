"use client"

import { useState, useEffect } from 'react'
import { Edit, Save, X, Calendar, MapPin, Clock, AlertCircle } from 'lucide-react'

interface ItineraryCustomizationProps {
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

export default function ItineraryCustomization({ bookingId, onClose }: ItineraryCustomizationProps) {
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedDescription, setEditedDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchItinerary()
  }, [bookingId])

  const fetchItinerary = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/itinerary?booking_id=${bookingId}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || errorData.details || 'Failed to fetch itinerary')
      }

      const data = await response.json()
      setItinerary(data)
      setEditedDescription(data.description)
    } catch (err: any) {
      console.error('Error loading itinerary:', err)
      setError(err.message || 'Failed to load itinerary')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError('')
    setSuccessMessage('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedDescription(itinerary?.description || '')
    setError('')
  }

  const handleSave = async () => {
    if (!editedDescription.trim()) {
      setError('Itinerary description cannot be empty')
      return
    }

    try {
      setSaving(true)
      setError('')

      const response = await fetch('/api/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          booking_id: bookingId,
          description: editedDescription
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.details || errorData.error || 'Failed to save itinerary')
      }

      const result = await response.json()
      setSuccessMessage('Itinerary updated successfully! Your tour guide has been notified.')
      setIsEditing(false)
      
      // Refresh itinerary data
      await fetchItinerary()

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (err: any) {
      setError(err.message || 'Failed to save itinerary')
    } finally {
      setSaving(false)
    }
  }

  const handleResetToDefault = () => {
    if (itinerary?.default_itinerary) {
      setEditedDescription(itinerary.default_itinerary)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!itinerary) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load itinerary</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tour Itinerary</h2>
            <p className="text-gray-600 mt-1">{itinerary.tour_name}</p>
            {itinerary.is_customized && (
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                <Edit className="w-3 h-3" />
                Customized
              </span>
            )}
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

      {/* Success Message */}
      {successMessage && (
        <div className="mx-6 mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-green-600 text-xl">✓</div>
            <div className="flex-1">
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Tour</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{itinerary.tour_name}</p>
          </div>
          
          {itinerary.updated_at && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Last Updated</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(itinerary.updated_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Itinerary Description */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Itinerary Details</h3>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Itinerary
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full min-h-[300px] px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter your customized itinerary details..."
              />
              
              <div className="flex items-center justify-between">
                <button
                  onClick={handleResetToDefault}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Reset to default itinerary
                </button>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                  {itinerary.description}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Info Note */}
        {!isEditing && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 text-xl">ℹ️</div>
              <div className="flex-1">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> When you edit and save your itinerary, your tour guide will be automatically notified 
                  and can view your customized plan. This helps ensure your tour matches your preferences!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
