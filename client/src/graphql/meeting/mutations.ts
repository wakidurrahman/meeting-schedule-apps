import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import { Meeting, MeetingInput } from '@/types/meeting';

/**
 * Meeting-related mutations
 */

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
