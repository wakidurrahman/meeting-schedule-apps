import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import type { Booking } from '@/types/booking';
import type { Event } from '@/types/event';

/**
 * Booking-related mutations
 */

// Book an event
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

// Cancel a booking
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
