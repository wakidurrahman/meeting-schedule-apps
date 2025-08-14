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
  // Query resolvers
  bookings: async (_args, context) => {
    try {
      requireAuth(context);
      const bookings = await listAllBookingsPopulated();
      return bookings.map(formatBooking);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  // Mutation resolvers
  bookEvent: async ({ eventId }, context) => {
    try {
      const userId = requireAuth(context);
      const booking = await createBookingDoc({ eventId, userId });

      if (!booking) {
        throw new GraphQLError(MESSAGES.EVENT_NOT_FOUND, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }

      return formatBooking(booking);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  cancelBooking: async ({ bookingId }, context) => {
    try {
      const userId = requireAuth(context);
      const result = await cancelBookingDoc({ bookingId, userId });

      if (result.notFound) {
        throw new GraphQLError(MESSAGES.BOOKING_NOT_FOUND, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }

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
