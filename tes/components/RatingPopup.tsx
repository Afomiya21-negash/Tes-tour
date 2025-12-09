"use client"

import { useState } from 'react'
import { Star, X, Loader2 } from 'lucide-react'

interface RatingPopupProps {
  bookingId: number
  tourGuideName?: string
  driverName?: string
  hasTourGuide: boolean
  hasDriver: boolean
  onClose: () => void
  onSubmitSuccess: () => void
}

export default function RatingPopup({
  bookingId,
  tourGuideName,
  driverName,
  hasTourGuide,
  hasDriver,
  onClose,
  onSubmitSuccess
}: RatingPopupProps) {
  const [tourGuideRating, setTourGuideRating] = useState(0)
  const [driverRating, setDriverRating] = useState(0)
  const [tourGuideReview, setTourGuideReview] = useState('')
  const [driverReview, setDriverReview] = useState('')
  const [hoveredTourGuideRating, setHoveredTourGuideRating] = useState(0)
  const [hoveredDriverRating, setHoveredDriverRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    // Validate at least one rating
    if ((hasTourGuide && tourGuideRating === 0) && (hasDriver && driverRating === 0)) {
      setError('Please rate at least one service')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/ratings/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          booking_id: bookingId,
          rating_tourguide: hasTourGuide ? tourGuideRating : undefined,
          rating_driver: hasDriver ? driverRating : undefined,
          review_tourguide: tourGuideReview || undefined,
          review_driver: driverReview || undefined
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        onSubmitSuccess()
      } else {
        setError(data.error || 'Failed to submit rating')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (
    rating: number,
    hoveredRating: number,
    onRate: (value: number) => void,
    onHover: (value: number) => void
  ) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onRate(value)}
            onMouseEnter={() => onHover(value)}
            onMouseLeave={() => onHover(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                value <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-2">Rate Your Experience</h2>
              <p className="text-emerald-100 text-sm">
                Your feedback helps us improve our services
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Tour Guide Rating */}
          {hasTourGuide && (
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Rate Your Tour Guide
                {tourGuideName && (
                  <span className="text-emerald-600 ml-2">({tourGuideName})</span>
                )}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                {renderStars(
                  tourGuideRating,
                  hoveredTourGuideRating,
                  setTourGuideRating,
                  setHoveredTourGuideRating
                )}
                {tourGuideRating > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {tourGuideRating === 5 && '⭐ Excellent!'}
                    {tourGuideRating === 4 && '👍 Very Good'}
                    {tourGuideRating === 3 && '😊 Good'}
                    {tourGuideRating === 2 && '😐 Fair'}
                    {tourGuideRating === 1 && '😞 Needs Improvement'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review (Optional)
                </label>
                <textarea
                  value={tourGuideReview}
                  onChange={(e) => setTourGuideReview(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Share your experience with the tour guide..."
                />
              </div>
            </div>
          )}

          {/* Driver Rating */}
          {hasDriver && (
            <div className={hasTourGuide ? '' : 'border-b border-gray-200 pb-6'}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Rate Your Driver
                {driverName && (
                  <span className="text-emerald-600 ml-2">({driverName})</span>
                )}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                {renderStars(
                  driverRating,
                  hoveredDriverRating,
                  setDriverRating,
                  setHoveredDriverRating
                )}
                {driverRating > 0 && (
                  <p className="text-sm text-gray-600 mt-1">
                    {driverRating === 5 && '⭐ Excellent!'}
                    {driverRating === 4 && '👍 Very Good'}
                    {driverRating === 3 && '😊 Good'}
                    {driverRating === 2 && '😐 Fair'}
                    {driverRating === 1 && '😞 Needs Improvement'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review (Optional)
                </label>
                <textarea
                  value={driverReview}
                  onChange={(e) => setDriverReview(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Share your experience with the driver..."
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              Skip for Now
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || (hasTourGuide && tourGuideRating === 0 && hasDriver && driverRating === 0)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Rating'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
