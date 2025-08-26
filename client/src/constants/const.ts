import { CalendarViewType } from '@/types/calendar';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
export const SORT_FIELD_ENUM = ['NAME', 'CREATED_AT', 'UPDATED_AT'] as const;
export const SORT_DIRECTION_ENUM = ['ASC', 'DESC'] as const;
export const USER_ROLE_ENUM = ['ADMIN', 'USER'] as const;
export const USER_SEARCH_ROLE_ENUM = ['ALL', 'ADMIN', 'USER'] as const;

export const WEEKDAY_LABELS = [
  { full: 'Monday', short: 'Mon', mini: 'M', weekday: 0 },
  { full: 'Tuesday', short: 'Tue', mini: 'T', weekday: 1 },
  { full: 'Wednesday', short: 'Wed', mini: 'W', weekday: 2 },
  { full: 'Thursday', short: 'Thu', mini: 'T', weekday: 3 },
  { full: 'Friday', short: 'Fri', mini: 'F', weekday: 4 },
  { full: 'Saturday', short: 'Sat', mini: 'S', weekday: 5 },
  { full: 'Sunday', short: 'Sun', mini: 'S', weekday: 6 },
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
