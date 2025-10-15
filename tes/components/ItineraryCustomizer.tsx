"use client"

import { useState, useEffect } from "react"
import { Calendar, MapPin, Clock, Edit3, Plus, Trash2, Send, CheckCircle, XCircle } from "lucide-react"

interface ItineraryDay {
  custom_itinerary_id?: number
  day_number: number
  title: string
  description: string
  location?: string
  overnight_location?: string
  activities?: string
  meals_included?: string
  special_requests?: string
  is_approved?: boolean
}

interface ItineraryRequest {
  request_id: number
  request_type: 'modification' | 'addition' | 'removal'
  day_number?: number
  requested_changes: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  admin_response?: string
  created_at: string
}

interface ItineraryCustomizerProps {
  bookingId: number
  tourId?: number
  onClose: () => void
}

export default function ItineraryCustomizer({ bookingId, tourId, onClose }: ItineraryCustomizerProps) {
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([])
  const [requests, setRequests] = useState<ItineraryRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [requestForm, setRequestForm] = useState({
    type: 'modification' as 'modification' | 'addition' | 'removal',
    dayNumber: 1,
    changes: '',
    reason: ''
  })
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchItinerary()
    fetchRequests()
  }, [bookingId])

  const fetchItinerary = async () => {
    try {
      const response = await fetch(`/api/itineraries/booking/${bookingId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setItinerary(data)
      } else if (response.status === 404 && tourId) {
        // No custom itinerary exists, create one from tour default
        await createCustomItinerary()
      } else {
        setError('Failed to fetch itinerary')
      }
    } catch (e) {
      setError('An error occurred while fetching itinerary')
    }
  }

  const createCustomItinerary = async () => {
    try {
      const response = await fetch(`/api/itineraries/booking/${bookingId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tourId })
      })
      
      if (response.ok) {
        await fetchItinerary()
      }
    } catch (e) {
      console.error('Error creating custom itinerary:', e)
    }
  }

  const fetchRequests = async () => {
    try {
      const response = await fetch(`/api/itineraries/requests/${bookingId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (e) {
      console.error('Error fetching requests:', e)
    } finally {
      setLoading(false)
    }
  }

  const submitRequest = async () => {
    if (!requestForm.changes.trim()) {
      setError('Please describe the changes you want to make')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/itineraries/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          bookingId,
          requestType: requestForm.type,
          requestedChanges: requestForm.changes,
          dayNumber: requestForm.type !== 'addition' ? requestForm.dayNumber : undefined,
          reason: requestForm.reason
        })
      })
      
      if (response.ok) {
        setShowRequestForm(false)
        setRequestForm({ type: 'modification', dayNumber: 1, changes: '', reason: '' })
        await fetchRequests()
        setError('')
      } else {
        setError('Failed to submit request')
      }
    } catch (e) {
      setError('An error occurred while submitting request')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-center mt-4">Loading itinerary...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Customize Your Itinerary</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Itinerary Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Current Itinerary */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Your Itinerary</h3>
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Request Changes</span>
                </button>
              </div>

              {itinerary.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No itinerary available for this booking.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {itinerary.map((day) => (
                    <div key={day.day_number} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                            {day.day_number}
                          </div>
                          <h4 className="font-semibold text-gray-900">{day.title}</h4>
                        </div>
                        {day.is_approved && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Approved
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-3">{day.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {day.location && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Location: {day.location}</span>
                          </div>
                        )}
                        {day.overnight_location && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Overnight: {day.overnight_location}</span>
                          </div>
                        )}
                        {day.activities && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-gray-600">Activities: {day.activities}</span>
                          </div>
                        )}
                        {day.meals_included && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Meals: {day.meals_included}</span>
                          </div>
                        )}
                      </div>
                      
                      {day.special_requests && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            <strong>Special Requests:</strong> {day.special_requests}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Requests Sidebar */}
          <div className="w-80 border-l border-gray-200 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Modification Requests</h3>
              
              {requests.length === 0 ? (
                <p className="text-gray-600 text-sm">No requests submitted yet.</p>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.request_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {request.request_type}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </span>
                      </div>
                      
                      {request.day_number && (
                        <p className="text-sm text-gray-600 mb-2">Day {request.day_number}</p>
                      )}
                      
                      <p className="text-sm text-gray-800 mb-2">{request.requested_changes}</p>
                      
                      {request.reason && (
                        <p className="text-xs text-gray-600 mb-2">
                          <strong>Reason:</strong> {request.reason}
                        </p>
                      )}
                      
                      {request.admin_response && (
                        <div className="mt-2 p-2 bg-gray-50 rounded border">
                          <p className="text-xs text-gray-600">
                            <strong>Admin Response:</strong> {request.admin_response}
                          </p>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Itinerary Changes</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Request Type
                  </label>
                  <select
                    value={requestForm.type}
                    onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="modification">Modify Existing Day</option>
                    <option value="addition">Add New Activity</option>
                    <option value="removal">Remove Activity</option>
                  </select>
                </div>
                
                {requestForm.type !== 'addition' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Day Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={itinerary.length}
                      value={requestForm.dayNumber}
                      onChange={(e) => setRequestForm({ ...requestForm, dayNumber: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe Your Changes *
                  </label>
                  <textarea
                    value={requestForm.changes}
                    onChange={(e) => setRequestForm({ ...requestForm, changes: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Please describe the changes you would like to make..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={requestForm.reason}
                    onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Why do you want to make these changes?"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRequest}
                  disabled={submitting}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
