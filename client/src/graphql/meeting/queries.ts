import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import { Meetings } from '@/types/meeting';

/**
 * Meeting-related queries
 */

// Types for enhanced queries
export interface MeetingsQueryData {
  meetings: {
    meetingsList: Array<Meetings>;
    totalCount: number;
    hasMore: boolean;
  };
}

export interface MeetingByIdQueryData {
  findMeetingById: Meetings;
}

export interface MeetingsByDateRangeQueryData {
  meetingsByDateRange: Array<Meetings>;
}

export interface ConflictCheckQueryData {
  checkMeetingConflicts: {
    hasConflicts: boolean;
    conflicts: Array<{
      meeting: {
        id: string;
        title: string;
        startTime: string;
        endTime: string;
      };
      conflictType: string;
      severity: string;
      message: string;
    }>;
    warnings: string[];
  };
}

export interface DateRangeQueryData {
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface ConflictCheckQueryInput {
  input: {
    startTime: string;
    endTime: string;
    attendeeIds: string[];
    excludeMeetingId?: string;
  };
}

export const GET_MEETINGS: TD<MeetingsQueryData, Record<string, never>> = gql`
  query Meetings {
    meetings {
      meetingsList {
        id
        title
        description
        startTime
        endTime
        attendees {
          id
          name
          email
        }
        createdBy {
          id
          name
        }
        createdAt
        updatedAt
      }
      totalCount
      hasMore
    }
  }
` as unknown as TD<MeetingsQueryData, Record<string, never>>;

export const GET_MEETING_BY_ID: TD<MeetingByIdQueryData, { id: string }> = gql`
  query GetMeetingById($id: ID!) {
    findMeetingById(id: $id) {
      id
      title
      description
      startTime
      endTime
      attendees {
        id
        name
        email
      }
      createdBy {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
` as unknown as TD<MeetingByIdQueryData, { id: string }>;

export const GET_MEETINGS_BY_DATE_RANGE: TD<MeetingsByDateRangeQueryData, DateRangeQueryData> = gql`
  query GetMeetingsByDateRange($dateRange: DateRangeInput!) {
    meetingsByDateRange(dateRange: $dateRange) {
      id
      title
      description
      startTime
      endTime
      attendees {
        id
        name
        email
      }
      createdBy {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
` as unknown as TD<MeetingsByDateRangeQueryData, DateRangeQueryData>;

export const GET_MY_MEETINGS: TD<MeetingsByDateRangeQueryData, { userId: string }> = gql`
  query GetMyMeetings($userId: ID!) {
    myMeetings(userId: $userId) {
      id
      title
      description
      startTime
      endTime
      attendees {
        id
        name
        email
      }
      createdBy {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
` as unknown as TD<MeetingsByDateRangeQueryData, { userId: string }>;

export const GET_UPCOMING_MEETINGS: TD<MeetingsByDateRangeQueryData, { limit?: number }> = gql`
  query GetUpcomingMeetings($limit: Int) {
    upcomingMeetings(limit: $limit) {
      id
      title
      description
      startTime
      endTime
      attendees {
        id
        name
        email
      }
      createdBy {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
` as unknown as TD<MeetingsByDateRangeQueryData, { limit?: number }>;

export const CHECK_MEETING_CONFLICTS: TD<ConflictCheckQueryData, ConflictCheckQueryInput> = gql`
  query CheckMeetingConflicts($input: ConflictCheckInput!) {
    checkMeetingConflicts(input: $input) {
      hasConflicts
      conflicts {
        meeting {
          id
          title
          startTime
          endTime
        }
        conflictType
        severity
        message
      }
      warnings
    }
  }
` as unknown as TD<ConflictCheckQueryData, ConflictCheckQueryInput>;
