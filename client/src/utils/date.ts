import { formatInTimeZone } from 'date-fns-tz';

const JST_TZ = 'Asia/Tokyo';

export type DateInput = string | number | Date;

function normalizeToDate(input: DateInput): Date {
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);
  // Handle numeric epoch strings
  if (typeof input === 'string' && /^\d+$/.test(input)) {
    const value = Number(input);
    // 13 digits = milliseconds, 10 digits = seconds
    const milliseconds = input.length === 10 ? value * 1000 : value;
    return new Date(milliseconds);
  }
  return new Date(input);
}

/**
 * Format a date/time in Japan Standard Time using a date-fns format pattern.
 */
export function formatJST(
  date: DateInput,
  pattern: string = 'yyyy-MM-dd HH:mm'
): string {
  const d = normalizeToDate(date);
  return formatInTimeZone(d, JST_TZ, pattern);
}

/**
 * Format a date range in Japan Standard Time.
 */
export function formatJSTRange(
  start: DateInput,
  end: DateInput,
  pattern: string = 'yyyy-MM-dd HH:mm'
): string {
  const startDate = formatInTimeZone(normalizeToDate(start), JST_TZ, pattern);
  const endDate = formatInTimeZone(normalizeToDate(end), JST_TZ, pattern);
  return `${startDate} - ${endDate}`;
}

/**
 * Convenience: format date only (JST)
 */
export function formatJSTDate(date: DateInput): string {
  return formatInTimeZone(date, JST_TZ, 'yyyy-MM-dd');
}

/**
 * Convenience: format time only (JST)
 */
export function formatJSTTime(date: DateInput): string {
  return formatInTimeZone(date, JST_TZ, 'HH:mm');
}
