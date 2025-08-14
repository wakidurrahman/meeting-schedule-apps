const { GraphQLError } = require('graphql');

const { requireAuth, handleUnexpectedError, formatMeeting } = require('../shared/helpers');

const { MESSAGES, ERROR_CODES } = require('../../constants/messages');
const {
  listAllMeetingsPopulated,
  getMeetingByIdPopulated,
  createMeetingDoc,
  deleteMeetingIfOwner,
} = require('../../utils/mongoose-methods');
const { MeetingInputSchema } = require('../../utils/validators');

/**
 * Meeting-related GraphQL resolvers
 * Handles meeting CRUD operations
 */
const meetingResolvers = {
  // Query resolvers
  meetings: async (_args, context) => {
    try {
      requireAuth(context);
      // For admin/testing: list all meetings. To scope to user, use listMeetingsForUserPopulated(userId)
      const meetings = await listAllMeetingsPopulated();
      return meetings.map(formatMeeting);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  meeting: async ({ id }, context) => {
    try {
      requireAuth(context);
      const meeting = await getMeetingByIdPopulated(id);
      return formatMeeting(meeting);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  // Mutation resolvers
  createMeeting: async ({ input }, context) => {
    try {
      const userId = requireAuth(context);
      const parsed = MeetingInputSchema.parse(input);
      const { title, description, startTime, endTime, attendeeIds } = parsed;

      const meeting = await createMeetingDoc({
        title,
        description,
        startTime,
        endTime,
        attendeeIds,
        createdBy: userId,
      });

      return formatMeeting(meeting);
    } catch (err) {
      if (err.name === 'ZodError') {
        throw new GraphQLError(MESSAGES.VALIDATION_FAILED, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT, details: err.issues },
        });
      }
      handleUnexpectedError(err);
    }
  },

  deleteMeeting: async ({ id }, context) => {
    try {
      const userId = requireAuth(context);
      const result = await deleteMeetingIfOwner(id, userId);

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

module.exports = meetingResolvers;
