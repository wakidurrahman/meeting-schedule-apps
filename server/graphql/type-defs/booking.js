/**
 * Booking-related GraphQL type definitions
 * Includes Booking type, queries, and mutations
 */

module.exports = `
  # Booking Type
  type Booking {
    id: ID!
    event: Event!
    user: User!
    createdAt: String!
    updatedAt: String!
  }

  # Booking Queries
  extend type Query {
    bookings: [Booking!]!
  }

  # Booking Mutations
  extend type Mutation {
    bookEvent(eventId: ID!): Booking!
    cancelBooking(bookingId: ID!): Event!
  }
`;
