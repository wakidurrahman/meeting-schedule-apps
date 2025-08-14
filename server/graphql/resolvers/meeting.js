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
  /**
   * Meeting Query resolvers
   *
   * Meetings: List all meetings
   * Meeting: Get a meeting by id
   *
   * Meeting Mutation resolvers
   *
   * CreateMeeting: Create a new meeting
   * DeleteMeeting: Delete a meeting
   */
  // Query resolvers
  meetings: async (_args, context) => {
    try {
      // step 01: validate the user by requireAuth
      requireAuth(context);
      // step 02: list all meetings
      // For admin/testing: list all meetings. To scope to user, use listMeetingsForUserPopulated(userId)
      const meetings = await listAllMeetingsPopulated();
      // step 03: return the meetings
      return meetings.map(formatMeeting);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  meeting: async ({ id }, context) => {
    try {
      // step 01: validate the user by requireAuth
      requireAuth(context);
      // step 02: get the meeting by id
      const meeting = await getMeetingByIdPopulated(id);
      // step 03: return the meeting
      return formatMeeting(meeting);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  // Mutation resolvers
  createMeeting: async ({ input }, context) => {
    try {
      // step 01: validate the user by requireAuth
      const userId = requireAuth(context);
      // step 02: validate the input by Zod schema
      MeetingInputSchema.parse(input);
      // step 03: extract the input destructuring
      const { title, description, startTime, endTime, attendeeIds } = input;

      // step 04: create the meeting
      const meeting = await createMeetingDoc({
        title,
        description,
        startTime,
        endTime,
        attendeeIds,
        createdBy: userId,
      });
      // step 05: return the meeting
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
      // step 01: validate the user by requireAuth
      const userId = requireAuth(context);
      // step 02: delete the meeting
      const result = await deleteMeetingIfOwner(id, userId);
      // step 03: if the meeting is not found, return false
      if (result.notFound) {
        return false;
      }
      // step 04: if the meeting is forbidden, throw an error
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

module.exports = meetingResolvers;
