// src/utils/dateFormatter.test.js

import { formatDateWithAbbreviatedMonth } from './dateFormatter';

describe('formatDateWithAbbreviatedMonth', () => {
  test('formats date with abbreviated month names', () => {
    const date = new Date('2025-01-15T00:00:00.000Z');
    const formatted = formatDateWithAbbreviatedMonth(date);
    expect(formatted).toBe('Jan 15, 2025');
  });

  test('handles different dates correctly', () => {
    const date = new Date('2025-12-25T00:00:00.000Z');
    const formatted = formatDateWithAbbreviatedMonth(date);
    expect(formatted).toBe('Dec 25, 2025');
  });

  test('handles custom formats', () => {
    const date = new Date('2025-07-01T00:00:00.000Z');
    const formatted = formatDateWithAbbreviatedMonth(date, 'MMM, yyyy');
    expect(formatted).toBe('Jul, 2025');
  });
});