/**
 * Calendar utility functions for meeting scheduler
 *
 * Functions for:
 * - Generating calendar grids
 * - Date navigation and formatting
 * - Meeting placement in calendar
 * - Time slot calculations
 */

import { cloneDate, formatJST, formatJSTDate, fromPartsJST, now } from './date';

import { CalendarDay, CalendarGrid, CalendarViewType, CalendarWeek } from '@/types/calendar';
import { MeetingEvent } from '@/types/meeting';

/**
 * Generate calendar grid for a given month and year
 * @param year - Target year
 * @param month - Target month (0-11)
 * @param meetings - Array of meetings to include
 * @returns Calendar grid with days and meetings
 */
export function generateCalendarGrid(
  year: number,
  month: number,
  meetings: MeetingEvent[] = [],
): CalendarGrid {
  const today = now();
  const firstDayOfMonth = fromPartsJST({ year, month, day: 1 });
  const firstDayOfGrid = cloneDate(firstDayOfMonth);

  // Start from the first Sunday of the week containing the first day of the month
  const dayOfWeek = firstDayOfMonth.getDay();
  firstDayOfGrid.setDate(firstDayOfGrid.getDate() - dayOfWeek);

  const weeks: CalendarWeek[] = [];
  const currentDate = cloneDate(firstDayOfGrid);
  let weekNumber = 0;

  // Generate 6 weeks (42 days) to ensure full month coverage
  while (weeks.length < 6) {
    const days: CalendarDay[] = [];

    for (let i = 0; i < 7; i++) {
      const dayMeetings = getMeetingsForDate(currentDate, meetings);

      const calendarDay: CalendarDay = {
        date: cloneDate(currentDate),
        isToday: isSameDay(currentDate, today),
        isCurrentMonth: currentDate.getMonth() === month,
        isPreviousMonth:
          currentDate.getMonth() < month || (month === 0 && currentDate.getMonth() === 11),
        isNextMonth:
          currentDate.getMonth() > month || (month === 11 && currentDate.getMonth() === 0),
        dayNumber: currentDate.getDate(),
        meetings: dayMeetings,
      };

      days.push(calendarDay);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    weeks.push({
      days,
      weekNumber: weekNumber++,
    });

    // Stop if we've covered the entire month and are into the next month
    if (currentDate.getMonth() !== month && weeks.length >= 4) {
      break;
    }
  }

  return {
    weeks,
    currentMonth: month,
    currentYear: year,
    totalDays: weeks.length * 7,
  };
}

/**
 * Get meetings for a specific date
 * @param date - Target date
 * @param meetings - Array of all meetings
 * @returns Meetings occurring on the given date
 */
export function getMeetingsForDate(date: Date, meetings: MeetingEvent[]): MeetingEvent[] {
  return meetings.filter((meeting) => {
    const meetingDate = cloneDate(meeting.startTime);
    return isSameDay(date, meetingDate);
  });
}

/**
 * Check if two dates are the same day
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Format date for calendar display using JST timezone
 * @param date - Date to format
 * @param format - Format type
 * @returns Formatted date string in JST
 */
export function formatCalendarDate(
  date: Date,
  format: 'short' | 'long' | 'numeric' | 'header' = 'short',
): string {
  switch (format) {
    case 'short':
      return formatJST(date, 'MMM d');
    case 'long':
      return formatJST(date, 'EEEE, MMMM d, yyyy');
    case 'numeric':
      return date.getDate().toString();
    case 'header':
      return formatJST(date, 'MMMM yyyy');
    default:
      return formatJSTDate(date);
  }
}

/**
 * Get the current week dates
 * @param date - Reference date (default: today)
 * @returns Array of 7 dates for the current week
 */
export function getCurrentWeekDates(date: Date = now()): Date[] {
  const startOfWeek = cloneDate(date);
  const dayOfWeek = date.getDay();
  startOfWeek.setDate(date.getDate() - dayOfWeek);

  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const weekDate = cloneDate(startOfWeek);
    weekDate.setDate(startOfWeek.getDate() + i);
    weekDates.push(weekDate);
  }

  return weekDates;
}

/**
 * Navigate to next/previous month
 * @param currentDate - Current date
 * @param direction - 'next' or 'previous'
 * @returns New date for navigation
 */
export function navigateMonth(currentDate: Date, direction: 'next' | 'previous'): Date {
  const newDate = cloneDate(currentDate);
  if (direction === 'next') {
    newDate.setMonth(newDate.getMonth() + 1);
  } else {
    newDate.setMonth(newDate.getMonth() - 1);
  }
  return newDate;
}

/**
 * Navigate to next/previous week
 * @param currentDate - Current date
 * @param direction - 'next' or 'previous'
 * @returns New date for navigation
 */
export function navigateWeek(currentDate: Date, direction: 'next' | 'previous'): Date {
  const newDate = cloneDate(currentDate);
  if (direction === 'next') {
    newDate.setDate(newDate.getDate() + 7);
  } else {
    newDate.setDate(newDate.getDate() - 7);
  }
  return newDate;
}

/**
 * Navigate to next/previous day
 * @param currentDate - Current date
 * @param direction - 'next' or 'previous'
 * @returns New date for navigation
 */
export function navigateDay(currentDate: Date, direction: 'next' | 'previous'): Date {
  const newDate = cloneDate(currentDate);
  if (direction === 'next') {
    newDate.setDate(newDate.getDate() + 1);
  } else {
    newDate.setDate(newDate.getDate() - 1);
  }
  return newDate;
}

/**
 * Get time slots for a given date
 * @param date - Target date
 * @param interval - Time interval in minutes (default: 30)
 * @param startHour - Start hour (default: 8)
 * @param endHour - End hour (default: 18)
 * @returns Array of time slots
 */
export function getTimeSlots(
  date: Date,
  interval: number = 30,
  startHour: number = 8,
  endHour: number = 18,
): Date[] {
  const slots: Date[] = [];
  const startTime = cloneDate(date);
  startTime.setHours(startHour, 0, 0, 0);

  const endTime = cloneDate(date);
  endTime.setHours(endHour, 0, 0, 0);

  const currentSlot = cloneDate(startTime);

  while (currentSlot < endTime) {
    slots.push(cloneDate(currentSlot));
    currentSlot.setMinutes(currentSlot.getMinutes() + interval);
  }

  return slots;
}

/**
 * Check if a date is a weekend
 * @param date - Date to check
 * @returns True if weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
}

/**
 * Get month boundaries
 * @param year - Target year
 * @param month - Target month (0-11)
 * @returns Start and end dates of the month
 */
export function getMonthBoundaries(
  year: number,
  month: number,
): {
  start: Date;
  end: Date;
} {
  return {
    start: fromPartsJST({ year, month, day: 1 }),
    end: new Date(year, month + 1, 0, 23, 59, 59, 999),
  };
}

/**
 * Get today's date at midnight
 * @returns Today's date with time set to 00:00:00
 */
export function getToday(): Date {
  const today = cloneDate(now());
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns True if date is before today
 */
export function isPastDate(date: Date): boolean {
  return date < getToday();
}

/**
 * Get calendar view title based on view type and date
 * @param date - Reference date
 * @param view - Calendar view type
 * @returns Formatted title for the view in JST
 */
export function getCalendarViewTitle(date: Date, view: CalendarViewType): string {
  switch (view) {
    case 'day':
      return formatCalendarDate(date, 'long');
    case 'week': {
      const weekDates = getCurrentWeekDates(date);
      const firstDay = weekDates[0];
      const lastDay = weekDates[6];

      if (firstDay.getMonth() === lastDay.getMonth()) {
        return `${formatJST(firstDay, 'MMM d')} - ${lastDay.getDate()}, ${formatJST(firstDay, 'yyyy')}`;
      } else {
        return `${formatJST(firstDay, 'MMM d')} - ${formatJST(lastDay, 'MMM d')}`;
      }
    }
    case 'month':
      return formatCalendarDate(date, 'header');
    case 'year':
      return formatJST(date, 'yyyy');
    default:
      return formatCalendarDate(date, 'header');
  }
}
