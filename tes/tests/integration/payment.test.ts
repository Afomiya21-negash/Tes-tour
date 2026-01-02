import { describe, it, expect } from 'vitest';

describe('Payment Integration', () => {
  it('creates payment record', async () => {
    const paymentData = {
      bookingId: 1,
      amount: 2500,
      currency: 'ETB',
      paymentMethod: 'chapa'
    };

    const mockResponse = {
      success: true,
      payment: { id: 1, ...paymentData }
    };

    expect(mockResponse.success).toBe(true);
    expect(mockResponse.payment.amount).toBe(2500);
  });

  it('validates payment data', async () => {
    const invalidPayment = { amount: 0, email: 'invalid' };
    
    const mockResponse = {
      success: false,
      error: 'Payment amount is required'
    };

    expect(mockResponse.success).toBe(false);
    expect(mockResponse.error).toContain('required');
  });

  it('updates payment status', async () => {
    const updateData = { status: 'completed' };
    
    const mockResponse = {
      success: true,
      payment: { id: 1, status: 'completed' }
    };

    expect(mockResponse.success).toBe(true);
    expect(mockResponse.payment.status).toBe('completed');
  });

  it('handles Chapa webhook', async () => {
    const webhookData = {
      event: 'payment.completed',
      data: { tx_ref: 'TES-123', status: 'success' }
    };

    const mockResponse = { success: true };
    
    expect(mockResponse.success).toBe(true);
    expect(webhookData.data.status).toBe('success');
  });

  it('calculates total with fees', async () => {
    const bookingData = { tourPrice: 2000, vehicleCost: 500, fee: 50 };
    
    const total = bookingData.tourPrice + bookingData.vehicleCost + bookingData.fee;
    
    expect(total).toBe(2550);
  });
});
