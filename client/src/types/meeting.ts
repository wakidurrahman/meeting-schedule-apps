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
