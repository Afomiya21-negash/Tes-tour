import axios from 'axios'

const CHAPA_BASE_URL = 'https://api.chapa.co/v1'

export interface InitializePaymentParams {
  amount: number
  currency: string
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  tx_ref: string // Unique transaction reference (use booking_id)
  callback_url: string
  return_url: string
  customization?: {
    title?: string
    description?: string
  }
}

export interface InitializePaymentResponse {
  message: string
  status: string
  data: {
    checkout_url: string
  }
}

export interface VerifyPaymentResponse {
  message: string
  status: string
  data: {
    first_name: string
    last_name: string
    email: string
    currency: string
    amount: string
    charge: string
    mode: string
    method: string
    type: string
    status: string
    reference: string
    tx_ref: string
    customization: {
      title: string
      description: string
    }
    meta: null
    created_at: string
    updated_at: string
  }
}

/**
 * Initialize a payment with Chapa
 */
export async function initializePayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  try {
    const response = await axios.post(
      `${CHAPA_BASE_URL}/transaction/initialize`,
      params,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error('Chapa initialization error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Failed to initialize payment')
  }
}

/**
 * Verify a payment with Chapa
 */
export async function verifyPayment(tx_ref: string): Promise<VerifyPaymentResponse> {
  try {
    const response = await axios.get(
      `${CHAPA_BASE_URL}/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error('Chapa verification error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Failed to verify payment')
  }
}

/**
 * Generate a unique transaction reference
 */
export function generateTxRef(bookingId: number): string {
  const timestamp = Date.now()
  return `TES-TOUR-${bookingId}-${timestamp}`
}
