"use client"

import { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Navigation, MapPin, Users, Clock, Activity, XCircle } from 'lucide-react'

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
  const [hasSetInitialCenter, setHasSetInitialCenter] = useState(false)
  const [followMyLocation, setFollowMyLocation] = useState(true)
  const [myCurrentPosition, setMyCurrentPosition] = useState<[number, number] | null>(null)
  const [wasReplaced, setWasReplaced] = useState(false)
  const [replacementInfo, setReplacementInfo] = useState<any>(null)
  const [checkingAssignment, setCheckingAssignment] = useState(true)

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

  // Check if tour guide or driver has been replaced
  useEffect(() => {
    const checkAssignment = async () => {
      // Only check for tour guides and drivers
      if (userRole !== 'tourguide' && userRole !== 'driver') {
        setCheckingAssignment(false)
        return
      }

      try {
        const response = await fetch(
          `/api/bookings/check-assignment?booking_id=${bookingId}`,
          { credentials: 'include' }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.wasReplaced) {
            setWasReplaced(true)
            setReplacementInfo(data.replacementInfo)
          }
        } else if (response.status === 403) {
          // User is not assigned to this booking
          const data = await response.json()
          if (!data.isAssigned) {
            setWasReplaced(true)
            setReplacementInfo({
              role: userRole === 'tourguide' ? 'tour guide' : 'driver',
              message: 'You are not assigned to this booking.'
            })
          }
        }
      } catch (error) {
        console.error('Error checking assignment:', error)
      } finally {
        setCheckingAssignment(false)
      }
    }

    checkAssignment()
  }, [bookingId, userRole])

  // Fetch all participants' locations
  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch(`/api/location/${bookingId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        const participants = data.participants || []
        setParticipants(participants)
        
        // Find any participant with a location to center the map
        let centerLocation: LocationPoint | null = null
        
        // Priority: tour guide > driver > customer
        const tourGuide = participants.find((p: Participant) => p.user_type === 'tourguide')
        const driver = participants.find((p: Participant) => p.user_type === 'driver')
        const customer = participants.find((p: Participant) => p.user_type === 'customer')
        
        if (tourGuide?.latest_location) {
          centerLocation = {
            lat: parseFloat(tourGuide.latest_location.latitude.toString()),
            lng: parseFloat(tourGuide.latest_location.longitude.toString()),
            timestamp: tourGuide.latest_location.timestamp
          }
          
          // Build route path from tour guide's location history
          setRoutePath(prev => {
            if (prev.length === 0 || 
                prev[prev.length - 1].lat !== centerLocation!.lat || 
                prev[prev.length - 1].lng !== centerLocation!.lng) {
              return [...prev, centerLocation!]
            }
            return prev
          })
        } else if (driver?.latest_location) {
          centerLocation = {
            lat: parseFloat(driver.latest_location.latitude.toString()),
            lng: parseFloat(driver.latest_location.longitude.toString()),
            timestamp: driver.latest_location.timestamp
          }
        } else if (customer?.latest_location) {
          centerLocation = {
            lat: parseFloat(customer.latest_location.latitude.toString()),
            lng: parseFloat(customer.latest_location.longitude.toString()),
            timestamp: customer.latest_location.timestamp
          }
        }
        
        // Update map center ONLY if:
        // 1. Not actively tracking own location
        // 2. Not following own location
        // 3. Don't have own current position
        if (centerLocation && !isTracking && !myCurrentPosition) {
          setMapCenter([centerLocation.lat, centerLocation.lng])
          setHasSetInitialCenter(true)
          console.log('Map centered at other participant:', centerLocation)
        } else if (centerLocation && !isTracking && myCurrentPosition) {
          console.log('Ignoring fetched location - using own position')
        } else if (!centerLocation) {
          console.log('No participant locations available yet')
        }
      } else {
        console.error('Failed to fetch locations:', response.status, response.statusText)
      }
    } catch (err) {
      console.error('Error fetching locations:', err)
    }
  }, [bookingId, isTracking, myCurrentPosition])

  // Update current user's location
  const updateMyLocation = async (position: GeolocationPosition) => {
    try {
      const currentLat = position.coords.latitude
      const currentLng = position.coords.longitude
      
      console.log('Updating location:', {
        lat: currentLat,
        lng: currentLng,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed
      })
      
      // Store current position
      setMyCurrentPosition([currentLat, currentLng])
      
      // Always update map center to follow current location when tracking
      if (isTracking && followMyLocation) {
        setMapCenter([currentLat, currentLng])
        console.log('Map center updated to current position:', currentLat, currentLng)
      }
      
      const response = await fetch('/api/location/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          booking_id: bookingId,
          latitude: currentLat,
          longitude: currentLng,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          heading: position.coords.heading
        })
      })

      if (response.ok) {
        setHasSetInitialCenter(true)
        await fetchLocations()
      } else {
        console.error('Failed to update location:', response.status, response.statusText)
      }
    } catch (err) {
      console.error('Error updating location:', err)
    }
  }

  // Get user-friendly error message
  const getGeolocationErrorMessage = (error: GeolocationPositionError | null | undefined): string => {
    if (!error) {
      return 'Location error: Unable to get your location. Please ensure location services are enabled.'
    }
    
    switch (error.code) {
      case 1: // PERMISSION_DENIED
        return 'Location permission denied. Please enable location access in your browser settings.'
      case 2: // POSITION_UNAVAILABLE
        return 'Location information unavailable. Please check your device settings and ensure GPS is enabled.'
      case 3: // TIMEOUT
        return 'GPS is taking longer than usual. Trying with lower accuracy mode...'
      default:
        return `Location error: ${error.message || 'Unable to get your location. Please ensure location services are enabled.'}`
    }
  }

  // Retry with lower accuracy if high accuracy fails
  const retryWithLowerAccuracy = () => {
    console.log('Retrying location with lower accuracy (WiFi/Cell towers)...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        console.log('Position obtained with lower accuracy:', {
          lat: lat,
          lng: lng,
          accuracy: position.coords.accuracy
        })
        setCurrentLocation(position)
        setMyCurrentPosition([lat, lng])
        setMapCenter([lat, lng])
        setHasSetInitialCenter(true)
        updateMyLocation(position)
        setError('') // Clear timeout error
      },
      (error) => {
        // Safe error logging
        try {
          if (error && typeof error === 'object' && Object.keys(error).length > 0) {
            console.log('Lower accuracy failed:', {
              code: error?.code,
              message: error?.message
            })
          }
        } catch (logError) {
          // Ignore logging errors
        }
        
        // Handle error
        if (error?.code === 1) {
          setError('Location permission denied. Please enable location access in your browser settings.')
        } else if (error?.code === 2) {
          setError('Location information unavailable. Please check your device settings and ensure GPS is enabled.')
        } else if (error?.code === 3) {
          setError('Unable to get location. Please ensure location services are enabled and try moving outdoors.')
        } else {
          setError('Unable to access location. Please ensure location services are enabled and try again.')
        }
        setIsTracking(false)
      },
      {
        enableHighAccuracy: false,  // Use WiFi/cell towers (faster but less accurate)
        timeout: 10000,             // 10 second timeout
        maximumAge: 10000           // Accept cached position up to 10 seconds old
      }
    )
  }

  // Start tracking location
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    // Check if we're on HTTPS or localhost (required for geolocation)
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
      setError('Geolocation requires HTTPS connection. Please use https:// or localhost')
      return
    }

    setIsTracking(true)
    setError('')
    setJourneyStartTime(new Date())
    
    console.log('Starting location tracking...')

    // Check if geolocation is available
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by your browser. Please use a modern browser with location services.'
      console.error(errorMsg)
      setError(errorMsg)
      setIsTracking(false)
      return
    }

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        console.log('Initial position obtained:', {
          lat: lat,
          lng: lng,
          accuracy: position.coords.accuracy
        })
        setCurrentLocation(position)
        setMyCurrentPosition([lat, lng])
        setMapCenter([lat, lng])
        setHasSetInitialCenter(true)
        updateMyLocation(position)
      },
      (error) => {
        // Enhanced error logging for debugging - wrapped in try-catch
        try {
          if (error && typeof error === 'object' && Object.keys(error).length > 0) {
            console.log('Geolocation error details:', {
              code: error?.code,
              message: error?.message,
              type: typeof error
            })
          }
        } catch (logError) {
          // Ignore logging errors
        }
        
        // Handle the actual error
        // If timeout, retry with lower accuracy (WiFi/cell towers instead of GPS)
        if (error?.code === 3) {
          const errorMessage = getGeolocationErrorMessage(error)
          setError(errorMessage)
          retryWithLowerAccuracy()
        } else if (error?.code === 1) {
          // Permission denied
          setError('Location permission denied. Please enable location access in your browser settings.')
          setIsTracking(false)
        } else if (error?.code === 2) {
          // Position unavailable
          setError('Location information unavailable. Please check your device settings and ensure GPS is enabled.')
          setIsTracking(false)
        } else {
          // Unknown error or empty error object
          setError('Unable to access location. Please ensure location services are enabled and try again.')
          setIsTracking(false)
        }
      },
      {
        enableHighAccuracy: true,  // Force GPS instead of WiFi/cell towers
        timeout: 20000,            // Wait up to 20 seconds for GPS lock
        maximumAge: 0              // Never use cached position
      }
    )

    // Watch position changes - this continuously tracks movement
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log('Position update received:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed
        })
        setCurrentLocation(position)
        updateMyLocation(position)
      },
      (error) => {
        // Enhanced error logging for debugging - wrapped in try-catch
        try {
          if (error && typeof error === 'object' && Object.keys(error).length > 0) {
            console.log('Watch position error details:', {
              code: error?.code,
              message: error?.message,
              type: typeof error
            })
          }
        } catch (logError) {
          // Ignore logging errors
        }
        
        // Handle the actual error
        if (error?.code === 1) {
          setError('Location permission denied. Please enable location access in your browser settings.')
        } else if (error?.code === 2) {
          setError('Location information unavailable. Please check your device settings and ensure GPS is enabled.')
        } else if (error?.code === 3) {
          setError('Location tracking timeout. Please ensure GPS is enabled.')
        } else {
          setError('Unable to track location. Please ensure location services are enabled and try again.')
        }
      },
      {
        enableHighAccuracy: true,  // Force GPS instead of WiFi/cell towers
        timeout: 10000,            // Wait up to 10 seconds for position updates
        maximumAge: 5000           // Accept positions up to 5 seconds old for smoother tracking
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
    // Keep current position so map doesn't jump
    console.log('Tracking stopped - maintaining current position')
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

  // Show loading state while checking assignment
  if (checkingAssignment) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  // Show replacement notice if user was replaced
  if (wasReplaced && replacementInfo) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-900 mb-2">
              You Have Been Replaced
            </h3>
            <p className="text-red-800 mb-4">
              {replacementInfo.message}
            </p>
            {replacementInfo.requestedAt && (
              <p className="text-sm text-red-600">
                Change requested on: {new Date(replacementInfo.requestedAt).toLocaleString()}
              </p>
            )}
            <div className="mt-4 p-4 bg-white border border-red-200 rounded-md">
              <p className="text-sm text-gray-700">
                <strong>What this means:</strong> The customer has requested a change and a new {replacementInfo.role} has been assigned to this tour. 
                You no longer have access to track this tour's location.
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
          <div className="flex items-start gap-3">
            <div className="text-red-600 text-xl">⚠️</div>
            <div className="flex-1">
              <p className="text-red-800 font-semibold mb-1">Location Error</p>
              <p className="text-red-700 text-sm">{error}</p>
              {error.includes('permission') && (
                <div className="mt-2 text-xs text-red-600">
                  <p className="font-medium">To fix this:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Click the location icon 📍 in your browser's address bar</li>
                    <li>Select "Allow" for location access</li>
                    <li>Refresh the page and try again</li>
                  </ul>
                </div>
              )}
              {error.includes('HTTPS') && (
                <div className="mt-2 text-xs text-red-600">
                  <p className="font-medium">Geolocation requires a secure connection (HTTPS)</p>
                </div>
              )}
              {(error.includes('timed out') || error.includes('Trying with lower') || error.includes('Unable to get location') || error.includes('Unable to access location') || error.includes('Unable to track location')) && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs text-red-600">
                    <p className="font-medium mb-2">💡 Troubleshooting Steps:</p>
                    <div className="space-y-2">
                      <div className="bg-white p-2 rounded border border-red-100">
                        <p className="font-semibold text-red-700">1️⃣ Check Browser Permissions</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 ml-2">
                          <li>Click the 🔒 or location icon in browser address bar</li>
                          <li>Set location to "Allow" or "Always allow"</li>
                          <li>Reload the page</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-2 rounded border border-red-100">
                        <p className="font-semibold text-red-700">2️⃣ Check Device Settings</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 ml-2">
                          <li><strong>Windows:</strong> Settings → Privacy → Location → Turn ON</li>
                          <li><strong>Mac:</strong> System Preferences → Security → Privacy → Location Services → Turn ON</li>
                          <li><strong>Android:</strong> Settings → Location → Turn ON</li>
                          <li><strong>iOS:</strong> Settings → Privacy → Location Services → Turn ON</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-2 rounded border border-red-100">
                        <p className="font-semibold text-red-700">3️⃣ Improve GPS Signal</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 ml-2">
                          <li>Move outdoors with clear view of the sky</li>
                          <li>Wait 30-60 seconds for GPS satellite lock</li>
                          <li>Avoid tall buildings, dense foliage, or tunnels</li>
                          <li>Use mobile phone instead of laptop (better GPS)</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-2 rounded border border-red-100">
                        <p className="font-semibold text-red-700">4️⃣ Browser-Specific Tips</p>
                        <ul className="list-disc list-inside mt-1 space-y-1 ml-2">
                          <li><strong>Chrome:</strong> Settings → Privacy → Site Settings → Location → Allow</li>
                          <li><strong>Firefox:</strong> Settings → Privacy → Permissions → Location → Allow</li>
                          <li><strong>Safari:</strong> Preferences → Websites → Location → Allow</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  {!isTracking && (
                    <button
                      onClick={startTracking}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Retry Location Access
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location Info Display */}
      {isTracking && currentLocation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-blue-600 font-medium">Your Current Location</p>
              <p className="text-xs text-blue-700">
                Lat: {currentLocation.coords.latitude.toFixed(6)}, 
                Lng: {currentLocation.coords.longitude.toFixed(6)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-blue-600">
                  Accuracy: ±{currentLocation.coords.accuracy?.toFixed(0)}m
                  {currentLocation.coords.speed !== null && currentLocation.coords.speed !== undefined && 
                    ` • Speed: ${(currentLocation.coords.speed * 3.6).toFixed(1)} km/h`}
                </p>
                {currentLocation.coords.accuracy && currentLocation.coords.accuracy > 50 && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    Low accuracy
                  </span>
                )}
                {currentLocation.coords.accuracy && currentLocation.coords.accuracy <= 20 && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    High accuracy
                  </span>
                )}
              </div>
              {currentLocation.coords.accuracy && currentLocation.coords.accuracy > 100 && (
                <div className="text-xs text-yellow-700 mt-2 space-y-1">
                  <p className="font-semibold">💡 Tips to improve GPS accuracy:</p>
                  <ul className="list-disc list-inside space-y-0.5 pl-2">
                    <li>Move outdoors away from buildings</li>
                    <li>Ensure device GPS is enabled in settings</li>
                    <li>Wait 30-60 seconds for GPS to acquire satellites</li>
                    <li>Avoid using indoors or in urban canyons</li>
                  </ul>
                </div>
              )}
              {currentLocation.coords.accuracy && currentLocation.coords.accuracy > 50 && currentLocation.coords.accuracy <= 100 && (
                <p className="text-xs text-yellow-600 mt-1">
                  ⚠️ Moderate accuracy. For best results, move outdoors and wait a moment.
                </p>
              )}
            </div>
            <button
              onClick={() => setFollowMyLocation(!followMyLocation)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                followMyLocation 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {followMyLocation ? '📍 Following' : '📍 Follow Me'}
            </button>
          </div>
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
