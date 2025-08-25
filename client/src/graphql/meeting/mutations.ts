import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import { Meetings } from '@/types/meeting';

/**
 * Meeting-related mutations
 */

// Types for CreateMeeting mutation data.
export interface CreateMeetingMutation {
  createMeeting: Meetings;
}

// Types for CreateMeeting mutation input.
export interface CreateMeetingMutationInput {
  input: {
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    attendeeIds: string[];
    // createdBy: AttendeesUser;
  };
}

// Types for UpdateMeeting mutation data.
export interface UpdateMeetingMutationData {
  updateMeeting: Meetings;
}

export interface UpdateMeetingMutationVariables {
  id: string;
  input: {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    attendeeIds?: string[];
  };
}

// Types for DeleteMeeting mutation
export interface DeleteMeetingMutationEvent {
  deleteMeeting: boolean;
}

export interface DeleteMeetingMutationEventInput {
  id: string;
}

export const CREATE_MEETING_EVENT: TD<CreateMeetingMutation, CreateMeetingMutationInput> = gql`
  mutation CreateMeeting($input: CreateMeetingInput!) {
    createMeeting(input: $input) {
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
      createdAt
      updatedAt
    }
  }
` as unknown as TD<CreateMeetingMutation, CreateMeetingMutationInput>;

export const UPDATE_MEETING: TD<UpdateMeetingMutationData, UpdateMeetingMutationVariables> = gql`
  mutation UpdateMeeting($id: ID!, $input: UpdateMeetingInput!) {
    updateMeeting(id: $id, input: $input) {
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
` as unknown as TD<UpdateMeetingMutationData, UpdateMeetingMutationVariables>;

export const DELETE_MEETING: TD<DeleteMeetingMutationEvent, DeleteMeetingMutationEventInput> = gql`
  mutation DeleteMeeting($id: ID!) {
    deleteMeeting(id: $id)
  }
` as unknown as TD<DeleteMeetingMutationEvent, DeleteMeetingMutationEventInput>;
