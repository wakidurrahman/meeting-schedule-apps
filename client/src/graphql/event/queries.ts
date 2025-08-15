import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import type { Event } from '@/types/event';

/**
 * Event-related queries
 */

// Events with filtering
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

// Single event by ID
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
