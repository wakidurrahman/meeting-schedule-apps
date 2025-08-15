import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import type { Booking } from '@/types/booking';

/**
 * Booking-related queries
 */

// All bookings
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
