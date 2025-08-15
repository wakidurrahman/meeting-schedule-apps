import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import { Meetings } from '@/types/meeting';

/**
 * Meeting-related queries
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
