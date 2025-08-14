const { GraphQLError } = require('graphql');

const { MESSAGES, ERROR_CODES } = require('../../constants/messages');

/**
 * Extracts and validates the authenticated user ID from the GraphQL context
 * @param {Object} context - GraphQL context containing request information
 * @returns {string} - The authenticated user ID
 * @throws {GraphQLError} - When user is not authenticated
 */
function requireAuth(context) {
  const userId = context?.req?.userId;
  if (!userId) {
    throw new GraphQLError(MESSAGES.NOT_AUTHENTICATED, {
      extensions: { code: ERROR_CODES.UNAUTHENTICATED },
    });
  }
  return userId;
}

/**
 * Handles unexpected errors by wrapping them in a GraphQLError
 * @param {Error} err - The error to handle
 * @throws {GraphQLError} - Always throws a GraphQLError
 */
function handleUnexpectedError(err) {
  if (err instanceof GraphQLError) {
    throw err;
  }
  throw new GraphQLError(MESSAGES.INTERNAL_ERROR, {
    extensions: { code: ERROR_CODES.INTERNAL_SERVER_ERROR },
  });
}

/**
 * Transforms a MongoDB user document to GraphQL AuthUser format
 * @param {Object} user - MongoDB user document
 * @returns {Object} - Formatted AuthUser object
 */
function formatAuthUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: String(user._id) || user.id,
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl ?? null,
  };
}

/**
 * Transforms a MongoDB user document to GraphQL User format
 * @param {Object} user - MongoDB user document
 * @returns {Object} - Formatted User object
 */
function formatUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl ?? null,
    address: user.address ?? null,
    dob: user.dob ?? null,
    role: user.role ?? 'USER',
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  };
}

/**
 * Transforms a MongoDB meeting document to GraphQL Meeting format
 * @param {Object} meeting - MongoDB meeting document
 * @returns {Object} - Formatted Meeting object
 */
function formatMeeting(meeting) {
  if (!meeting) {
    return null;
  }

  return {
    id: String(meeting._id),
    title: meeting.title,
    description: meeting.description ?? null,
    meetingUrl: meeting.meetingUrl ?? null,
    startTime: meeting.startTime?.toISOString(),
    endTime: meeting.endTime?.toISOString(),
    attendees: meeting.attendees?.map(formatUser) ?? [],
    createdBy: formatUser(meeting.createdBy),
    createdAt: meeting.createdAt?.toISOString(),
    updatedAt: meeting.updatedAt?.toISOString(),
  };
}

/**
 * Transforms a MongoDB event document to GraphQL Event format
 * @param {Object} event - MongoDB event document
 * @returns {Object} - Formatted Event object
 */
function formatEvent(event) {
  if (!event) {
    return null;
  }

  return {
    id: String(event._id),
    title: event.title,
    description: event.description ?? null,
    date: event.date?.toISOString(),
    price: event.price ?? 0,
    createdBy: formatUser(event.createdBy),
    createdAt: event.createdAt?.toISOString(),
    updatedAt: event.updatedAt?.toISOString(),
  };
}

/**
 * Transforms a MongoDB booking document to GraphQL Booking format
 * @param {Object} booking - MongoDB booking document
 * @returns {Object} - Formatted Booking object
 */
function formatBooking(booking) {
  if (!booking) {
    return null;
  }

  return {
    id: String(booking._id),
    event: formatEvent(booking.event),
    user: formatUser(booking.user),
    createdAt: booking.createdAt?.toISOString(),
    updatedAt: booking.updatedAt?.toISOString(),
  };
}

module.exports = {
  requireAuth,
  handleUnexpectedError,
  formatAuthUser,
  formatUser,
  formatMeeting,
  formatEvent,
  formatBooking,
};
