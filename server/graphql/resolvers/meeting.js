const { GraphQLError } = require('graphql');

const { requireAuth, handleUnexpectedError, formatMeeting } = require('../shared/helpers');

const { MESSAGES, ERROR_CODES } = require('../../constants/messages');
const {
  listAllMeetingsPopulated,
  getMeetingByIdPopulated,
  createMeetingDoc,
  deleteMeetingIfOwner,
  updateMeetingDoc,
  getMeetingsByDateRange,
  getMeetingsByUserId,
} = require('../../utils/mongoose-methods');
const {
  MeetingInputSchema,
  CreateMeetingInputSchema,
  UpdateMeetingInputSchema,
} = require('../../utils/validators');

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
      // step 03: return the meetings in new format
      return {
        meetingsList: meetings.map(formatMeeting),
        totalCount: meetings.length,
        hasMore: false, // For pagination in future
      };
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  findMeetingById: async ({ id }, context) => {
    try {
      console.log('id', id);
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

  meetingsByDateRange: async ({ dateRange }, context) => {
    try {
      // step 01: validate the user by requireAuth
      requireAuth(context);
      // step 02: get meetings in date range
      const meetings = await getMeetingsByDateRange(dateRange.startDate, dateRange.endDate);
      // step 03: return the meetings
      return meetings.map(formatMeeting);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  myMeetings: async ({ userId }, context) => {
    try {
      // step 01: validate the user by requireAuth
      const authUserId = requireAuth(context);
      // step 02: ensure user can only access their own meetings (or is admin)
      const targetUserId = userId || authUserId;
      if (targetUserId !== authUserId) {
        throw new GraphQLError(MESSAGES.FORBIDDEN, {
          extensions: { code: ERROR_CODES.FORBIDDEN },
        });
      }
      // step 03: get user's meetings
      const meetings = await getMeetingsByUserId(targetUserId);
      // step 04: return the meetings
      return meetings.map(formatMeeting);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  upcomingMeetings: async ({ limit = 10 }, context) => {
    try {
      // step 01: validate the user by requireAuth
      requireAuth(context);
      // step 02: get upcoming meetings
      const meetings = await listAllMeetingsPopulated();
      const now = new Date();
      const upcoming = meetings
        .filter((meeting) => new Date(meeting.startTime) > now)
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, limit);
      // step 03: return the meetings
      return upcoming.map(formatMeeting);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  checkMeetingConflicts: async ({ input }, context) => {
    try {
      // step 01: validate the user by requireAuth
      requireAuth(context);
      // step 02: get all meetings for conflict checking
      const allMeetings = await listAllMeetingsPopulated();
      const conflicts = [];
      const warnings = [];

      const newStart = new Date(input.startTime);
      const newEnd = new Date(input.endTime);

      // step 03: check for conflicts
      for (const meeting of allMeetings) {
        // Skip excluded meeting (for updates)
        if (input.excludeMeetingId && meeting._id.toString() === input.excludeMeetingId) {
          continue;
        }

        const existingStart = new Date(meeting.startTime);
        const existingEnd = new Date(meeting.endTime);

        // Check for time overlap
        const hasOverlap = newStart < existingEnd && newEnd > existingStart;

        if (hasOverlap) {
          // Check if any attendees are in common
          const commonAttendees = meeting.attendees.filter((attendee) =>
            input.attendeeIds.includes(attendee._id.toString()),
          );

          if (commonAttendees.length > 0) {
            conflicts.push({
              meeting: formatMeeting(meeting),
              conflictType: 'OVERLAP',
              severity: 'ERROR',
              message: `Meeting overlaps with "${meeting.title}" - ${commonAttendees.length} attendee(s) in conflict`,
            });
          }
        }

        // Check for adjacent meetings (within 30 minutes)
        const isAdjacent =
          Math.abs(newStart.getTime() - existingEnd.getTime()) <= 30 * 60 * 1000 ||
          Math.abs(newEnd.getTime() - existingStart.getTime()) <= 30 * 60 * 1000;

        if (isAdjacent && !hasOverlap) {
          warnings.push(
            `Meeting is very close to "${meeting.title}" - consider adding buffer time`,
          );
        }
      }

      // step 04: return conflict results
      return {
        hasConflicts: conflicts.length > 0,
        conflicts,
        warnings,
      };
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
      CreateMeetingInputSchema.parse(input);
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

  updateMeeting: async ({ id, input }, context) => {
    try {
      // step 01: validate the user by requireAuth
      const userId = requireAuth(context);
      // step 02: validate the input by Zod schema
      UpdateMeetingInputSchema.parse(input);
      // step 03: update the meeting
      const meeting = await updateMeetingDoc(id, input, userId);
      // step 04: return the meeting
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
