"use client"

import dynamic from 'next/dynamic'

interface FreeMapTrackerProps {
  bookingId: number
  userRole: 'customer' | 'tourguide' | 'driver'
  isJourneyActive?: boolean
  onStartJourney?: () => void
}

// Dynamically import the map component (client-side only)
const MapTrackerClient = dynamic(() => import('./MapTrackerClient'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

export default function FreeMapTracker({ 
  bookingId, 
  userRole, 
  isJourneyActive = false,
  onStartJourney 
}: FreeMapTrackerProps) {
  return (
    <MapTrackerClient
      bookingId={bookingId}
      userRole={userRole}
      isJourneyActive={isJourneyActive}
      onStartJourney={onStartJourney}
    />
  )
}
