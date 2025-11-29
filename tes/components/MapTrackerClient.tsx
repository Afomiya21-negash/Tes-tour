"use client"

import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Navigation, MapPin, Users, Clock, Activity } from 'lucide-react'

// Fix for default marker icons in Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface MapTrackerClientProps {
  bookingId: number
  userRole: 'customer' | 'tourguide' | 'driver'
  isJourneyActive?: boolean
  onStartJourney?: () => void
}

interface LocationPoint {
  lat: number
  lng: number
  timestamp: string
}

interface Participant {
  user_id: number
  user_type: string
  first_name: string
  last_name: string
  latest_location?: {
    latitude: number
    longitude: number
    accuracy?: number
    timestamp: string
  }
}

// Component to recenter map when location changes
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center, map.getZoom())
  }, [center, map])
  return null
}

export default function MapTrackerClient({ 
  bookingId, 
  userRole, 
  isJourneyActive = false,
  onStartJourney 
}: MapTrackerClientProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [routePath, setRoutePath] = useState<LocationPoint[]>([])
  const [currentLocation, setCurrentLocation] = useState<GeolocationPosition | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState('')
  const [journeyStartTime, setJourneyStartTime] = useState<Date | null>(null)
  const [distance, setDistance] = useState(0)
  const [mapCenter, setMapCenter] = useState<[number, number]>([9.0320, 38.7469])

  // Custom marker icons
  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${color}; width: 25px; height: 25px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
      iconSize: [25, 25],
      iconAnchor: [12, 12],
    })
  }

  const tourGuideIcon = createCustomIcon('#10B981') // Green
  const customerIcon = createCustomIcon('#3B82F6') // Blue
  const driverIcon = createCustomIcon('#EF4444') // Red

  // Fetch all participants' locations
  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch(`/api/location/${bookingId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setParticipants(data.participants || [])
        
        // Build route path from tour guide's location history
        const tourGuide = data.participants?.find((p: Participant) => p.user_type === 'tourguide')
        if (tourGuide?.latest_location) {
          const newPoint: LocationPoint = {
            lat: parseFloat(tourGuide.latest_location.latitude.toString()),
            lng: parseFloat(tourGuide.latest_location.longitude.toString()),
            timestamp: tourGuide.latest_location.timestamp
          }
          
          // Update map center to tour guide location
          setMapCenter([newPoint.lat, newPoint.lng])
          
          setRoutePath(prev => {
            // Only add if it's a new point (different from last)
            if (prev.length === 0 || 
                prev[prev.length - 1].lat !== newPoint.lat || 
                prev[prev.length - 1].lng !== newPoint.lng) {
              return [...prev, newPoint]
            }
            return prev
          })
        }
      }
    } catch (err) {
      console.error('Error fetching locations:', err)
    }
  }, [bookingId])

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
        await fetchLocations()
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
    setJourneyStartTime(new Date())

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation(position)
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
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation(position)
        updateMyLocation(position)
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
        maximumAge: 5000
      }
    )

    // Store watchId for cleanup
    return () => {
      navigator.geolocation.clearWatch(watchId)
    }
  }

  // Stop tracking
  const stopTracking = () => {
    setIsTracking(false)
    setJourneyStartTime(null)
  }

  // Handle journey start (for tour guide)
  const handleStartJourney = () => {
    startTracking()
    if (onStartJourney) {
      onStartJourney()
    }
  }

  // Auto-fetch locations periodically
  useEffect(() => {
    if (isJourneyActive || isTracking) {
      fetchLocations()
      const interval = setInterval(fetchLocations, 10000) // Every 10 seconds
      return () => clearInterval(interval)
    }
  }, [isJourneyActive, isTracking, fetchLocations])

  // Auto-start tracking for tour guide when journey is active
  useEffect(() => {
    if (userRole === 'tourguide' && isJourneyActive && !isTracking) {
      startTracking()
    }
  }, [userRole, isJourneyActive])

  // Calculate distance traveled
  useEffect(() => {
    if (routePath.length > 1) {
      let totalDistance = 0
      for (let i = 1; i < routePath.length; i++) {
        const prev = routePath[i - 1]
        const curr = routePath[i]
        totalDistance += calculateDistance(prev.lat, prev.lng, curr.lat, curr.lng)
      }
      setDistance(totalDistance)
    }
  }, [routePath])

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Get marker icon based on user type
  const getMarkerIcon = (userType: string) => {
    switch (userType) {
      case 'tourguide':
        return tourGuideIcon
      case 'driver':
        return driverIcon
      default:
        return customerIcon
    }
  }

  return (
    <div className="space-y-4">
      {/* Journey Controls - Tour Guide Only */}
      {userRole === 'tourguide' && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Journey Control</h3>
              <p className="text-sm text-gray-600">
                {isTracking ? 'Journey in progress...' : 'Start the journey to begin tracking'}
              </p>
            </div>
            <div className="flex gap-2">
              {!isTracking ? (
                <button
                  onClick={handleStartJourney}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Navigation className="w-5 h-5" />
                  Start Journey
                </button>
              ) : (
                <button
                  onClick={stopTracking}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Activity className="w-5 h-5" />
                  Stop Tracking
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Journey Stats */}
      {(isJourneyActive || isTracking) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Duration</p>
                <p className="text-xl font-bold text-blue-900">
                  {journeyStartTime ? 
                    Math.floor((new Date().getTime() - journeyStartTime.getTime()) / 60000) : 0} min
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Distance</p>
                <p className="text-xl font-bold text-green-900">
                  {distance.toFixed(2)} km
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Participants</p>
                <p className="text-xl font-bold text-purple-900">
                  {participants.filter(p => p.latest_location).length} active
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* OpenStreetMap */}
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
        <MapContainer
          center={mapCenter}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapRecenter center={mapCenter} />

          {/* Markers for all participants */}
          {participants.map((participant) => {
            if (!participant.latest_location) return null
            
            const position: [number, number] = [
              parseFloat(participant.latest_location.latitude.toString()),
              parseFloat(participant.latest_location.longitude.toString())
            ]
            
            return (
              <Marker
                key={participant.user_id}
                position={position}
                icon={getMarkerIcon(participant.user_type)}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold">{participant.first_name} {participant.last_name}</p>
                    <p className="text-sm text-gray-600 capitalize">{participant.user_type}</p>
                    {participant.latest_location.accuracy && (
                      <p className="text-xs text-gray-500">Accuracy: ±{participant.latest_location.accuracy.toFixed(0)}m</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* Route path (polyline) */}
          {routePath.length > 1 && (
            <Polyline
              positions={routePath.map(p => [p.lat, p.lng] as [number, number])}
              pathOptions={{
                color: '#10B981',
                weight: 4,
                opacity: 0.8
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Participants List */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Participants</h3>
        <div className="space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.user_id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  participant.latest_location ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">
                    {participant.first_name} {participant.last_name}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">{participant.user_type}</p>
                </div>
              </div>
              <div className="text-right">
                {participant.latest_location ? (
                  <p className="text-sm text-green-600 font-medium">Active</p>
                ) : (
                  <p className="text-sm text-gray-500">Offline</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
