import { describe, it, expect } from 'vitest';

export function validateBookingData(booking: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!booking.tourId) errors.push('Tour is required');
  if (!booking.startDate) errors.push('Start date is required');
  if (!booking.endDate) errors.push('End date is required');
  if (!booking.numberOfPeople || booking.numberOfPeople < 1) {
    errors.push('Number of people must be at least 1');
  }
  if (booking.startDate && booking.endDate && new Date(booking.startDate) >= new Date(booking.endDate)) {
    errors.push('End date must be after start date');
  }
  return { isValid: errors.length === 0, errors };
}

describe('Booking', () => {
  it('handles booking validation', () => {
    const validBooking = {
      tourId: 1,
      startDate: '2024-01-01',
      endDate: '2024-01-06',
      numberOfPeople: 2
    };
    expect(validateBookingData(validBooking).isValid).toBe(true);
    
    const invalidBooking = {
      tourId: null,
      startDate: '2024-01-06',
      endDate: '2024-01-01',
      numberOfPeople: 0
    };
    expect(validateBookingData(invalidBooking).isValid).toBe(false);
  });
});
