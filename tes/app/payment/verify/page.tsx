"use client"

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function PaymentVerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [countdown, setCountdown] = useState(5) // 5 second countdown

  useEffect(() => {
    const verifyPayment = async () => {
      // Get parameters - handle both normal and HTML-encoded URLs
      let tx_ref = searchParams.get('tx_ref')
      let booking_id = searchParams.get('booking_id')
      
      // If not found, try parsing from raw URL (in case of HTML encoding like &amp;)
      if (!tx_ref || !booking_id) {
        const urlParams = new URLSearchParams(window.location.search.replace(/&amp;/g, '&'))
        tx_ref = urlParams.get('tx_ref')
        booking_id = urlParams.get('booking_id')
      }

      if (!tx_ref || !booking_id) {
        console.error('Missing params:', { tx_ref, booking_id, url: window.location.href })
        setStatus('error')
        setMessage('Missing payment information')
        return
      }
      
      console.log('Verifying payment:', { tx_ref, booking_id })

      try {
        const response = await fetch(
          `/api/payments/verify?tx_ref=${tx_ref}&booking_id=${booking_id}`,
          { credentials: 'include' }
        )

        const data = await response.json()
        console.log('Verification response:', data)

        if (data.success) {
          setStatus('success')
          setMessage('Payment completed successfully!')
          setPaymentDetails(data.payment_details)
          
          // Start countdown timer
          let secondsLeft = 5
          const countdownInterval = setInterval(() => {
            secondsLeft--
            setCountdown(secondsLeft)
            if (secondsLeft <= 0) {
              clearInterval(countdownInterval)
              router.push('/dashboard')
            }
          }, 1000)
        } else {
          console.error('Verification failed:', data)
          setStatus('error')
          setMessage(data.message || data.error || 'Payment verification failed')
        }
      } catch (error: any) {
        console.error('Payment verification error:', error)
        setStatus('error')
        setMessage(error.message || 'An error occurred while verifying payment')
      }
    }

    verifyPayment()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="bg-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {paymentDetails && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{paymentDetails.currency} {paymentDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">{paymentDetails.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-medium text-xs">{paymentDetails.reference}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800 font-medium">
                💡 Take a screenshot of this confirmation for your records
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full font-bold text-lg">
                {countdown}
              </div>
              <p className="text-sm text-gray-500">seconds until redirect...</p>
            </div>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Go to Dashboard Now
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.back()}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
