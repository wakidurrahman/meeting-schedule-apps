import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import type { Event, EventInput } from '@/types/event';

/**
 * Event-related mutations
 */

// Create event
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

// Update event
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

// Delete event
export interface DeleteEventData {
  deleteEvent: boolean;
}
export const DELETE_EVENT: TD<DeleteEventData, { id: string }> = gql`
  mutation DeleteEvent($id: ID!) {
    deleteEvent(id: $id)
  }
` as unknown as TD<DeleteEventData, { id: string }>;
