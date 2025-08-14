const { GraphQLError } = require('graphql');

const {
  requireAuth,
  handleUnexpectedError,
  formatBooking,
  formatEvent,
} = require('../shared/helpers');

const { MESSAGES, ERROR_CODES } = require('../../constants/messages');
const {
  listAllBookingsPopulated,
  createBookingDoc,
  cancelBookingDoc,
} = require('../../utils/mongoose-methods');

/**
 * Booking-related GraphQL resolvers
 * Handles booking operations for events
 */
const bookingResolvers = {
  /**
   * Booking Query resolvers
   *
   * Bookings: List all bookings
   *
   * Booking Mutation resolvers
   *
   * BookEvent: Create a new booking
   * CancelBooking: Cancel a booking
   */
  // Query resolvers
  bookings: async (_args, context) => {
    try {
      // step 01: validate the user by requireAuth
      requireAuth(context);
      // step 02: list all bookings
      const bookings = await listAllBookingsPopulated();
      // step 03: return the bookings
      return bookings.map(formatBooking);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  // Mutation resolvers
  bookEvent: async ({ eventId }, context) => {
    try {
      // step 01: validate the user by requireAuth
      const userId = requireAuth(context);
      // step 02: create the booking
      const booking = await createBookingDoc({ eventId, userId });
      // step 03: if the booking is not found, throw an error
      if (!booking) {
        throw new GraphQLError(MESSAGES.EVENT_NOT_FOUND, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }
      // step 04: return the booking
      return formatBooking(booking);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  cancelBooking: async ({ bookingId }, context) => {
    try {
      // step 01: validate the user by requireAuth
      const userId = requireAuth(context);
      // step 02: cancel the booking
      const result = await cancelBookingDoc({ bookingId, userId });
      // step 03: if the booking is not found, throw an error
      if (result.notFound) {
        throw new GraphQLError(MESSAGES.BOOKING_NOT_FOUND, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }
      // step 04: if the booking is forbidden, throw an error
      if (result.forbidden) {
        throw new GraphQLError(MESSAGES.FORBIDDEN, {
          extensions: { code: ERROR_CODES.FORBIDDEN },
        });
      }

      // Return the event that was associated with the cancelled booking
      return formatEvent(result.event);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },
};

module.exports = bookingResolvers;
