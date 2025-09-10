/**
 * Calendar Types
 *
 * Type definitions for:
 * - CalendarDay: A single day in the calendar
 * - CalendarWeek: A week in the calendar
 * - CalendarGridType: A grid of days in the calendar
 * - TimeSlot: A time slot in the calendar
 * - TimeSlotHour: A time slot hour in the calendar
 * - WeekGridDay: A day in the week grid
 * - WeekGridType: A week grid in the calendar
 * - DayGridType: A day grid in the calendar
 * - CalendarViewType: The type of view in the calendar
 * - CalendarTitleData: The data for the calendar title
 */

import type { MeetingEvent } from '@/types/meeting';

export interface CalendarDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  isPreviousMonth: boolean;
  isNextMonth: boolean;
  dayNumber: number;
  meetings: MeetingEvent[];
}
export interface CalendarWeek {
  days: CalendarDay[];
  weekNumber: number;
}

export interface CalendarGridType {
  weeks: CalendarWeek[];
  currentMonth: number;
  currentYear: number;
  totalDays: number;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  isAvailable: boolean;
  meetings: MeetingEvent[];
}

// Time-based grid types for week and day views
export interface TimeSlotHour {
  hour: number; // 0-23
  displayTime: string; // "8:00 AM"
  slots: TimeSlot[];
}

export interface WeekGridDay {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  dayNumber: number;
  dayName: string; // "Mon", "Tue", etc.
  fullDayName: string; // "Monday", "Tuesday", etc.
  meetings: MeetingEvent[];
}

export interface WeekGridType {
  days: WeekGridDay[];
  timeSlots: TimeSlotHour[];
  currentWeek: Date; // First day of the week
  totalDays: number;
}

export interface DayGridType {
  date: Date;
  isToday: boolean;
  dayName: string;
  fullDayName: string;
  timeSlots: TimeSlotHour[];
  meetings: MeetingEvent[];
}

export interface YearGridMonth {
  month: number; // 0-11
  year: number;
  monthName: string; // "January", "February", etc.
  monthAbbr: string; // "Jan", "Feb", etc.
  calendarGrid: CalendarGridType;
  meetingCount: number;
  firstDay: Date;
  lastDay: Date;
}

export interface YearGridType {
  year: number;
  months: YearGridMonth[];
  totalMeetings: number;
  currentMonth?: number; // Current month (0-11) for highlighting
}

export type CalendarViewType = 'day' | 'week' | 'month' | 'year';
export type CalendarViewDirection = 'next' | 'previous';

export interface CalendarTitleData {
  /** Primary month abbreviation (e.g., "JAN") - mainly for month view */
  monthAbbr?: string;
  /** Day number for current/selected date (e.g., "10") - mainly for month view */
  dayNumber?: string;
  /** Main title displayed prominently (e.g., "January 2025") */
  mainTitle: string;
  /** Secondary subtitle or date range (e.g., "Jan 1, 2025 - Jan 31, 2025") */
  subtitle?: string;
  /** Optional view-specific metadata */
  metadata?: {
    isToday?: boolean;
    isCurrentMonth?: boolean;
    selectedDate?: Date;
    viewType?: CalendarViewType;
  };
}
