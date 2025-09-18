import { CalendarViewType } from '@/types/calendar';
import { now } from '@/utils/date';

// Use a function to get current date instead of a constant
// This ensures we always get the actual current date when called
export const getCurrentDate = (): Date => now();

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
export const SORT_FIELD_ENUM = ['NAME', 'CREATED_AT', 'UPDATED_AT'] as const;
export const SORT_DIRECTION_ENUM = ['ASC', 'DESC'] as const;
export const USER_ROLE_ENUM = ['ADMIN', 'USER'] as const;
export const USER_SEARCH_ROLE_ENUM = ['ALL', 'ADMIN', 'USER'] as const;

export const WEEKDAY_LABELS = [
  { full: 'Monday', short: 'Mon', extraShort: 'Mo', mini: 'M', weekday: 0 },
  { full: 'Tuesday', short: 'Tue', extraShort: 'Tu', mini: 'T', weekday: 1 },
  { full: 'Wednesday', short: 'Wed', extraShort: 'We', mini: 'W', weekday: 2 },
  { full: 'Thursday', short: 'Thu', extraShort: 'Th', mini: 'T', weekday: 3 },
  { full: 'Friday', short: 'Fri', extraShort: 'Fr', mini: 'F', weekday: 4 },
  { full: 'Saturday', short: 'Sat', extraShort: 'Sa', mini: 'S', weekday: 5 },
  { full: 'Sunday', short: 'Sun', extraShort: 'Su', mini: 'S', weekday: 6 },
];

export const CALENDAR_VIEW_LABELS: Record<
  CalendarViewType,
  { full: string; short: string; icon: string }
> = {
  day: { full: 'Day', short: 'D', icon: 'bi bi-calendar-day' },
  week: { full: 'Week', short: 'W', icon: 'bi bi-calendar-week' },
  month: { full: 'Month', short: 'M', icon: 'bi bi-calendar-month' },
  year: { full: 'Year', short: 'Y', icon: 'bi bi-calendar' },
};

export const MEETING_STATUS_VARIANTS = {
  upcoming: 'primary',
  ongoing: 'success',
  completed: 'secondary',
  cancelled: 'danger',
} as const;
