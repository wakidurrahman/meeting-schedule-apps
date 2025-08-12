import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import type { Booking } from '@/types/booking';
import type { Event } from '@/types/event';
import { Meetings } from '@/types/meeting';
import { AuthUser, UserProfile } from '@/types/user';

/**
 * Get the current user
 * @returns {Object} The current user
 */
// Types for Me query
export interface MeQueryData {
  me: AuthUser | null;
}

export const GET_ME: TD<MeQueryData, Record<string, never>> = gql`
  query Me {
    me {
      id
      name
      email
      imageUrl
    }
  }
` as unknown as TD<MeQueryData, Record<string, never>>;

/**
 * Get the meetings
 * @returns {Object} The meetings
 */
// Types for Meetings query
export interface MeetingsQueryData {
  meetings: Array<Meetings>;
}

export const GET_MEETINGS: TD<MeetingsQueryData, Record<string, never>> = gql`
  query Meetings {
    meetings {
      id
      title
      description
      startTime
      endTime
      createdAt
      updatedAt
    }
  }
` as unknown as TD<MeetingsQueryData, Record<string, never>>;

// Types for Users query
export interface UsersQueryData {
  users: Array<UserProfile>;
}

export const GET_USERS: TD<UsersQueryData, Record<string, never>> = gql`
  query Users {
    users {
      id
      name
      email
      imageUrl
      role
      createdAt
      updatedAt
    }
  }
` as unknown as TD<UsersQueryData, Record<string, never>>;

// My profile
export interface MyProfileQueryData {
  myProfile: UserProfile | null;
}
export const GET_MY_PROFILE: TD<MyProfileQueryData, Record<string, never>> = gql`
  query MyProfile {
    myProfile {
      id
      name
      email
      imageUrl
      address
      dob
      role
      createdAt
      updatedAt
    }
  }
` as unknown as TD<MyProfileQueryData, Record<string, never>>;

// Events
export interface EventsQueryData {
  events: Event[];
}
export interface EventsQueryVars {
  filter?: { createdById?: string | null; dateFrom?: string | null; dateTo?: string | null };
}
export const GET_EVENTS: TD<EventsQueryData, EventsQueryVars> = gql`
  query Events($filter: EventFilterInput) {
    events(filter: $filter) {
      id
      title
      description
      date
      price
      createdBy {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
` as unknown as TD<EventsQueryData, EventsQueryVars>;

export interface EventQueryData {
  event: Event | null;
}
export const GET_EVENT: TD<EventQueryData, { id: string }> = gql`
  query Event($id: ID!) {
    event(id: $id) {
      id
      title
      description
      date
      price
      createdBy {
        id
        name
        email
      }
      createdAt
      updatedAt
    }
  }
` as unknown as TD<EventQueryData, { id: string }>;

// Bookings
export interface BookingsQueryData {
  bookings: Booking[];
}
export const GET_BOOKINGS: TD<BookingsQueryData, Record<string, never>> = gql`
  query Bookings {
    bookings {
      id
      event {
        id
        title
        date
        price
      }
      user {
        id
        name
        email
        imageUrl
      }
      createdAt
      updatedAt
    }
  }
` as unknown as TD<BookingsQueryData, Record<string, never>>;
