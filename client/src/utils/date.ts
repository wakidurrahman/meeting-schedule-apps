// date.ts
import { formatInTimeZone, zonedTimeToUtc } from 'date-fns-tz';

export const JST_TZ = 'Asia/Tokyo' as const;

export type DateInput = string | number | Date;

function normalizeToDate(input: DateInput): Date {
  if (input instanceof Date) return input;
  if (typeof input === 'number') return new Date(input);
  if (typeof input === 'string' && /^\d+$/.test(input)) {
    const n = Number(input);
    const ms = input.length === 10 ? n * 1000 : n; // seconds vs ms
    return new Date(ms);
  }
  return new Date(input);
}

function assertValid(d: Date, ctx: string) {
  if (isNaN(d.getTime())) throw new Error(`Invalid Date in ${ctx}`);
}

/**
 * Build a Date from Y/M/D (and optional time) as a **JST wall clock time**,
 * then convert to the correct UTC instant.
 * Replaces: new Date(year, month, day, hour, minute, second, ms)
 */
export function fromPartsJST(parts: {
  year: number;
  month: number; // 0-11 like JS Date
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  ms?: number;
}): Date {
  const { year, month, day = 1, hour = 0, minute = 0, second = 0, ms = 0 } = parts;

  // Build an ISO string (no TZ) that represents JST wall time.
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  const iso = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}.${pad(ms, 3)}`;

  const utc = zonedTimeToUtc(iso, JST_TZ);
  assertValid(utc, 'fromPartsJST');
  return utc;
}

/** Clone any DateInput safely. Replaces: new Date(date) and new Date(firstDayOfGrid) */
export function cloneDate(input: DateInput): Date {
  const d = normalizeToDate(input);
  assertValid(d, 'cloneDate(normalize)');
  return new Date(d.getTime());
}

/** Now (instant). Safe to use, but for "today" logic prefer todayStartJST(). Replaces: new Date() */
export function now(): Date {
  const d = new Date();
  assertValid(d, 'now');
  return d;
}

/** Today at 00:00 **JST** as a UTC instant. Great for “same-day” comparisons in JST. */
export function todayStartJST(): Date {
  const ymd = formatInTimeZone(now(), JST_TZ, 'yyyy-MM-dd'); // get JST calendar date
  const start = zonedTimeToUtc(`${ymd}T00:00:00`, JST_TZ); // convert that wall time to UTC
  assertValid(start, 'todayStartJST');
  return start;
}
/** Today at 00:00 **JST** as a UTC instant. Great for “same-day” comparisons in JST. */
export function cloneDateJST(input: DateInput): Date {
  const ymd = formatInTimeZone(input, JST_TZ, 'yyyy-MM-dd'); // get JST calendar date
  const start = zonedTimeToUtc(`${ymd}T00:00:00`, JST_TZ); // convert that wall time to UTC
  assertValid(start, 'cloneDateJST');
  return start;
}

/** Start of given date’s day in JST (00:00 JST) */
export function startOfDayJST(date: DateInput): Date {
  const ymd = formatInTimeZone(normalizeToDate(date), JST_TZ, 'yyyy-MM-dd');
  const start = zonedTimeToUtc(`${ymd}T00:00:00`, JST_TZ);
  assertValid(start, 'startOfDayJST');
  return start;
}

/** End of given date’s day in JST (23:59:59.999 JST) */
export function endOfDayJST(date: DateInput): Date {
  const ymd = formatInTimeZone(normalizeToDate(date), JST_TZ, 'yyyy-MM-dd');
  const end = zonedTimeToUtc(`${ymd}T23:59:59.999`, JST_TZ);
  assertValid(end, 'endOfDayJST');
  return end;
}

/** Same-day check in JST calendar space. */
export function isSameDayJST(a: DateInput, b: DateInput): boolean {
  return (
    formatInTimeZone(normalizeToDate(a), JST_TZ, 'yyyy-MM-dd') ===
    formatInTimeZone(normalizeToDate(b), JST_TZ, 'yyyy-MM-dd')
  );
}

/** Format a date/time in JST using a date-fns pattern. */
export function formatJST(date: DateInput, pattern: string = 'yyyy-MM-dd HH:mm'): string {
  const d = normalizeToDate(date);
  assertValid(d, 'formatJST');
  return formatInTimeZone(d, JST_TZ, pattern);
}

/** Format a date range in JST. */
export function formatJSTRange(
  start: DateInput,
  end: DateInput,
  pattern = 'yyyy-MM-dd HH:mm',
): string {
  const s = normalizeToDate(start);
  const e = normalizeToDate(end);
  assertValid(s, 'formatJSTRange(start)');
  assertValid(e, 'formatJSTRange(end)');
  return `${formatInTimeZone(s, JST_TZ, pattern)} - ${formatInTimeZone(e, JST_TZ, pattern)}`;
}

/** Convenience: date-only (JST). */
export function formatJSTDate(date: DateInput): string {
  const d = normalizeToDate(date);
  assertValid(d, 'formatJSTDate');
  return formatInTimeZone(d, JST_TZ, 'yyyy-MM-dd');
}

/** Convenience: time-only (JST). */
export function formatJSTTime(date: DateInput): string {
  const d = normalizeToDate(date);
  assertValid(d, 'formatJSTTime');
  return formatInTimeZone(d, JST_TZ, 'HH:mm');
}

/** Time slots for a given calendar **day in JST** (returns UTC instants). */
export function getTimeSlotsJST(
  date: DateInput,
  interval = 30,
  startHour = 8,
  endHour = 18,
): Date[] {
  const ymd = formatInTimeZone(normalizeToDate(date), JST_TZ, 'yyyy-MM-dd');
  let slot = zonedTimeToUtc(`${ymd}T${String(startHour).padStart(2, '0')}:00:00`, JST_TZ);
  const end = zonedTimeToUtc(`${ymd}T${String(endHour).padStart(2, '0')}:00:00`, JST_TZ);
  assertValid(slot, 'getTimeSlotsJST(start)');
  assertValid(end, 'getTimeSlotsJST(end)');

  const out: Date[] = [];
  while (slot < end) {
    out.push(new Date(slot.getTime()));
    slot = new Date(slot.getTime() + interval * 60_000);
  }
  return out;
}
