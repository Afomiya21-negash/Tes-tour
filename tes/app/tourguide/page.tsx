"use client"

import { useState } from "react"
import { MapPin, Calendar, Users, Star, LogOut, User, Clock, Navigation } from "lucide-react"

type Tour = {
  id: number
  tourName: string
  customerName: string
  date: string
  time: string
  location: string
  status: "upcoming" | "in-progress" | "completed"
  customerPhone: string
  customerEmail: string
}

type CustomerItinerary = {
  id: number
  customerName: string
  tourName: string
  date: string
  destinations: string[]
  specialRequests: string
  numberOfPeople: number
}

type Review = {
  id: number
  customerName: string
  tourName: string
  rating: number
  comment: string
  date: string
}

export default function TourGuideDashboard() {
  const [activeTab, setActiveTab] = useState<"tours" | "itineraries" | "location" | "reviews">("tours")
  const [currentLocation, setCurrentLocation] = useState({
    lat: "9.0320",
    lng: "38.7469",
    address: "Addis Ababa, Ethiopia",
    lastUpdated: new Date().toLocaleTimeString(),
  })

  // Mock data
  const [tours] = useState<Tour[]>([
    {
      id: 1,
      tourName: "Historical Lalibela Tour",
      customerName: "yared negasi",
      date: "2024-10-15",
      time: "08:00 AM",
      location: "Lalibela",
      status: "upcoming",
      customerPhone: "+251-911-456789",
      customerEmail: "yaya@gmail.com",
    },
    {
      id: 2,
      tourName: "Simien Mountains Trek",
      customerName: "Saba Negusse",
      date: "2024-10-12",
      time: "06:00 AM",
      location: "Simien Mountains",
      status: "in-progress",
      customerPhone: "+251-911-567890",
      customerEmail: "sabi@gmail.com",
    },
    {
      id: 3,
      tourName: "Addis City Tour",
      customerName: "Belen Abebe ",
      date: "2024-10-10",
      time: "10:00 AM",
      location: "Addis Ababa",
      status: "completed",
      customerPhone: "+251-911-678901",
      customerEmail: "blu@gmail.com",
    },
  ])

  const [itineraries] = useState<CustomerItinerary[]>([
    {
      id: 1,
      customerName: "Afomiya Mesfin",
      tourName: "Historical Lalibela Tour",
      date: "2024-10-15",
      destinations: ["Rock-Hewn Churches", "Lalibela Museum", "Local Market"],
      specialRequests: "Vegetarian meals, early morning start",
      numberOfPeople: 2,
    },
    {
      id: 2,
      customerName: "Mariam Negusse",
      tourName: "Simien Mountains Trek",
      date: "2024-10-12",
      destinations: ["Sankaber Camp", "Geech Camp", "Imet Gogo Viewpoint"],
      specialRequests: "Need extra water bottles, interested in wildlife photography",
      numberOfPeople: 4,
    },
  ])

  const [reviews] = useState<Review[]>([
    {
      id: 1,
      customerName: "Nardos",
      tourName: "Addis City Tour",
      rating: 5,
      comment: "Excellent guide! Very knowledgeable about Ethiopian history and culture.",
      date: "2024-10-10",
    },
    {
      id: 2,
      customerName: "yosef Zenaw",
      tourName: "Axum Heritage Tour",
      rating: 5,
      comment: "Amazing experience! The guide made the ancient sites come alive with stories.",
      date: "2024-10-05",
    },
    {
      id: 3,
      customerName: "Josephine Zenaw",
      tourName: "Coffee Ceremony Experience",
      rating: 4,
      comment: "Very informative and friendly. Would recommend!",
      date: "2024-09-28",
    },
  ])

  const handleUpdateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude.toFixed(4),
            lng: position.coords.longitude.toFixed(4),
            address: "Location updated (using browser geolocation)",
            lastUpdated: new Date().toLocaleTimeString(),
          })
          alert("Location updated successfully!")
        },
        (error) => {
          alert("Unable to get location. Using default location.")
          setCurrentLocation({
            ...currentLocation,
            lastUpdated: new Date().toLocaleTimeString(),
          })
        },
      )
    } else {
      alert("Geolocation is not supported by this browser.")
    }
  }

  const getStatusColor = (status: Tour["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: Tour["status"]) => {
    switch (status) {
      case "upcoming":
        return "Upcoming"
      case "in-progress":
        return "In Progress"
      case "completed":
        return "Completed"
    }
  }

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Tour Guide Dashboard</h1>
                <p className="text-green-100 text-sm">Welcome back, Nina</p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                } finally {
                  window.location.href = '/'
                }
              }}
              className="flex items-center space-x-2 bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

     
    

      {/* Navigation */}
      <nav className="bg-white border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("tours")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "tours"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>My Tours</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("itineraries")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "itineraries"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Customer Itineraries</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("location")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "location"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Navigation className="w-5 h-5" />
                <span>Update Location</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "reviews"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>My Reviews</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tours Tab */}
        {activeTab === "tours" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Tours</h2>
            <div className="space-y-4">
              {tours.map((tour) => (
                <div
                  key={`tour-${tour.id}`}
                  className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{tour.tourName}</h3>
                      <p className="text-gray-600">Customer: {tour.customerName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(tour.status)}`}>
                      {getStatusText(tour.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span>
                        {tour.date} at {tour.time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>{tour.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📱</span>
                      <span>{tour.customerPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📧</span>
                      <span>{tour.customerEmail}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itineraries Tab */}
        {activeTab === "itineraries" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Itineraries</h2>
            <div className="space-y-4">
              {itineraries.map((itinerary) => (
                <div
                  key={`itinerary-${itinerary.id}`}
                  className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{itinerary.tourName}</h3>
                      <p className="text-gray-600">Customer: {itinerary.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Date: {itinerary.date}</p>
                      <p className="text-sm text-gray-600">Group Size: {itinerary.numberOfPeople} people</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Destinations:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {itinerary.destinations.map((dest, idx) => (
                          <li key={`dest-${itinerary.id}-${idx}`}>{dest}</li>
                        ))}
                      </ul>
                    </div>
                    {itinerary.specialRequests && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Special Requests:</h4>
                        <p className="text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                          {itinerary.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location Tab */}
      
        {/* Reviews Tab */}
        {activeTab === "reviews" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Reviews</h2>
              <div className="bg-green-100 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                  <span className="text-gray-600">average rating</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={`review-${review.id}`}
                  className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.customerName}</h3>
                      <p className="text-sm text-gray-600">{review.tourName}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 mb-1">
                        {[...Array(5)].map((_, starIdx) => (
                          <Star
                            key={`review-${review.id}-star-${starIdx}`}
                            className={`w-4 h-4 ${
                              starIdx < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">{review.date}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
