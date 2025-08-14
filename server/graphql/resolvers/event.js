const { GraphQLError } = require('graphql');

const { requireAuth, handleUnexpectedError, formatEvent } = require('../shared/helpers');

const { MESSAGES, ERROR_CODES } = require('../../constants/messages');
const {
  listAllEventsPopulated,
  listEventsFiltered,
  getEventByIdPopulated,
  createEventDoc,
  updateEventIfOwner,
  deleteEventIfOwner,
} = require('../../utils/mongoose-methods');

/**
 * Event-related GraphQL resolvers
 * Handles event CRUD operations and filtering
 */
const eventResolvers = {
  // Query resolvers
  events: async ({ filter }, context) => {
    try {
      requireAuth(context);
      const events = filter ? await listEventsFiltered(filter) : await listAllEventsPopulated();
      return events.map(formatEvent);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  event: async ({ id }, context) => {
    try {
      requireAuth(context);
      const event = await getEventByIdPopulated(id);
      return formatEvent(event);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  // Mutation resolvers
  createEvent: async ({ eventInput }, context) => {
    try {
      const userId = requireAuth(context);
      const event = await createEventDoc({
        ...eventInput,
        createdBy: userId,
      });

      return formatEvent(event);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  updateEvent: async ({ id, eventInput }, context) => {
    try {
      const userId = requireAuth(context);
      const result = await updateEventIfOwner(id, userId, eventInput || {});

      if (result.notFound) {
        throw new GraphQLError(MESSAGES.EVENT_NOT_FOUND, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }

      if (result.forbidden) {
        throw new GraphQLError(MESSAGES.FORBIDDEN, {
          extensions: { code: ERROR_CODES.FORBIDDEN },
        });
      }

      return formatEvent(result.event);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  deleteEvent: async ({ id }, context) => {
    try {
      const userId = requireAuth(context);
      const result = await deleteEventIfOwner(id, userId);

      if (result.notFound) {
        return false;
      }

      if (result.forbidden) {
        throw new GraphQLError(MESSAGES.FORBIDDEN, {
          extensions: { code: ERROR_CODES.FORBIDDEN },
        });
      }

      return !!result.deleted;
    } catch (err) {
      handleUnexpectedError(err);
    }
  },
};

module.exports = eventResolvers;
