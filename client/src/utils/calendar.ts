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

import {
  CalendarDay,
  CalendarGridType,
  CalendarTitleData,
  CalendarViewType,
  CalendarWeek,
  DayGridType,
  TimeSlot,
  TimeSlotHour,
  WeekGridDay,
  WeekGridType,
} from '@/types/calendar';
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
): CalendarGridType {
  // 1. Today's date in JST instance
  const today = now();

  // 2. Get the first day of the month and the first day of the grid
  const firstDayOfMonth = fromPartsJST({ year, month, day: 1 });
  const firstDayOfGrid = cloneDate(firstDayOfMonth);

  // 3. Start from the first Monday of the week containing the first day of the month
  const dayOfWeek = firstDayOfMonth.getDay();
  // Convert Sunday (0) to 7, so Monday becomes 0
  const mondayBasedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  firstDayOfGrid.setDate(firstDayOfGrid.getDate() - mondayBasedDayOfWeek);

  // 4. Generate weeks array
  const weeks: CalendarWeek[] = [];
  // 5. Start from the first day of the month
  const currentDate = cloneDate(firstDayOfGrid);
  // 6. Week number
  let weekNumber = 0;

  // 7. Generate 5 weeks (35 days) to ensure full month coverage
  while (weeks.length < 5) {
    // 8. Days in the week
    const days: CalendarDay[] = [];
    // 9. Generate 7 days for the week
    for (let i = 0; i < 7; i++) {
      // 10. Get meetings for the current date
      const dayMeetings = getMeetingsForDate(currentDate, meetings);

      // 11. Create a calendar day object
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
      // 12. Add the calendar day to the days array
      days.push(calendarDay);
      // 13. Increment the current date by 1 day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // 14. Add the days to the weeks array
    weeks.push({
      days,
      weekNumber: weekNumber++,
    });

    // Stop if we've covered the entire month and are into the next month
    if (currentDate.getMonth() !== month && weeks.length >= 4) {
      break;
    }
  }

  // 15. Return the calendar grid
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
 * @param firstDate - First date
 * @param secondDate - Second date
 * @returns True if dates are the same day
 */
export function isSameDay(firstDate: Date, secondDate: Date): boolean {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
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
  format: 'short' | 'long' | 'numeric' | 'header' = 'short', // 'short' is default
): string {
  switch (format) {
    case 'short':
      return formatJST(date, 'MMM d'); // e.g. Aug 25
    case 'long':
      return formatJST(date, 'EEEE, MMMM d, yyyy'); // e.g. Monday, August 25, 2025
    case 'numeric':
      return date.getDate().toString(); // e.g. 25
    case 'header':
      return formatJST(date, 'MMMM yyyy'); // e.g. August 2025
    default:
      return formatJSTDate(date); // e.g. 2025-08-25
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
  // Convert Sunday (0) to 7, so Monday becomes 0
  const mondayBasedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(date.getDate() - mondayBasedDayOfWeek);

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
 * Get the first and last day of a month
 * @param date - Reference date
 * @returns Object with first and last day of the month
 */
export function getMonthDateRange(date: Date): { firstDay: Date; lastDay: Date } {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = fromPartsJST({ year, month, day: 1 });

  // Get last day of the month by going to the first day of next month and subtracting 1 day
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  const firstDayOfNextMonth = fromPartsJST({ year: nextYear, month: nextMonth, day: 1 });
  const lastDay = new Date(firstDayOfNextMonth.getTime() - 24 * 60 * 60 * 1000); // Subtract 1 day

  return { firstDay, lastDay };
}

/**
 * Get formatted month date range string
 * @param date - Reference date
 * @returns Formatted date range (e.g., "Jan 1, 2025 - Jan 31, 2025")
 */
export function getMonthDateRangeString(date: Date): string {
  const { firstDay, lastDay } = getMonthDateRange(date);

  if (
    firstDay.getMonth() === lastDay.getMonth() &&
    firstDay.getFullYear() === lastDay.getFullYear()
  ) {
    return `${formatJST(firstDay, 'MMM d, yyyy')} - ${formatJST(lastDay, 'MMM d, yyyy')}`;
  } else {
    // Handle edge case where month spans across years
    return `${formatJST(firstDay, 'MMM d, yyyy')} - ${formatJST(lastDay, 'MMM d, yyyy')}`;
  }
}

/**
 * Generate time slots for a given date range
 * @param date - Base date for the time slots
 * @param startHour - Start hour (0-23)
 * @param endHour - End hour (1-24, where 24 means end of day)
 * @param interval - Interval in minutes
 * @returns Array of time slot hours
 */
export function generateTimeSlots(
  date: Date,
  startHour: number = 0,
  endHour: number = 24,
  interval: number = 60,
): TimeSlotHour[] {
  // Input validation
  if (!date || isNaN(date.getTime())) {
    throw new Error('generateTimeSlots: Invalid date provided');
  }

  const slots: TimeSlotHour[] = [];

  // Ensure safe hour ranges
  const safeEndHour = Math.min(Math.max(endHour, 0), 24);
  const safeStartHour = Math.min(Math.max(startHour, 0), 23);
  const safeInterval = Math.max(interval, 1); // Minimum 1 minute interval

  // If start >= end, return empty slots
  if (safeStartHour >= safeEndHour) {
    return slots;
  }

  for (let hour = safeStartHour; hour < safeEndHour; hour++) {
    // Create display time for this hour
    const displayTime = formatJST(
      fromPartsJST({
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        hour,
        minute: 0,
      }),
      'h:mm a',
    );

    const hourSlots: TimeSlot[] = [];

    // Generate slots within this hour
    for (let minute = 0; minute < 60; minute += safeInterval) {
      // Calculate start time
      const start = fromPartsJST({
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        hour,
        minute,
      });

      // Calculate end time with proper overflow handling
      let endHour = hour;
      let endMinute = minute + safeInterval;
      let endDay = date.getDate();
      let endMonth = date.getMonth();
      let endYear = date.getFullYear();

      // Handle minute overflow
      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute = endMinute % 60;
      }

      // Handle hour overflow (next day)
      if (endHour >= 24) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + Math.floor(endHour / 24));
        endDay = nextDay.getDate();
        endMonth = nextDay.getMonth();
        endYear = nextDay.getFullYear();
        endHour = endHour % 24;
      }

      const end = fromPartsJST({
        year: endYear,
        month: endMonth,
        day: endDay,
        hour: endHour,
        minute: endMinute,
      });

      hourSlots.push({
        start,
        end,
        isAvailable: true,
        meetings: [],
      });
    }

    // Only add slots if we have valid ones
    if (hourSlots.length > 0) {
      slots.push({
        hour,
        displayTime,
        slots: hourSlots,
      });
    }
  }

  return slots;
}

/**
 * Generate week grid for a given date
 * @param date - Reference date (will find the week containing this date)
 * @param meetings - Array of meetings to include
 * @param startHour - Start hour for time slots (default: 6)
 * @param endHour - End hour for time slots (default: 22)
 * @returns Week grid with days and time slots
 */
export function generateWeekGrid(
  date: Date,
  meetings: MeetingEvent[] = [],
  startHour: number = 1,
  endHour: number = 23,
): WeekGridType {
  // Input validation
  if (!date || isNaN(date.getTime())) {
    throw new Error('generateWeekGrid: Invalid date provided');
  }

  const today = now();
  const weekDates = getCurrentWeekDates(date);
  const timeSlots = generateTimeSlots(date, startHour, endHour, 60);

  const days: WeekGridDay[] = weekDates.map((weekDate) => {
    const dayMeetings = getMeetingsForDate(weekDate, meetings);

    return {
      date: cloneDate(weekDate),
      isToday: isSameDay(weekDate, today),
      isCurrentMonth: weekDate.getMonth() === date.getMonth(),
      dayNumber: weekDate.getDate(),
      dayName: formatJST(weekDate, 'EEE'), // "Mon", "Tue", etc.
      fullDayName: formatJST(weekDate, 'EEEE'), // "Monday", "Tuesday", etc.
      meetings: dayMeetings,
    };
  });

  return {
    days,
    timeSlots,
    currentWeek: weekDates[0],
    totalDays: 7,
  };
}

/**
 * Generate day grid for a given date
 * @param date - Target date
 * @param meetings - Array of meetings to include
 * @param startHour - Start hour for time slots (default: 6)
 * @param endHour - End hour for time slots (default: 22)
 * @returns Day grid with time slots
 */
export function generateDayGrid(
  date: Date,
  meetings: MeetingEvent[] = [],
  startHour: number = 6,
  endHour: number = 22,
): DayGridType {
  // Input validation
  if (!date || isNaN(date.getTime())) {
    throw new Error('generateDayGrid: Invalid date provided');
  }

  const today = now();
  const dayMeetings = getMeetingsForDate(date, meetings);
  const timeSlots = generateTimeSlots(date, startHour, endHour, 60);

  return {
    date: cloneDate(date),
    isToday: isSameDay(date, today),
    dayName: formatJST(date, 'EEE'), // "Mon", "Tue", etc.
    fullDayName: formatJST(date, 'EEEE'), // "Monday", "Tuesday", etc.
    timeSlots,
    meetings: dayMeetings,
  };
}

/**
 * Get calendar view title based on view type and date
 * @param date - Reference date. e.g. Mon Aug 25 2025 17:56:01 GMT+0900 (Japan Standard Time)
 * @param view - Calendar view type.  e.g. 'month', 'week', 'day', 'year'
 * @param selectedDate - Optional selected date for enhanced display. e.g. Mon Aug 25 2025 17:56:01 GMT+0900 (Japan Standard Time)
 * @returns Structured calendar title data for enhanced UI rendering
 */
export function getCalendarViewTitle(
  date: Date,
  view: CalendarViewType,
  selectedDate?: Date,
): CalendarTitleData {
  // 1. Today's date by JST timezone
  const today = now();
  // 2. Current selected date by JST timezone. If no selected date is provided, use today's date.
  const currentSelectedDate = selectedDate || today;

  // 3. Switch case for different view types
  switch (view) {
    case 'day': {
      const isToday = isSameDay(date, today);
      return {
        mainTitle: formatCalendarDate(date, 'long'),
        subtitle: isToday ? 'Today' : formatJST(date, 'EEEE'),
        metadata: {
          isToday,
          selectedDate: date,
          viewType: view,
        },
      };
    }

    case 'week': {
      const weekDates = getCurrentWeekDates(date);
      console.log('weekDates', weekDates);
      const firstDay = weekDates[0];
      const lastDay = weekDates[6];

      let weekTitle: string;
      if (firstDay.getMonth() === lastDay.getMonth()) {
        weekTitle = `${formatJST(firstDay, 'MMM d')} - ${lastDay.getDate()}, ${formatJST(firstDay, 'yyyy')}`;
      } else {
        weekTitle = `${formatJST(firstDay, 'MMM d')} - ${formatJST(lastDay, 'MMM d')}`;
      }

      return {
        mainTitle: weekTitle,
        subtitle: `Week of ${formatJST(firstDay, 'MMM d')}`,
        metadata: {
          selectedDate: date,
          viewType: view,
        },
      };
    }

    case 'month': {
      const isCurrentMonth =
        date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

      return {
        monthAbbr: formatJST(date, 'MMM'),
        dayNumber: currentSelectedDate.getDate().toString(),
        mainTitle: formatCalendarDate(date, 'header'),
        subtitle: getMonthDateRangeString(date),
        metadata: {
          isToday: isSameDay(currentSelectedDate, today),
          isCurrentMonth,
          selectedDate: currentSelectedDate,
          viewType: view,
        },
      };
    }

    case 'year': {
      const isCurrentYear = date.getFullYear() === today.getFullYear();

      return {
        mainTitle: formatJST(date, 'yyyy'),
        subtitle: isCurrentYear ? 'Current Year' : formatJST(date, 'yyyy'),
        metadata: {
          selectedDate: date,
          viewType: view,
        },
      };
    }

    default:
      return {
        mainTitle: formatCalendarDate(date, 'header'),
        metadata: {
          selectedDate: date,
          viewType: view,
        },
      };
  }
}

export const isMonthGrid = (
  grid: CalendarGridType | WeekGridType | DayGridType,
): grid is CalendarGridType => {
  return 'weeks' in grid;
};

export const isWeekGrid = (
  grid: CalendarGridType | WeekGridType | DayGridType,
): grid is WeekGridType => {
  return 'days' in grid && 'timeSlots' in grid && Array.isArray((grid as WeekGridType).days);
};

export const isDayGrid = (
  grid: CalendarGridType | WeekGridType | DayGridType,
): grid is DayGridType => {
  return 'date' in grid && 'timeSlots' in grid && !('days' in grid);
};

/**
 * Get date boundaries for any calendar view
 * @param date - Reference date
 * @param view - Calendar view type
 * @returns Object with start and end dates
 */

export function getViewDateBoundaries(
  date: Date,
  view: CalendarViewType,
): { start: Date; end: Date } {
  switch (view) {
    case 'month':
      return getMonthBoundaries(date.getFullYear(), date.getMonth());
    case 'week': {
      const weekDates = getCurrentWeekDates(date);
      return {
        start: fromPartsJST({
          year: weekDates[0].getFullYear(),
          month: weekDates[0].getMonth(),
          day: weekDates[0].getDate(),
          hour: 0,
          minute: 0,
          second: 0,
        }),
        end: fromPartsJST({
          year: weekDates[6].getFullYear(),
          month: weekDates[6].getMonth(),
          day: weekDates[6].getDate(),
          hour: 23,
          minute: 59,
          second: 59,
        }),
      };
    }
    case 'day': {
      return {
        start: fromPartsJST({
          year: date.getFullYear(),
          month: date.getMonth(),
          day: date.getDate(),
          hour: 0,
          minute: 0,
          second: 0,
        }),
        end: fromPartsJST({
          year: date.getFullYear(),
          month: date.getMonth(),
          day: date.getDate(),
          hour: 23,
          minute: 59,
          second: 59,
        }),
      };
    }
    case 'year': {
      return {
        start: fromPartsJST({ year: date.getFullYear(), month: 0, day: 1 }),
        end: fromPartsJST({
          year: date.getFullYear(),
          month: 11,
          day: 31,
          hour: 23,
          minute: 59,
          second: 59,
        }),
      };
    }
    default:
      return getMonthBoundaries(date.getFullYear(), date.getMonth());
  }
}

/**
 * Get optimized date range for any calendar view
 * Loads slightly more date to handle navigation without new queries.
 * @param date - Reference date
 * @param view - Calendar view type
 * @returns Object with start and end dates
 */

export function getOptimizedDateRange(
  date: Date,
  view: CalendarViewType,
): { start: Date; end: Date } {
  const baseRange = getViewDateBoundaries(date, view);

  switch (view) {
    case 'month': {
      // Load previous and next month for smooth navigation
      const prevMonth = cloneDate(baseRange.start);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      const nextMonth = cloneDate(baseRange.end);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      return {
        start: prevMonth,
        end: nextMonth,
      };
    }
    case 'week': {
      // Load previous and next week
      const prevWeek = cloneDate(baseRange.start);
      prevWeek.setDate(prevWeek.getDate() - 7);
      const nextWeek = cloneDate(baseRange.end);
      nextWeek.setDate(nextWeek.getDate() + 7);

      return { start: prevWeek, end: nextWeek };
    }
    case 'day': {
      // Load previous and next day
      const prevDay = cloneDate(baseRange.start);
      prevDay.setDate(prevDay.getDate() - 1);
      const nextDay = cloneDate(baseRange.end);
      nextDay.setDate(nextDay.getDate() + 1);

      return { start: prevDay, end: nextDay };
    }
    case 'year': {
      // Load previous and next year
      const prevYear = cloneDate(baseRange.start);
      prevYear.setFullYear(prevYear.getFullYear() - 1);
      const nextYear = cloneDate(baseRange.end);
      nextYear.setFullYear(nextYear.getFullYear() + 1);

      return { start: prevYear, end: nextYear };
    }
    default:
      return baseRange;
  }
}
