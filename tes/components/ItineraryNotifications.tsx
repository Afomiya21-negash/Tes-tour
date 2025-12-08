"use client"

import { useState, useEffect } from 'react'
import { Bell, Check, Eye, X, Calendar, User } from 'lucide-react'

interface Notification {
  notification_id: number
  itinerary_id: number
  booking_id: number
  customer_id: number
  message: string
  is_read: boolean
  created_at: string
  first_name: string
  last_name: string
  email: string
  group_size: number
  custom_description: string
  itinerary_updated_at: string
}

interface ItineraryNotificationsProps {
  onViewItinerary?: (bookingId: number) => void
}

export default function ItineraryNotifications({ onViewItinerary }: ItineraryNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showPanel, setShowPanel] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  useEffect(() => {
    fetchNotifications()
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/itinerary/notifications', {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Fetched notifications:', data)
        setNotifications(data.notifications || [])
        setUnreadCount(data.unread_count || 0)
      } else {
        console.error('Failed to fetch notifications:', response.status)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch('/api/itinerary/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notification_id: notificationId })
      })

      if (response.ok) {
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.notification_id === notificationId ? { ...n, is_read: true } : n
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/itinerary/notifications', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleViewItinerary = (notification: Notification) => {
    markAsRead(notification.notification_id)
    setSelectedNotification(notification)
    if (onViewItinerary) {
      onViewItinerary(notification.booking_id)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      {/* Notification Bell Button */}
      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notification Panel */}
        {showPanel && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPanel(false)}
            />

            {/* Panel */}
            <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">Itinerary Updates</h3>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowPanel(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center p-8">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No itinerary updates</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map((notification) => (
                      <div
                        key={notification.notification_id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          !notification.is_read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => handleViewItinerary(notification)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${
                            !notification.is_read ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <User className={`w-4 h-4 ${
                              !notification.is_read ? 'text-blue-600' : 'text-gray-600'
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className={`text-sm font-semibold ${
                                  !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                                }`}>
                                  {notification.first_name} {notification.last_name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {notification.email}
                                </p>
                              </div>
                              {!notification.is_read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <span className={`flex items-center gap-1 font-medium ${
                                !notification.is_read ? 'text-blue-600' : 'text-gray-600'
                              }`}>
                                <User className="w-3 h-3" />
                                {notification.group_size} {notification.group_size === 1 ? 'person' : 'people'}
                              </span>
                              <span className="text-gray-500">{formatDate(notification.created_at)}</span>
                            </div>
                            
                            <p className="text-xs text-gray-600 mt-2 italic">
                              Updated their itinerary
                            </p>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewItinerary(notification)
                              }}
                              className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View Itinerary
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
