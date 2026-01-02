import { describe, it, expect } from 'vitest';

export function validateCoordinates(latitude: number, longitude: number): boolean {
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
}

describe('Location', () => {
  it('validates GPS coordinates', () => {
    expect(validateCoordinates(9.0054, 38.7578)).toBe(true); // Addis Ababa
    expect(validateCoordinates(91, 0)).toBe(false); // Invalid latitude
    expect(validateCoordinates(0, 181)).toBe(false); // Invalid longitude
  });
});
