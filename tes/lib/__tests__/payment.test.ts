import { describe, it, expect } from 'vitest';

export function validatePaymentData(payment: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!payment.amount || payment.amount <= 0) errors.push('Payment amount is required');
  if (!payment.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payment.email)) errors.push('Valid email is required');
  if (!payment.firstName || payment.firstName.trim().length < 2) errors.push('First name required');
  return { isValid: errors.length === 0, errors };
}

describe('Payment', () => {
  it('validates payment data', () => {
    const validPayment = {
      amount: 2500,
      email: 'test@example.com',
      firstName: 'John'
    };
    expect(validatePaymentData(validPayment).isValid).toBe(true);
    
    const invalidPayment = { amount: 0, email: 'invalid', firstName: 'J' };
    expect(validatePaymentData(invalidPayment).isValid).toBe(false);
  });
});
