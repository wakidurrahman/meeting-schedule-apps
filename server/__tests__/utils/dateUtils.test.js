/**
 * Date Utils Tests
 * Tests for date utility functions used across the application
 * Tests date validation, formatting, and manipulation functions
 */

const { isValidDateRange } = require('../../utils/dateUtils');

describe('Date Utils', () => {
  describe('isValidDateRange', () => {
    test('should return true for valid date range with Date objects', () => {
      const startTime = new Date('2024-12-25T09:00:00Z');
      const endTime = new Date('2024-12-25T10:00:00Z');

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(true);
    });

    test('should return true for valid date range with ISO strings', () => {
      const startTime = '2024-12-25T09:00:00Z';
      const endTime = '2024-12-25T10:00:00Z';

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(true);
    });

    test('should return true for valid date range with timestamps', () => {
      const startTime = 1735117200000; // 2024-12-25T09:00:00Z
      const endTime = 1735120800000; // 2024-12-25T10:00:00Z

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(true);
    });

    test('should return false when start time equals end time', () => {
      const startTime = new Date('2024-12-25T09:00:00Z');
      const endTime = new Date('2024-12-25T09:00:00Z');

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(false);
    });

    test('should return false when start time is after end time', () => {
      const startTime = new Date('2024-12-25T10:00:00Z');
      const endTime = new Date('2024-12-25T09:00:00Z');

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(false);
    });

    test('should return false for invalid start date', () => {
      const startTime = 'invalid-date';
      const endTime = new Date('2024-12-25T10:00:00Z');

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(false);
    });

    test('should return false for invalid end date', () => {
      const startTime = new Date('2024-12-25T09:00:00Z');
      const endTime = 'invalid-date';

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(false);
    });

    test('should return false for both invalid dates', () => {
      const startTime = 'invalid-start';
      const endTime = 'invalid-end';

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(false);
    });

    test('should return false for null start date', () => {
      const startTime = null;
      const endTime = new Date('2024-12-25T10:00:00Z');

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(false);
    });

    test('should return false for null end date', () => {
      const startTime = new Date('2024-12-25T09:00:00Z');
      const endTime = null;

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(false);
    });

    test('should return false for undefined start date', () => {
      const startTime = undefined;
      const endTime = new Date('2024-12-25T10:00:00Z');

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(false);
    });

    test('should return false for undefined end date', () => {
      const startTime = new Date('2024-12-25T09:00:00Z');
      const endTime = undefined;

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(false);
    });

    test('should handle edge case with very close dates', () => {
      const startTime = new Date('2024-12-25T09:00:00.000Z');
      const endTime = new Date('2024-12-25T09:00:00.001Z'); // 1ms difference

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(true);
    });

    test('should handle dates spanning multiple days', () => {
      const startTime = new Date('2024-12-25T23:59:59Z');
      const endTime = new Date('2024-12-26T00:00:01Z');

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(true);
    });

    test('should handle dates spanning multiple months', () => {
      const startTime = new Date('2024-12-31T23:59:59Z');
      const endTime = new Date('2025-01-01T00:00:01Z');

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(true);
    });

    test('should handle dates spanning multiple years', () => {
      const startTime = new Date('2024-12-31T23:59:59Z');
      const endTime = new Date('2025-01-01T00:00:01Z');

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(true);
    });

    test('should handle timezone differences correctly', () => {
      // These represent the same moment in time but in different formats
      const startTime = '2024-12-25T09:00:00+00:00'; // UTC
      const endTime = '2024-12-25T10:00:00+01:00'; // UTC+1 (same as 09:00 UTC)

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(false); // They represent the same time, so start = end
    });

    test('should handle timezone differences with valid range', () => {
      const startTime = '2024-12-25T09:00:00+00:00'; // UTC
      const endTime = '2024-12-25T11:00:00+01:00'; // UTC+1 (same as 10:00 UTC)

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(true);
    });

    test('should handle empty strings', () => {
      const startTime = '';
      const endTime = '';

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(false);
    });

    test('should handle numeric zero values', () => {
      const startTime = 0; // Unix epoch
      const endTime = 0; // Unix epoch

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(false); // Same time
    });

    test('should handle negative timestamps', () => {
      const startTime = -86400000; // One day before epoch
      const endTime = 0; // Unix epoch

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(true);
    });

    test('should handle very large timestamps', () => {
      const startTime = 8640000000000000; // Near maximum Date value
      const endTime = 8640000000000001; // Just after maximum (invalid)

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(false); // Dates beyond max value are invalid
    });

    test('should handle Date constructor edge cases', () => {
      const startTime = new Date('2024-02-29T09:00:00Z'); // Valid leap year date
      const endTime = new Date('2024-02-29T10:00:00Z');

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(true);
    });

    test('should handle invalid leap year date', () => {
      const startTime = new Date('2023-02-29T09:00:00Z'); // Invalid - 2023 is not a leap year
      const endTime = new Date('2023-03-01T10:00:00Z');

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(false); // Invalid start date
    });

    test('should handle millisecond precision', () => {
      const startTime = new Date('2024-12-25T09:00:00.123Z');
      const endTime = new Date('2024-12-25T09:00:00.124Z');

      const result = isValidDateRange(startTime, endTime);

      expect(result).toBe(true);
    });

    test('should be consistent with multiple calls', () => {
      const startTime = new Date('2024-12-25T09:00:00Z');
      const endTime = new Date('2024-12-25T10:00:00Z');

      const result1 = isValidDateRange(startTime, endTime);
      const result2 = isValidDateRange(startTime, endTime);
      const result3 = isValidDateRange(startTime, endTime);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(result3).toBe(true);
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });
  });
});
