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
const { EventInputSchema } = require('../../utils/validators');

/**
 * Event-related GraphQL resolvers
 * Handles event CRUD operations and filtering
 */
const eventResolvers = {
  /**
   * Event Query resolvers
   *
   * Events: List all events
   * Event: Get an event by id
   */
  // Query resolvers
  events: async ({ filter }, context) => {
    try {
      // step 01: validate the user by requireAuth
      requireAuth(context);
      // step 02: list all events
      const events = filter ? await listEventsFiltered(filter) : await listAllEventsPopulated();
      // step 03: return the events
      return events.map(formatEvent);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  event: async ({ id }, context) => {
    try {
      // step 01: validate the user by requireAuth
      requireAuth(context);
      // step 02: get the event by id
      const event = await getEventByIdPopulated(id);
      // step 03: return the event
      return formatEvent(event);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  // Mutation resolvers
  createEvent: async ({ eventInput }, context) => {
    try {
      // step 01: validate the user by requireAuth
      const userId = requireAuth(context);
      // step 02: validate the input by Zod schema
      EventInputSchema.parse(eventInput);
      // step 03: extract the input destructuring
      const { title, description, date, price } = eventInput;

      // step 04: create the event
      const event = await createEventDoc({
        title,
        description,
        date,
        price,
        createdBy: userId,
      });

      // step 05: return the event
      return formatEvent(event);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  updateEvent: async ({ id, eventInput }, context) => {
    try {
      // step 01: validate the user by requireAuth
      const userId = requireAuth(context);
      // step 02: update the event
      const result = await updateEventIfOwner(id, userId, eventInput || {});
      // step 03: if the event is not found, throw an error
      if (result.notFound) {
        throw new GraphQLError(MESSAGES.EVENT_NOT_FOUND, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }
      // step 04: if the event is forbidden, throw an error
      if (result.forbidden) {
        throw new GraphQLError(MESSAGES.FORBIDDEN, {
          extensions: { code: ERROR_CODES.FORBIDDEN },
        });
      }

      // step 05: return the event
      return formatEvent(result.event);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  deleteEvent: async ({ id }, context) => {
    try {
      // step 01: validate the user by requireAuth
      const userId = requireAuth(context);
      // step 02: delete the event
      const result = await deleteEventIfOwner(id, userId);
      // step 03: if the event is not found, return false
      if (result.notFound) {
        return false;
      }
      // step 04: if the event is forbidden, throw an error
      if (result.forbidden) {
        throw new GraphQLError(MESSAGES.FORBIDDEN, {
          extensions: { code: ERROR_CODES.FORBIDDEN },
        });
      }

      // step 05: return the result
      return !!result.deleted;
    } catch (err) {
      handleUnexpectedError(err);
    }
  },
};

module.exports = eventResolvers;
