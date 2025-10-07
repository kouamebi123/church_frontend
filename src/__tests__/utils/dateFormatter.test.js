/**
 * Tests pour le formateur de dates
 */
import { formatDate, formatDateShort, formatDateRelative } from '@utils/dateFormatter';

describe('Date Formatter', () => {
  const testDate = new Date('2024-01-15T14:30:00Z');
  const testDateString = '2024-01-15T14:30:00Z';

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const result = formatDate(testDateString);
      expect(result).toContain('janvier');
      expect(result).toContain('2024');
      expect(result).toContain('15');
    });

    it('should handle invalid date', () => {
      expect(formatDate('invalid-date')).toBe('');
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
      expect(formatDate('')).toBe('');
    });

    it('should handle Date object', () => {
      const result = formatDate(testDate);
      expect(result).toContain('janvier');
      expect(result).toContain('2024');
    });
  });

  describe('formatDateShort', () => {
    it('should format date in short format', () => {
      const result = formatDateShort(testDateString);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should handle invalid date', () => {
      expect(formatDateShort('invalid-date')).toBe('');
      expect(formatDateShort(null)).toBe('');
      expect(formatDateShort(undefined)).toBe('');
    });
  });

  describe('formatDateRelative', () => {
    it('should format recent date as relative', () => {
      const recentDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      const result = formatDateRelative(recentDate.toISOString());
      expect(result).toContain('Il y a 5 minutes');
    });

    it('should format very recent date', () => {
      const veryRecentDate = new Date(Date.now() - 30 * 1000); // 30 seconds ago
      const result = formatDateRelative(veryRecentDate.toISOString());
      expect(result).toBe('Il y a moins d\'une minute');
    });

    it('should format hours ago', () => {
      const hoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      const result = formatDateRelative(hoursAgo.toISOString());
      expect(result).toBe('Il y a 3 heures');
    });

    it('should format days ago', () => {
      const daysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
      const result = formatDateRelative(daysAgo.toISOString());
      expect(result).toBe('Il y a 3 jours');
    });

    it('should handle invalid date', () => {
      expect(formatDateRelative('invalid-date')).toBe('');
      expect(formatDateRelative(null)).toBe('');
      expect(formatDateRelative(undefined)).toBe('');
    });
  });
});