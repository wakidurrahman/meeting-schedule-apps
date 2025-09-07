import type { AttendeeUser, AttendeesUser } from '@/types/user';

/**
 * Meeting
 *
 * Type definitions for:
 * - Meeting: A meeting event
 * - MeetingInput: The input for a meeting event
 * - Meetings: A list of meetings
 */

export type Meeting = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  attendees?: AttendeeUser[];
  createdBy?: AttendeesUser;
  createdAt?: string;
  updatedAt?: string;
};

export type MeetingInput = {
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  attendeeIds: string[];
};

export type Meetings = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  attendees?: AttendeeUser[];
  createdBy?: AttendeesUser;
  createdAt: string;
  updatedAt: string;
};

// ------------ Meeting Event ------------
/**
 * Meeting Event
 *
 * Type definitions for:
 * - MeetingStatusType: The status of a meeting.
 * - MeetingEvent: A meeting event.
 * - MeetingConflict: A meeting conflict.
 * - MeetingFormData: The form data for a meeting.
 * - MeetingValidationResult: The validation result for a meeting.
 * - AttendeeAvailability: The availability of an attendee.
 */

export type MeetingStatusType = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface MeetingEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: AttendeesUser[];
  createdBy?: AttendeesUser;
  status?: MeetingStatusType; // todo: add cancelled status
  isAllDay?: boolean;
}

export interface MeetingConflict {
  meeting: MeetingEvent;
  conflictType: 'overlap' | 'adjacent' | 'duplicate';
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export interface MeetingFormData {
  title: string;
  description?: string;
  startTime: string | Date;
  endTime: string | Date;
  attendeeIds?: string[];
  isAllDay?: boolean;
}

export interface MeetingValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
export interface AttendeeAvailability {
  userId: string;
  isAvailable: boolean;
  conflictingMeetings: MeetingEvent[];
}
