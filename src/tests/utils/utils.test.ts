import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  isValidEmail,
  truncateText,
  formatNumber
} from '../../lib/utils';

describe('Utility Functions', () => {
  describe('cn', () => {
    it('combines class names correctly', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
      expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz');
    });
  });

  describe('formatDate', () => {
    it('formats date correctly', () => {
      // Create a fixed date to avoid timezone issues
      const date = new Date(2024, 2, 15); // Month is 0-based, so 2 = March
      const formatted = formatDate(date);
      expect(formatted).toBe('March 15, 2024');
    });
  });

  describe('isValidEmail', () => {
    it('validates email addresses correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@domain')).toBe(false);
    });
  });

  describe('truncateText', () => {
    it('truncates text correctly', () => {
      expect(truncateText('Hello World', 5)).toBe('He...');
      expect(truncateText('Short', 10)).toBe('Short');
    });
  });

  describe('formatNumber', () => {
    it('formats numbers correctly', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });
  });
});