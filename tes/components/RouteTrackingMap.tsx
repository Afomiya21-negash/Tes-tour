'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Clock, TrendingUp } from 'lucide-react'

interface RouteTrackingMapProps {
  bookingId: number
  tourName: string
  destination: string
  destinationCoords?: { latitude: number; longitude: number }
}

interface LocationData {
  latitude: number
  longitude: number
  accuracy?: number
  heading?: number
  speed?: number
  timestamp?: string
}

export default function RouteTrackingMap({ 
  bookingId, 
  tourName, 
  destination,
  destinationCoords: providedDestCoords 
}: RouteTrackingMapProps) {
  const mapRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const routeLineRef = useRef<any>(null)
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null)
  const [tourStarted, setTourStarted] = useState(false)
  const [error, setError] = useState<string>('')
  const [mapLoaded, setMapLoaded] = useState(false)
  const [estimatedTime, setEstimatedTime] = useState<string>('')
  const [distance, setDistance] = useState<string>('')
  const [destinationCoords, setDestinationCoords] = useState<{ latitude: number; longitude: number } | null>(providedDestCoords || null)

  // Fetch destination coordinates if not provided
  useEffect(() => {
    if (!providedDestCoords) {
      const fetchDestination = async () => {
        try {
          const response = await fetch(`/api/tour/destination/${bookingId}`)
          const data = await response.json()
          if (data.success && data.destination.coordinates) {
            setDestinationCoords(data.destination.coordinates)
          }
        } catch (err) {
          console.error('Error fetching destination:', err)
        }
      }
      fetchDestination()
    }
  }, [bookingId, providedDestCoords])

  // Initialize map
  useEffect(() => {
    let L: any
    
    const initMap = async () => {
      try {
        L = (await import('leaflet')).default
        await import('leaflet/dist/leaflet.css')

        // Fix marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        })

        if (!mapInstanceRef.current && mapRef.current) {
          const map = L.map(mapRef.current).setView([9.0320, 38.7469], 13)

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(map)

          mapInstanceRef.current = map
          setMapLoaded(true)

          // Add destination marker if coordinates provided
          if (destinationCoords) {
            const destIcon = L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })

            L.marker([destinationCoords.latitude, destinationCoords.longitude], { icon: destIcon })
              .addTo(map)
              .bindPopup(`<b>Destination:</b> ${destination}`)
          }
        }
      } catch (err) {
        console.error('Error initializing map:', err)
        setError('Failed to load map')
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [destination, destinationCoords])

  // Fetch tour guide location
  useEffect(() => {
    if (!mapLoaded) return

    const fetchLocation = async () => {
      try {
        const response = await fetch(`/api/location/track/${bookingId}`)
        const data = await response.json()

        if (data.success) {
          // Check if tour has started based on booking status
          if (data.status === 'in-progress' || data.status === 'completed') {
            setTourStarted(true)
          }

          // Update location if available
          if (data.tourGuide?.location) {
            const location = data.tourGuide.location
            setCurrentLocation(location)

            // Update marker
            updateMarker(location)

            // Draw route if destination exists
            if (destinationCoords) {
              drawRoute(location, destinationCoords)
              calculateDistance(location, destinationCoords)
            }
          }
        }
      } catch (err) {
        console.error('Error fetching location:', err)
      }
    }

    fetchLocation()
    const interval = setInterval(fetchLocation, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [bookingId, mapLoaded, destinationCoords])

  const updateMarker = async (location: LocationData) => {
    const L = (await import('leaflet')).default
    
    if (!mapInstanceRef.current) return

    // Remove old marker
    if (markerRef.current) {
      markerRef.current.remove()
    }

    // Create car/guide icon
    const guideIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })

    // Add new marker
    markerRef.current = L.marker([location.latitude, location.longitude], { icon: guideIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup(`
        <b>Tour Guide Location</b><br/>
        Speed: ${location.speed ? (location.speed * 3.6).toFixed(1) : '0'} km/h<br/>
        Updated: ${location.timestamp ? new Date(location.timestamp).toLocaleTimeString() : 'Just now'}
      `)

    // Center map on current location
    mapInstanceRef.current.setView([location.latitude, location.longitude], 14)
  }

  const drawRoute = async (from: LocationData, to: { latitude: number; longitude: number }) => {
    const L = (await import('leaflet')).default
    
    if (!mapInstanceRef.current) return

    // Remove old route
    if (routeLineRef.current) {
      routeLineRef.current.remove()
    }

    // Draw simple straight line (in production, use routing API)
    const latlngs: [number, number][] = [
      [from.latitude, from.longitude],
      [to.latitude, to.longitude]
    ]

    routeLineRef.current = L.polyline(latlngs, {
      color: '#3b82f6',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10'
    }).addTo(mapInstanceRef.current)

    // Fit map to show both points
    mapInstanceRef.current.fitBounds(routeLineRef.current.getBounds(), { padding: [50, 50] })
  }

  const calculateDistance = (from: LocationData, to: { latitude: number; longitude: number }) => {
    // Haversine formula
    const R = 6371 // Earth's radius in km
    const dLat = (to.latitude - from.latitude) * Math.PI / 180
    const dLon = (to.longitude - from.longitude) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(from.latitude * Math.PI / 180) * Math.cos(to.latitude * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const dist = R * c

    setDistance(dist.toFixed(1))

    // Estimate time (assuming average speed of 40 km/h)
    const avgSpeed = currentLocation?.speed ? currentLocation.speed * 3.6 : 40
    const timeHours = dist / avgSpeed
    const timeMinutes = Math.round(timeHours * 60)
    setEstimatedTime(timeMinutes.toString())
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Info */}
      <div className="bg-white border-b p-4">
        <h3 className="font-semibold text-lg">{tourName}</h3>
        <p className="text-sm text-gray-600 flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          Destination: {destination}
        </p>
        
        {tourStarted && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <div className="bg-blue-50 p-2 rounded">
              <div className="flex items-center gap-1 text-blue-600">
                <TrendingUp className="w-4 h-4" />
                <span className="font-semibold">Distance</span>
              </div>
              <p className="text-lg font-bold text-blue-700">{distance || '--'} km</p>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <div className="flex items-center gap-1 text-green-600">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">ETA</span>
              </div>
              <p className="text-lg font-bold text-green-700">{estimatedTime || '--'} min</p>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <div className="flex items-center gap-1 text-purple-600">
                <Navigation className="w-4 h-4" />
                <span className="font-semibold">Speed</span>
              </div>
              <p className="text-lg font-bold text-purple-700">
                {currentLocation?.speed ? (currentLocation.speed * 3.6).toFixed(0) : '0'} km/h
              </p>
            </div>
          </div>
        )}

        {!tourStarted && (
          <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
            <p className="font-semibold">⏳ Waiting for tour to start...</p>
            <p className="text-xs mt-1">Your tour guide will start the tour soon.</p>
          </div>
        )}
      </div>

      {/* Map */}
      <div ref={mapRef} className="flex-1 w-full" style={{ minHeight: '400px' }} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}

