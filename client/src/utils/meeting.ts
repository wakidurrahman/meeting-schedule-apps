/**
 * Meeting utility functions for conflict detection, validation, and formatting
 *
 * Functions for:
 * - Meeting time conflict detection
 * - Meeting validation
 * - Time formatting and duration calculation
 * - Attendee management
 * - Optimistic updates
 */

import { formatJST, formatJSTTime } from './date';

import type {
  AttendeeAvailability,
  MeetingConflict,
  MeetingEvent,
  MeetingFormData,
  MeetingValidationResult,
} from '@/types/meeting';

/**
 * Check for meeting time conflicts
 * @param newMeeting - New meeting to check
 * @param existingMeetings - Array of existing meetings
 * @param allowAdjacent - Allow adjacent meetings (default: true)
 * @returns Array of conflicts found
 */
export function checkMeetingConflicts(
  newMeeting: MeetingFormData | MeetingEvent,
  existingMeetings: MeetingEvent[],
  allowAdjacent: boolean = true,
): MeetingConflict[] {
  const conflicts: MeetingConflict[] = [];

  const newStart = new Date(newMeeting.startTime);
  const newEnd = new Date(newMeeting.endTime);

  // Skip invalid meetings
  if (newStart >= newEnd) {
    return conflicts;
  }

  existingMeetings.forEach((meeting) => {
    const existingStart = new Date(meeting.startTime);
    const existingEnd = new Date(meeting.endTime);

    // Check for exact duplicate
    if (
      newStart.getTime() === existingStart.getTime() &&
      newEnd.getTime() === existingEnd.getTime()
    ) {
      conflicts.push({
        meeting,
        conflictType: 'duplicate',
        severity: 'error',
        message: `Duplicate meeting time: ${formatMeetingTimeRange(existingStart, existingEnd)}`,
      });
      return;
    }

    // Check for overlap
    const hasOverlap = newStart < existingEnd && newEnd > existingStart;

    if (hasOverlap) {
      conflicts.push({
        meeting,
        conflictType: 'overlap',
        severity: 'error',
        message: `Meeting overlaps with "${meeting.title}" (${formatMeetingTimeRange(existingStart, existingEnd)})`,
      });
      return;
    }

    // Check for adjacent meetings if not allowed
    if (!allowAdjacent) {
      const isAdjacent =
        newStart.getTime() === existingEnd.getTime() ||
        newEnd.getTime() === existingStart.getTime();

      if (isAdjacent) {
        conflicts.push({
          meeting,
          conflictType: 'adjacent',
          severity: 'warning',
          message: `Meeting is adjacent to "${meeting.title}" - consider adding buffer time`,
        });
      }
    }
  });

  return conflicts;
}

/**
 * Validate meeting form data
 * @param meetingData - Meeting data to validate
 * @returns Validation result with errors and warnings
 */
export function validateMeetingData(meetingData: MeetingFormData): MeetingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!meetingData.title || meetingData.title.trim().length === 0) {
    errors.push('Meeting title is required');
  }

  if (!meetingData.startTime) {
    errors.push('Start time is required');
  }

  if (!meetingData.endTime) {
    errors.push('End time is required');
  }

  // Time validation
  if (meetingData.startTime && meetingData.endTime) {
    const startTime = new Date(meetingData.startTime);
    const endTime = new Date(meetingData.endTime);

    if (startTime >= endTime) {
      errors.push('End time must be after start time');
    }

    const duration = calculateMeetingDuration(startTime, endTime);

    if (duration < 5) {
      warnings.push('Meeting duration is very short (less than 5 minutes)');
    }

    if (duration > 480) {
      // 8 hours
      warnings.push('Meeting duration is very long (more than 8 hours)');
    }

    // Check if meeting is in the past
    const now = new Date();
    if (startTime < now) {
      warnings.push('Meeting is scheduled in the past');
    }

    // Check for weekend scheduling
    const isWeekendMeeting = startTime.getDay() === 0 || startTime.getDay() === 6;
    if (isWeekendMeeting) {
      warnings.push('Meeting is scheduled for a weekend');
    }

    // Check for off-hours scheduling
    const hour = startTime.getHours();
    if (hour < 8 || hour > 18) {
      warnings.push('Meeting is scheduled outside business hours');
    }
  }

  // Title length validation
  if (meetingData.title && meetingData.title.length > 100) {
    warnings.push('Meeting title is very long');
  }

  // Description length validation
  if (meetingData.description && meetingData.description.length > 1000) {
    warnings.push('Meeting description is very long');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Calculate meeting duration in minutes
 * @param startTime - Meeting start time
 * @param endTime - Meeting end time
 * @returns Duration in minutes
 */
export function calculateMeetingDuration(startTime: Date, endTime: Date): number {
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.round(diffMs / (1000 * 60));
}

/**
 * Format meeting time range using JST timezone
 * @param startTime - Meeting start time
 * @param endTime - Meeting end time
 * @param format - Format type
 * @returns Formatted time range string in JST
 */
export function formatMeetingTimeRange(
  startTime: Date,
  endTime: Date,
  format: 'short' | 'long' | 'duration' = 'short',
): string {
  switch (format) {
    case 'short': {
      const start = formatJSTTime(startTime);
      const end = formatJSTTime(endTime);
      return `${start} - ${end}`;
    }

    case 'long': {
      const start = formatJST(startTime, 'EEE, MMM d, HH:mm');
      const end = formatJSTTime(endTime);
      return `${start} - ${end}`;
    }

    case 'duration': {
      const duration = calculateMeetingDuration(startTime, endTime);
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;

      if (hours === 0) {
        return `${minutes}m`;
      } else if (minutes === 0) {
        return `${hours}h`;
      } else {
        return `${hours}h ${minutes}m`;
      }
    }

    default:
      return formatMeetingTimeRange(startTime, endTime, 'short');
  }
}

/**
 * Format attendee list for display
 * @param attendees - Array of attendees
 * @param maxDisplay - Maximum number to display before "and X more"
 * @returns Formatted attendee string
 */
export function formatAttendeeList(
  attendees: Array<{ id: string; name: string }>,
  maxDisplay: number = 3,
): string {
  if (attendees.length === 0) {
    return 'No attendees';
  }

  if (attendees.length <= maxDisplay) {
    return attendees.map((a) => a.name).join(', ');
  }

  const displayNames = attendees.slice(0, maxDisplay).map((a) => a.name);
  const remaining = attendees.length - maxDisplay;

  return `${displayNames.join(', ')} and ${remaining} more`;
}

/**
 * Check attendee availability for a time slot
 * @param attendeeIds - Array of attendee user IDs
 * @param startTime - Meeting start time
 * @param endTime - Meeting end time
 * @param existingMeetings - Array of existing meetings
 * @returns Availability status for each attendee
 */
export function checkAttendeeAvailability(
  attendeeIds: string[],
  startTime: Date,
  endTime: Date,
  existingMeetings: MeetingEvent[],
): AttendeeAvailability[] {
  return attendeeIds.map((userId) => {
    const userMeetings = existingMeetings.filter((meeting) =>
      meeting.attendees?.some((attendee) => attendee.id === userId),
    );

    const conflicts = checkMeetingConflicts({ title: '', startTime, endTime }, userMeetings, false);

    return {
      userId,
      isAvailable: conflicts.length === 0,
      conflictingMeetings: conflicts.map((c) => c.meeting),
    };
  });
}

/**
 * Generate optimistic meeting update for Apollo cache
 * @param meetingData - Meeting data for optimistic update
 * @param tempId - Temporary ID for the meeting
 * @returns Optimistic meeting object
 */
export function generateOptimisticMeeting(
  meetingData: MeetingFormData,
  tempId: string = `temp-${Date.now()}`,
): MeetingEvent {
  return {
    id: tempId,
    title: meetingData.title,
    description: meetingData.description || '',
    startTime: new Date(meetingData.startTime),
    endTime: new Date(meetingData.endTime),
    attendees: [], // Will be populated by real data
    isAllDay: meetingData.isAllDay || false,
  };
}

/**
 * Convert datetime-local input value to Date object
 * @param dateTimeLocal - Value from datetime-local input
 * @returns Date object
 */
export function datetimeLocalToDate(dateTimeLocal: string): Date {
  // datetime-local format: YYYY-MM-DDTHH:mm
  return new Date(dateTimeLocal);
}

/**
 * Convert Date object to datetime-local input value
 * Note: datetime-local inputs expect local time, so we don't use JST formatting here
 * @param date - Date object
 * @returns String in datetime-local format
 */
export function dateToDatetimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Get default meeting times (next available slot)
 * @param referenceDate - Reference date (default: now)
 * @param durationMinutes - Meeting duration in minutes (default: 60)
 * @returns Object with start and end times in datetime-local format
 */
export function getDefaultMeetingTimes(
  referenceDate: Date = new Date(),
  durationMinutes: number = 60,
): { startTime: string; endTime: string } {
  const now = new Date(referenceDate);

  // Round up to next 30-minute interval
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 30) * 30;

  const startTime = new Date(now);
  startTime.setMinutes(roundedMinutes, 0, 0);

  // If we've moved to the next hour due to rounding, adjust
  if (roundedMinutes >= 60) {
    startTime.setHours(startTime.getHours() + 1);
    startTime.setMinutes(0, 0, 0);
  }

  const endTime = new Date(startTime);
  endTime.setMinutes(endTime.getMinutes() + durationMinutes);

  return {
    startTime: dateToDatetimeLocal(startTime),
    endTime: dateToDatetimeLocal(endTime),
  };
}

/**
 * Group meetings by date
 * @param meetings - Array of meetings
 * @returns Map of date strings to meetings
 */
export function groupMeetingsByDate(meetings: MeetingEvent[]): Map<string, MeetingEvent[]> {
  const grouped = new Map<string, MeetingEvent[]>();

  meetings.forEach((meeting) => {
    const date = new Date(meeting.startTime);
    const dateKey = date.toDateString();

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }

    grouped.get(dateKey)!.push(meeting);
  });

  // Sort meetings within each date by start time
  grouped.forEach((dayMeetings) => {
    dayMeetings.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  });

  return grouped;
}

/**
 * Get meeting status based on start/end times
 * @param meeting - Meeting to check status for
 * @returns Meeting status
 */
export function getMeetingStatus(
  meeting: MeetingEvent,
): 'upcoming' | 'ongoing' | 'completed' | 'cancelled' {
  const now = new Date();
  const startTime = new Date(meeting.startTime);
  const endTime = new Date(meeting.endTime);

  if (now < startTime) {
    return 'upcoming';
  } else if (now >= startTime && now <= endTime) {
    return 'ongoing';
  } else {
    return 'completed';
  }
}
