import { NextRequest, NextResponse } from 'next/server'
import { verifyJwt } from '@/lib/auth'
import { getPool } from '@/lib/db'
import { initializePayment, generateTxRef } from '@/lib/chapa'

// Format phone number for Chapa (Ethiopian format: 251XXXXXXXXX)
function formatPhoneForChapa(phone: string | null | undefined): string {
  if (!phone || phone.trim() === '') {
    return '251911000000' // Default test number
  }
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '')
  
  // If empty after cleaning, return default
  if (!cleaned) {
    return '251911000000'
  }
  
  // If starts with 0, remove it (Ethiopian local format)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }
  
  // If already has country code 251
  if (cleaned.startsWith('251')) {
    cleaned = cleaned.substring(3) // Remove 251 prefix to process the local number
  }
  
  // Ethiopian phone numbers should be 9 digits (after removing leading 0)
  // If less than 9 digits, pad with leading 9s to make it valid
  if (cleaned.length < 9) {
    console.warn(`Phone number too short (${cleaned.length} digits): ${cleaned}. Padding to 9 digits.`)
    cleaned = '9'.repeat(9 - cleaned.length) + cleaned
  }
  
  // If more than 9 digits, take only the first 9
  if (cleaned.length > 9) {
    cleaned = cleaned.substring(0, 9)
  }
  
  // Add country code 251
  const result = '251' + cleaned
  
  return result
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = req.cookies.get('auth_token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyJwt(token)
    if (!payload || payload.role !== 'customer') {
      return NextResponse.json({ error: 'Only customers can make payments' }, { status: 403 })
    }

    const { booking_id, payment_method } = await req.json()

    if (!booking_id) {
      return NextResponse.json({ error: 'booking_id is required' }, { status: 400 })
    }

    console.log('Payment initialization request:', { booking_id, payment_method })

    const pool = getPool()

    // Get booking details
    const [bookingRows] = await pool.query(
      `SELECT 
        b.booking_id,
        b.user_id as customer_id,
        b.total_price,
        b.status,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number
      FROM bookings b
      JOIN users u ON b.user_id = u.user_id
      WHERE b.booking_id = ? AND b.user_id = ?`,
      [booking_id, payload.user_id]
    ) as any

    if (!bookingRows || bookingRows.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    const booking = bookingRows[0]

    // Check if payment already exists
    const [existingPayment] = await pool.query(
      `SELECT payment_id, status, transaction_id 
       FROM payments 
       WHERE booking_id = ? AND status = 'completed'`,
      [booking_id]
    ) as any

    if (existingPayment && existingPayment.length > 0) {
      return NextResponse.json({ 
        error: 'Payment already completed for this booking',
        payment_id: existingPayment[0].payment_id
      }, { status: 400 })
    }

    // Generate unique transaction reference
    const tx_ref = generateTxRef(booking.booking_id)

    // Check if Chapa keys are configured
    const chapaConfigured = !!(process.env.CHAPA_SECRET_KEY && process.env.NEXT_PUBLIC_APP_URL)
    
    let checkout_url = ''
    
    if (chapaConfigured) {
      try {
        console.log('Initializing Chapa payment...')
        console.log('Chapa Secret Key exists:', !!process.env.CHAPA_SECRET_KEY)
        console.log('App URL:', process.env.NEXT_PUBLIC_APP_URL)
        console.log('Payment amount:', parseFloat(booking.total_price))
        console.log('Booking data:', {
          first_name: booking.first_name,
          last_name: booking.last_name,
          email: booking.email,
          phone_number: booking.phone_number,
          phone_type: typeof booking.phone_number
        })
        
        // Format phone number for Chapa
        const formattedPhone = formatPhoneForChapa(booking.phone_number)
        console.log('Original phone:', booking.phone_number)
        console.log('Formatted phone:', formattedPhone)
        console.log('Formatted phone length:', formattedPhone.length)
        
        // Initialize payment with Chapa
        const chapaResponse = await initializePayment({
          amount: parseFloat(booking.total_price),
          currency: 'ETB',
          email: booking.email,
          first_name: booking.first_name,
          last_name: booking.last_name,
          phone_number: formattedPhone,
          tx_ref: tx_ref,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/webhook`,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify?booking_id=${booking_id}&tx_ref=${tx_ref}`,
          customization: {
            title: 'Tes Tour Pay', // Max 16 characters
            description: `Booking ${booking_id}`, // Only letters, numbers, spaces, hyphens, underscores, dots
          },
        })
        checkout_url = chapaResponse.data.checkout_url
        console.log('Chapa payment initialized successfully')
      } catch (chapaError: any) {
        console.error('Chapa initialization failed:', chapaError.message)
        console.error('Full Chapa error:', chapaError)
        console.error('Error response:', chapaError.response?.data)
        throw new Error(`Chapa error: ${chapaError.message}`)
      }
    } else {
      console.warn('Chapa not configured - using test mode')
      // For testing without Chapa keys, redirect to verification page directly
      checkout_url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/verify?booking_id=${booking_id}&tx_ref=${tx_ref}&test_mode=true`
    }

    // Create pending payment record with selected bank as payment method
    const paymentMethodToSave = payment_method || 'chapa'
    console.log('Saving payment record:', { booking_id, amount: booking.total_price, payment_method: paymentMethodToSave, tx_ref })
    
    await pool.query(
      `INSERT INTO payments (booking_id, amount, payment_method, transaction_id, status, payment_date)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [booking_id, booking.total_price, paymentMethodToSave, tx_ref]
    )

    return NextResponse.json({
      success: true,
      checkout_url: checkout_url,
      tx_ref: tx_ref,
      message: 'Payment initialized successfully',
      test_mode: !chapaConfigured
    })

  } catch (error: any) {
    console.error('Payment initialization error:', error)
    return NextResponse.json({ 
      error: 'Failed to initialize payment', 
      details: error.message 
    }, { status: 500 })
  }
}
