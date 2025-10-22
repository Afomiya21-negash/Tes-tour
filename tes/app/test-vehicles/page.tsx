"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface Vehicle {
  id: number
  make: string
  model: string
  capacity: number | null
  dailyRate: number | null
  imageUrl?: string | null
}

export default function TestVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        console.log('Vehicles data:', data)
        setVehicles(data)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to fetch vehicles')
      }
    } catch (e) {
      console.error('Error fetching vehicles:', e)
      setError('Error fetching vehicles')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading vehicles...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Vehicles</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                {vehicle.imageUrl ? (
                  <Image
                    src={vehicle.imageUrl}
                    alt={`${vehicle.make} ${vehicle.model}`}
                    width={300}
                    height={192}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image load error:', vehicle.imageUrl)
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500">Image not found</div>'
                    }}
                  />
                ) : (
                  <div className="text-gray-500">No image</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {vehicle.make} {vehicle.model}
                </h3>
                <p className="text-gray-600">
                  Capacity: {vehicle.capacity || 'Not specified'} passengers
                </p>
                <p className="text-emerald-600 font-medium">
                  ${vehicle.dailyRate || 0}/day
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Image URL: {vehicle.imageUrl || 'None'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {vehicles.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 text-xl">No vehicles found</p>
          </div>
        )}
      </div>
    </div>
  )
}
