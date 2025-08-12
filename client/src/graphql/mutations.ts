import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import type { Booking } from '@/types/booking';
import type { Event, EventInput } from '@/types/event';
import { Meeting, MeetingInput } from '@/types/meeting';
import { AuthUser, UserLoginInput, UserProfile, UserRegisterInput } from '@/types/user';

// Types for Register mutation
export interface RegisterMutationData {
  register: AuthUser;
}

export const REGISTER: TD<RegisterMutationData, { input: UserRegisterInput }> = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      id
      name
      email
      imageUrl
    }
  }
` as unknown as TD<RegisterMutationData, { input: UserRegisterInput }>;

// Types for Login mutation
export interface LoginMutationData {
  login: { token: string; user: AuthUser };
}

export const LOGIN: TD<LoginMutationData, { input: UserLoginInput }> = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
        imageUrl
      }
    }
  }
` as unknown as TD<LoginMutationData, { input: UserLoginInput }>;

// Update profile
export interface UpdateMyProfileData {
  updateMyProfile: UserProfile;
}
export interface UpdateMyProfileVars {
  input: Partial<UserProfile>;
}
export const UPDATE_MY_PROFILE: TD<UpdateMyProfileData, UpdateMyProfileVars> = gql`
  mutation UpdateMyProfile($input: UpdateProfileInput!) {
    updateMyProfile(input: $input) {
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
` as unknown as TD<UpdateMyProfileData, UpdateMyProfileVars>;

// Types for CreateMeeting mutation
export interface CreateMeetingMutationData {
  createMeeting: Meeting;
}

export interface CreateMeetingMutationVariables {
  input: MeetingInput;
}

export const CREATE_MEETING: TD<CreateMeetingMutationData, CreateMeetingMutationVariables> = gql`
  mutation CreateMeeting($input: MeetingInput!) {
    createMeeting(input: $input) {
      id
      title
      description
      startTime
      endTime
    }
  }
` as unknown as TD<CreateMeetingMutationData, CreateMeetingMutationVariables>;

// Event mutations
export interface CreateEventData {
  createEvent: Event;
}
export const CREATE_EVENT: TD<CreateEventData, { eventInput: EventInput }> = gql`
  mutation CreateEvent($eventInput: EventInput) {
    createEvent(eventInput: $eventInput) {
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
` as unknown as TD<CreateEventData, { eventInput: EventInput }>;

export interface UpdateEventData {
  updateEvent: Event;
}
export const UPDATE_EVENT: TD<UpdateEventData, { id: string; eventInput: EventInput }> = gql`
  mutation UpdateEvent($id: ID!, $eventInput: EventInput) {
    updateEvent(id: $id, eventInput: $eventInput) {
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
` as unknown as TD<UpdateEventData, { id: string; eventInput: EventInput }>;

export interface DeleteEventData {
  deleteEvent: boolean;
}
export const DELETE_EVENT: TD<DeleteEventData, { id: string }> = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
` as unknown as TD<DeleteEventData, { id: string }>;

// Booking mutations
export interface BookEventData {
  bookEvent: Booking;
}
export const BOOK_EVENT: TD<BookEventData, { eventId: string }> = gql`
  mutation BookEvent($eventId: ID!) {
    bookEvent(eventId: $eventId) {
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
` as unknown as TD<BookEventData, { eventId: string }>;

export interface CancelBookingData {
  cancelBooking: Event;
}
export const CANCEL_BOOKING: TD<CancelBookingData, { bookingId: string }> = gql`
  mutation CancelBooking($bookingId: ID!) {
    cancelBooking(bookingId: $bookingId) {
      id
      title
      date
      price
    }
  }
` as unknown as TD<CancelBookingData, { bookingId: string }>;
