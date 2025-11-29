"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Navigation, Users, Clock, AlertCircle, Loader2 } from "lucide-react"

interface Participant {
  user_id: number
  user_type: 'customer' | 'tourguide' | 'driver'
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  latest_location?: {
    latitude: number
    longitude: number
    accuracy?: number
    timestamp: Date
  }
}

interface GPSTrackerProps {
  bookingId: number
  userRole: 'customer' | 'tourguide' | 'driver'
  autoUpdate?: boolean
  updateInterval?: number // in milliseconds
}

export default function GPSTracker({ 
  bookingId, 
  userRole, 
  autoUpdate = true, 
  updateInterval = 30000 // 30 seconds default
}: GPSTrackerProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [locationEnabled, setLocationEnabled] = useState(false)
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const watchIdRef = useRef<number | null>(null)
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch all participants' locations
  const fetchLocations = async () => {
    try {
      const response = await fetch(`/api/location/${bookingId}`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setParticipants(data.participants || [])
        setError('')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch locations')
      }
    } catch (err) {
      console.error('Error fetching locations:', err)
      setError('Failed to fetch locations')
    } finally {
      setLoading(false)
    }
  }

  // Update current user's location
  const updateMyLocation = async (position: GeolocationPosition) => {
    try {
      const response = await fetch('/api/location/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          booking_id: bookingId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          heading: position.coords.heading
        })
      })

      if (response.ok) {
        setLastUpdate(new Date())
        setError('')
        // Refresh all locations after updating
        await fetchLocations()
      } else {
        const errorData = await response.json()
        console.error('Failed to update location:', errorData.error)
      }
    } catch (err) {
      console.error('Error updating location:', err)
    }
  }

  // Get user-friendly error message
  const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location permission denied. Please enable location access in your browser settings.'
      case error.POSITION_UNAVAILABLE:
        return 'Location information unavailable. Please check your device settings.'
      case error.TIMEOUT:
        return 'Location request timed out. Please try again.'
      default:
        return `Location error: ${error.message || 'Unknown error'}`
    }
  }

  // Start tracking location
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsTracking(true)
    setError('')

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition(position)
        setLocationEnabled(true)
        updateMyLocation(position)
      },
      (error) => {
        console.error('Geolocation error:', {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT
        })
        const errorMessage = getGeolocationErrorMessage(error)
        setError(errorMessage)
        setIsTracking(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )

    // Watch position changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition(position)
        setLocationEnabled(true)
      },
      (error) => {
        console.error('Watch position error:', {
          code: error.code,
          message: error.message
        })
        const errorMessage = getGeolocationErrorMessage(error)
        setError(errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )

    // Set up periodic updates
    if (autoUpdate) {
      updateIntervalRef.current = setInterval(() => {
        if (currentPosition) {
          updateMyLocation(currentPosition)
        }
      }, updateInterval)
    }
  }

  // Stop tracking location
  const stopTracking = () => {
    setIsTracking(false)
    
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current)
      updateIntervalRef.current = null
    }
  }

  // Manual location update
  const handleManualUpdate = () => {
    if (currentPosition) {
      updateMyLocation(currentPosition)
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition(position)
          updateMyLocation(position)
        },
        (error) => {
          setError(`Location error: ${error.message}`)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    }
  }

  // Initial load and periodic refresh of all locations
  useEffect(() => {
    fetchLocations()
    
    const refreshInterval = setInterval(() => {
      fetchLocations()
    }, 15000) // Refresh every 15 seconds

    return () => {
      clearInterval(refreshInterval)
    }
  }, [bookingId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking()
    }
  }, [])

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins === 1) return '1 minute ago'
    if (diffMins < 60) return `${diffMins} minutes ago`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return '1 hour ago'
    if (diffHours < 24) return `${diffHours} hours ago`
    
    return date.toLocaleString()
  }

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'customer': return 'Customer'
      case 'tourguide': return 'Tour Guide'
      case 'driver': return 'Driver'
      default: return type
    }
  }

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'bg-blue-100 text-blue-800'
      case 'tourguide': return 'bg-green-100 text-green-800'
      case 'driver': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const openInMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-2 text-gray-600">Loading GPS tracking...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tracking Control Panel */}
      <div className="bg-white border-2 border-green-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Navigation className="w-6 h-6 mr-2 text-green-600" />
          GPS Location Tracking
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3 mb-4">
          {!isTracking ? (
            <button
              onClick={startTracking}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Navigation className="w-5 h-5" />
              <span>Start Sharing Location</span>
            </button>
          ) : (
            <>
              <button
                onClick={stopTracking}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Navigation className="w-5 h-5" />
                <span>Stop Sharing</span>
              </button>
              <button
                onClick={handleManualUpdate}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <MapPin className="w-5 h-5" />
                <span>Update Now</span>
              </button>
            </>
          )}
        </div>

        {isTracking && locationEnabled && currentPosition && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-900 mb-2">Your Current Location:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-800">
              <div>
                <span className="font-medium">Latitude:</span> {currentPosition.coords.latitude.toFixed(6)}
              </div>
              <div>
                <span className="font-medium">Longitude:</span> {currentPosition.coords.longitude.toFixed(6)}
              </div>
              <div>
                <span className="font-medium">Accuracy:</span> ±{currentPosition.coords.accuracy.toFixed(0)}m
              </div>
              {lastUpdate && (
                <div>
                  <span className="font-medium">Last Updated:</span> {formatTimestamp(lastUpdate)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Participants List */}
      <div className="bg-white border-2 border-green-200 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Users className="w-6 h-6 mr-2 text-green-600" />
          Trip Participants ({participants.length})
        </h3>

        {participants.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No participants found</p>
        ) : (
          <div className="space-y-4">
            {participants.map((participant) => (
              <div
                key={participant.user_id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {participant.first_name} {participant.last_name}
                    </h4>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getUserTypeColor(participant.user_type)}`}>
                      {getUserTypeLabel(participant.user_type)}
                    </span>
                  </div>
                  {participant.latest_location && (
                    <button
                      onClick={() => openInMaps(
                        participant.latest_location!.latitude,
                        participant.latest_location!.longitude,
                        `${participant.first_name} ${participant.last_name}`
                      )}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>View on Map</span>
                    </button>
                  )}
                </div>

                {participant.latest_location ? (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-700">
                        <span className="font-medium">Lat:</span> {participant.latest_location.latitude.toFixed(6)}
                      </div>
                      <div className="text-gray-700">
                        <span className="font-medium">Lng:</span> {participant.latest_location.longitude.toFixed(6)}
                      </div>
                      {participant.latest_location.accuracy && (
                        <div className="text-gray-700">
                          <span className="font-medium">Accuracy:</span> ±{participant.latest_location.accuracy.toFixed(0)}m
                        </div>
                      )}
                      <div className="text-gray-700 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatTimestamp(participant.latest_location.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      Location not yet shared
                    </p>
                  </div>
                )}

                {participant.phone_number && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Phone:</span> {participant.phone_number}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
