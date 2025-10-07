"use client"

import { useState } from "react"
import { Star, UserPlus, BarChart3, Calendar, LogOut, Briefcase, Edit, X, Check } from "lucide-react"

type Booking = {
  id: number
  customerName: string
  tourName: string
  date: string
  time: string
  location: string
  numberOfPeople: number
  assignedTourGuide: string | null
  status: "pending" | "confirmed" | "in-progress" | "completed"
  specialRequests: string
}

type TourGuide = {
  id: number
  name: string
  email: string
  phone: string
  averageRating: number
  totalTours: number
  availability: "available" | "busy"
}

type Rating = {
  id: number
  employeeName: string
  employeeRole: "tourguide" | "driver"
  customerName: string
  rating: number
  comment: string
  date: string
}

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState<"bookings" | "assign" | "ratings">("bookings")
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // Edit form states
  const [editDate, setEditDate] = useState("")
  const [editTime, setEditTime] = useState("")
  const [editLocation, setEditLocation] = useState("")
  const [editNumberOfPeople, setEditNumberOfPeople] = useState(0)
  const [editSpecialRequests, setEditSpecialRequests] = useState("")

  // Mock data
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 1,
      customerName: "Afomiya Mesfin",
      tourName: "Historical Lalibela Tour",
      date: "2024-10-15",
      time: "08:00 AM",
      location: "Lalibela",
      numberOfPeople: 2,
      assignedTourGuide: "Yedidiya Birhanu",
      status: "confirmed",
      specialRequests: "Vegetarian meals, early morning start",
    },
    {
      id: 2,
      customerName: "Bele Abebe",
      tourName: "Simien Mountains Trek",
      date: "2024-10-20",
      time: "06:00 AM",
      location: "Simien Mountains",
      numberOfPeople: 4,
      assignedTourGuide: null,
      status: "pending",
      specialRequests: "Need extra water bottles",
    },
    {
      id: 3,
      customerName: "Arsema Teferi",
      tourName: "Addis City Tour",
      date: "2024-10-18",
      time: "10:00 AM",
      location: "Addis Ababa",
      numberOfPeople: 3,
      assignedTourGuide: "Saba Negusse",
      status: "confirmed",
      specialRequests: "Interested in museums",
    },
  ])

  const [tourGuides] = useState<TourGuide[]>([
    {
      id: 1,
      name: "Yedidiya Birhanu",
      email: "yesih@gmail.com",
      phone: "+251-911-234567",
      averageRating: 4.8,
      totalTours: 45,
      availability: "busy",
    },
    {
      id: 2,
      name: "Saba Negusse",
      email: "saba@gmail.com",
      phone: "+251-911-345678",
      averageRating: 4.9,
      totalTours: 38,
      availability: "available",
    },
    {
      id: 3,
      name: "Yared Negassi",
      email: "yaya@gmail.com",
      phone: "+251-911-456789",
      averageRating: 4.7,
      totalTours: 32,
      availability: "available",
    },
  ])

  const [ratings] = useState<Rating[]>([
    {
      id: 1,
      employeeName: "Yedidiya Birhanu",
      employeeRole: "tourguide",
      customerName: "Afomiya Mesfin",
      rating: 5,
      comment: "Excellent tour guide! Very knowledgeable and friendly.",
      date: "2024-03-10",
    },
    {
      id: 2,
      employeeName: "Mariam negusse",
      employeeRole: "driver",
      customerName: "Belen Abebe",
      rating: 4,
      comment: "Safe driver, arrived on time.",
      date: "2024-03-20",
    },
    {
      id: 3,
      employeeName: "Saba Negusse",
      employeeRole: "tourguide",
      customerName: "Arsema Teferi",
      rating: 5,
      comment: "Amazing experience! Highly recommend.",
      date: "2024-04-05",
    },
    {
      id: 4,
      employeeName: "Sebel bini",
      employeeRole: "driver",
      customerName: "Afomiya Mesfin",
      rating: 5,
      comment: "Very professional and courteous driver.",
      date: "2024-04-08",
    },
  ])

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking)
    setEditDate(booking.date)
    setEditTime(booking.time)
    setEditLocation(booking.location)
    setEditNumberOfPeople(booking.numberOfPeople)
    setEditSpecialRequests(booking.specialRequests)
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (!selectedBooking) return

    const updatedBookings = bookings.map((booking) =>
      booking.id === selectedBooking.id
        ? {
            ...booking,
            date: editDate,
            time: editTime,
            location: editLocation,
            numberOfPeople: editNumberOfPeople,
            specialRequests: editSpecialRequests,
          }
        : booking,
    )

    setBookings(updatedBookings)
    setShowEditModal(false)
    setSelectedBooking(null)
    alert("Booking updated successfully!")
  }

  const handleAssignTourGuide = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowAssignModal(true)
  }

  const handleConfirmAssignment = (tourGuideName: string) => {
    if (!selectedBooking) return

    const updatedBookings = bookings.map((booking) =>
      booking.id === selectedBooking.id
        ? {
            ...booking,
            assignedTourGuide: tourGuideName,
            status: "confirmed" as const,
          }
        : booking,
    )

    setBookings(updatedBookings)
    setShowAssignModal(false)
    setSelectedBooking(null)
    alert(`Tour guide ${tourGuideName} assigned successfully!`)
  }

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return "Pending"
      case "confirmed":
        return "Confirmed"
      case "in-progress":
        return "In Progress"
      case "completed":
        return "Completed"
    }
  }

  const tourguideRatings = ratings.filter((r) => r.employeeRole === "tourguide")
  const driverRatings = ratings.filter((r) => r.employeeRole === "driver")

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Briefcase className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Employee Dashboard</h1>
                <p className="text-green-100 text-sm">Manage bookings and assignments</p>
              </div>
            </div>
            <button className="flex items-center space-x-2 bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
     

      {/* Navigation */}
      <nav className="bg-white border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("bookings")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "bookings"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Manage Bookings</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("assign")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "assign"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Assign Tour Guides</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("ratings")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "ratings"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>View Ratings</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Manage Bookings Tab */}
        {activeTab === "bookings" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Trip Bookings</h2>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={`booking-${booking.id}`}
                  className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{booking.tourName}</h3>
                      <p className="text-gray-600">Customer: {booking.customerName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span>
                        {booking.date} at {booking.time}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>📍</span>
                      <span>{booking.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>👥</span>
                      <span>{booking.numberOfPeople} people</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>🎯</span>
                      <span>Tour Guide: {booking.assignedTourGuide || "Not assigned"}</span>
                    </div>
                  </div>
                  {booking.specialRequests && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Special Requests:</p>
                      <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                        {booking.specialRequests}
                      </p>
                    </div>
                  )}
                  {/* <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditBooking(booking)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Details</span>
                    </button>
                    {!booking.assignedTourGuide && (
                      <button
                        onClick={() => handleAssignTourGuide(booking)}
                        className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Assign Guide</span>
                      </button>
                    )}
                  </div> */}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assign Tour Guides Tab */}
        {activeTab === "assign" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Assign Tour Guides</h2>

            {/* Available Tour Guides */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-green-600 mb-4">Available Tour Guides</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tourGuides.map((guide) => (
                  <div
                    key={`guide-${guide.id}`}
                    className="bg-white border-2 border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-semibold text-lg">{guide.name.charAt(0)}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{guide.name}</h4>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${
                            guide.availability === "available"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {guide.availability === "available" ? "Available" : "Busy"}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>📧 {guide.email}</p>
                      <p>📱 {guide.phone}</p>
                      <p>🎯 {guide.totalTours} tours completed</p>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900">{guide.averageRating.toFixed(1)}</span>
                        <span className="text-gray-500">rating</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Assignments */}
            <div>
              <h3 className="text-xl font-semibold text-green-600 mb-4">Bookings Pending Assignment</h3>
              <div className="space-y-4">
                {bookings
                  .filter((b) => !b.assignedTourGuide)
                  .map((booking) => (
                    <div
                      key={`pending-${booking.id}`}
                      className="bg-white border-2 border-yellow-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{booking.tourName}</h4>
                          <p className="text-gray-600">Customer: {booking.customerName}</p>
                          <p className="text-sm text-gray-600 mt-2">
                            {booking.date} at {booking.time} • {booking.location}
                          </p>
                        </div>
                        <button
                          onClick={() => handleAssignTourGuide(booking)}
                          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Assign Guide</span>
                        </button>
                      </div>
                    </div>
                  ))}
                {bookings.filter((b) => !b.assignedTourGuide).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Check className="w-12 h-12 mx-auto mb-2 text-green-600" />
                    <p>All bookings have been assigned tour guides!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === "ratings" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Employee Ratings</h2>

            <div className="space-y-6">
              {/* Tour Guides Ratings */}
              <div>
                <h3 className="text-xl font-semibold text-green-600 mb-4">Tour Guides</h3>
                <div className="bg-white border-2 border-green-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-green-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Tour Guide
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Comment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-green-100">
                      {tourguideRatings.map((rating) => (
                        <tr key={`tg-rating-${rating.id}`} className="hover:bg-green-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {rating.employeeName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rating.customerName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, starIdx) => (
                                <Star
                                  key={`tg-${rating.id}-star-${starIdx}`}
                                  className={`w-4 h-4 ${
                                    starIdx < rating.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-200"
                                  }`}
                                />
                              ))}
                              <span className="ml-2 font-semibold">{rating.rating}/5</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{rating.comment}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rating.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Drivers Ratings */}
              <div>
                <h3 className="text-xl font-semibold text-green-600 mb-4">Drivers</h3>
                <div className="bg-white border-2 border-green-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-green-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Driver
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Comment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-green-100">
                      {driverRatings.map((rating) => (
                        <tr key={`dr-rating-${rating.id}`} className="hover:bg-green-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {rating.employeeName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rating.customerName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, starIdx) => (
                                <Star
                                  key={`dr-${rating.id}-star-${starIdx}`}
                                  className={`w-4 h-4 ${
                                    starIdx < rating.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-200"
                                  }`}
                                />
                              ))}
                              <span className="ml-2 font-semibold">{rating.rating}/5</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{rating.comment}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{rating.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Booking Modal */}
      {showEditModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Edit Booking Details</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="text"
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="08:00 AM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of People</label>
                <input
                  type="number"
                  value={editNumberOfPeople}
                  onChange={(e) => setEditNumberOfPeople(Number.parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests</label>
                <textarea
                  value={editSpecialRequests}
                  onChange={(e) => setEditSpecialRequests(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Tour Guide Modal */}
      {showAssignModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">Assign Tour Guide</h3>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Select a tour guide for <strong>{selectedBooking.tourName}</strong>
              </p>
              <div className="space-y-3">
                {tourGuides
                  .filter((guide) => guide.availability === "available")
                  .map((guide) => (
                    <button
                      key={`assign-guide-${guide.id}`}
                      onClick={() => handleConfirmAssignment(guide.name)}
                      className="w-full p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{guide.name}</p>
                          <p className="text-sm text-gray-600">{guide.email}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-gray-900">{guide.averageRating}</span>
                          </div>
                          <p className="text-xs text-gray-600">{guide.totalTours} tours</p>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAssignModal(false)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
