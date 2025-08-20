import { CalendarViewType } from '@/types/calendar';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
export const SORT_FIELD_ENUM = ['NAME', 'CREATED_AT', 'UPDATED_AT'] as const;
export const SORT_DIRECTION_ENUM = ['ASC', 'DESC'] as const;
export const USER_ROLE_ENUM = ['ADMIN', 'USER'] as const;
export const USER_SEARCH_ROLE_ENUM = ['ALL', 'ADMIN', 'USER'] as const;

export const WEEKDAY_LABELS = [
  { full: 'Monday', short: 'Mon', mini: 'M' },
  { full: 'Tuesday', short: 'Tue', mini: 'T' },
  { full: 'Wednesday', short: 'Wed', mini: 'W' },
  { full: 'Thursday', short: 'Thu', mini: 'T' },
  { full: 'Friday', short: 'Fri', mini: 'F' },
  { full: 'Saturday', short: 'Sat', mini: 'S' },
  { full: 'Sunday', short: 'Sun', mini: 'S' },
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
