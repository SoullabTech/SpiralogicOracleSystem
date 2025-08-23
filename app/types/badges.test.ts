import { getConstellationName, getConstellationNameStrict } from './badges';

describe('Badge Constellation Helpers', () => {
  test('handles array input correctly', () => {
    const arrayInput = [{ name: 'Alpha' }, { name: 'Beta' }];
    expect(getConstellationName(arrayInput, 'FALLBACK')).toBe('Alpha');
  });

  test('handles object input correctly', () => {
    const objectInput = { name: 'Beta', code: 'BETA_001' };
    expect(getConstellationName(objectInput, 'FALLBACK')).toBe('Beta');
  });

  test('handles null input with fallback', () => {
    expect(getConstellationName(null, 'FALLBACK')).toBe('FALLBACK');
  });

  test('handles undefined input with fallback', () => {
    expect(getConstellationName(undefined, 'FALLBACK')).toBe('FALLBACK');
  });

  test('handles empty array with fallback', () => {
    expect(getConstellationName([], 'FALLBACK')).toBe('FALLBACK');
  });

  test('handles object without name property', () => {
    const objectInput = { code: 'GAMMA_001' };
    expect(getConstellationName(objectInput, 'FALLBACK')).toBe('FALLBACK');
  });

  test('strict version catches runtime errors', () => {
    // Test that strict version doesn't throw on unexpected input
    expect(getConstellationNameStrict(null)).toBe('—');
    expect(getConstellationNameStrict(undefined)).toBe('—');
    expect(getConstellationNameStrict([], 'CUSTOM')).toBe('CUSTOM');
  });
});