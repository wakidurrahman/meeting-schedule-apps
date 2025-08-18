export type Meeting = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  attendees?: Array<{ id: string; name: string; email?: string }>;
  createdBy?: { id: string; name: string };
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
  attendees?: Array<{ id: string; name: string; email?: string }>;
  createdBy?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
};

export interface MeetingEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees?: Array<{ id: string; name: string }>;
  description?: string;
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
