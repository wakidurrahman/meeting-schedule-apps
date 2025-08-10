export type Meeting = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
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
  createdAt: string;
  updatedAt: string;
};
