/**
 * Meeting Resolver Tests
 * Comprehensive tests for all meeting-related GraphQL resolvers
 * Tests CRUD operations, authentication, validation, and error handling
 */

const { GraphQLError } = require('graphql');

const meetingResolvers = require('../../graphql/resolvers/meeting');
const {
  createTestMeeting,
  generateObjectId,
  createMockAuthRequest,
  createMockUnauthRequest,
} = require('../../tests/setup/helpers');

// Mock the dependencies
jest.mock('../../utils/mongoose-methods');
jest.mock('../../graphql/shared/helpers');
jest.mock('../../constants/messages');
jest.mock('../../utils/validators');

const mockMongooseMethods = require('../../utils/mongoose-methods');
const mockHelpers = require('../../graphql/shared/helpers');
const mockMessages = require('../../constants/messages');
const mockValidators = require('../../utils/validators');

// Setup mock constants
mockMessages.MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  FORBIDDEN: 'Access forbidden',
};

mockMessages.ERROR_CODES = {
  BAD_USER_INPUT: 'BAD_USER_INPUT',
  FORBIDDEN: 'FORBIDDEN',
};

describe('Meeting Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    mockHelpers.requireAuth.mockImplementation((context) => {
      if (!context.req?.userId) {
        throw new GraphQLError('Not authenticated');
      }
      return context.req.userId;
    });

    mockHelpers.handleUnexpectedError.mockImplementation((err) => {
      throw err;
    });

    mockHelpers.formatMeeting.mockImplementation((meeting) => ({
      id: meeting._id || meeting.id,
      title: meeting.title,
      description: meeting.description,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      attendees: meeting.attendees || [],
      createdBy: meeting.createdBy,
    }));

    // Setup validator mocks
    mockValidators.MeetingInputSchema = {
      parse: jest.fn().mockImplementation((input) => input),
    };
  });

  describe('meetings', () => {
    const userId = generateObjectId();
    const mockMeetings = [
      createTestMeeting({ _id: generateObjectId() }),
      createTestMeeting({ _id: generateObjectId() }),
    ];

    test('should return all meetings when authenticated', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.listAllMeetingsPopulated.mockResolvedValue(mockMeetings);

      const result = await meetingResolvers.meetings({}, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.listAllMeetingsPopulated).toHaveBeenCalled();
      expect(mockHelpers.formatMeeting).toHaveBeenCalledTimes(mockMeetings.length);
      expect(result).toHaveLength(mockMeetings.length);
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(meetingResolvers.meetings({}, context)).rejects.toThrow('Not authenticated');
    });

    test('should handle database errors', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.listAllMeetingsPopulated.mockRejectedValue(new Error('Database error'));

      await expect(meetingResolvers.meetings({}, context)).rejects.toThrow('Database error');
    });
  });

  describe('meeting', () => {
    const userId = generateObjectId();
    const meetingId = generateObjectId();
    const mockMeeting = createTestMeeting({ _id: meetingId });

    test('should return meeting by id when authenticated', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.getMeetingByIdPopulated.mockResolvedValue(mockMeeting);

      const result = await meetingResolvers.meeting({ id: meetingId }, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.getMeetingByIdPopulated).toHaveBeenCalledWith(meetingId);
      expect(mockHelpers.formatMeeting).toHaveBeenCalledWith(mockMeeting);
      expect(result).toEqual(
        expect.objectContaining({
          id: meetingId,
          title: mockMeeting.title,
        }),
      );
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(meetingResolvers.meeting({ id: meetingId }, context)).rejects.toThrow(
        'Not authenticated',
      );
    });

    test('should handle meeting not found', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.getMeetingByIdPopulated.mockResolvedValue(null);

      await expect(meetingResolvers.meeting({ id: meetingId }, context)).rejects.toThrow();
    });
  });

  describe('createMeeting', () => {
    const userId = generateObjectId();
    const validMeetingInput = {
      title: 'Team Meeting',
      description: 'Weekly team sync',
      startTime: '2024-12-25T10:00:00Z',
      endTime: '2024-12-25T11:00:00Z',
      attendeeIds: [generateObjectId()],
    };

    beforeEach(() => {
      mockMongooseMethods.createMeetingDoc.mockImplementation(async (meetingData) => ({
        _id: generateObjectId(),
        ...meetingData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    });

    test('should create meeting successfully', async () => {
      const context = { req: createMockAuthRequest(userId) };

      const result = await meetingResolvers.createMeeting({ input: validMeetingInput }, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockValidators.MeetingInputSchema.parse).toHaveBeenCalledWith(validMeetingInput);
      expect(mockMongooseMethods.createMeetingDoc).toHaveBeenCalledWith({
        ...validMeetingInput,
        createdBy: userId,
      });
      expect(mockHelpers.formatMeeting).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          title: 'Team Meeting',
          description: 'Weekly team sync',
        }),
      );
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(
        meetingResolvers.createMeeting({ input: validMeetingInput }, context),
      ).rejects.toThrow('Not authenticated');
    });

    test('should throw validation error for invalid input', async () => {
      const context = { req: createMockAuthRequest(userId) };
      const invalidInput = {
        title: '',
        description: 'Meeting without title',
        startTime: 'invalid-date',
        endTime: 'invalid-date',
      };

      // Mock validation to throw ZodError
      const zodError = new Error('Validation failed');
      zodError.name = 'ZodError';
      zodError.issues = [{ message: 'Invalid input' }];
      mockValidators.MeetingInputSchema.parse.mockImplementationOnce(() => {
        throw zodError;
      });

      await expect(
        meetingResolvers.createMeeting({ input: invalidInput }, context),
      ).rejects.toThrow(GraphQLError);
    });

    test('should handle database creation errors', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.createMeetingDoc.mockRejectedValue(new Error('Database error'));

      await expect(
        meetingResolvers.createMeeting({ input: validMeetingInput }, context),
      ).rejects.toThrow('Database error');
    });
  });

  describe('deleteMeeting', () => {
    const userId = generateObjectId();
    const meetingId = generateObjectId();

    test('should delete meeting successfully when user is owner', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.deleteMeetingIfOwner.mockResolvedValue({
        deleted: true,
        notFound: false,
        forbidden: false,
      });

      const result = await meetingResolvers.deleteMeeting({ id: meetingId }, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.deleteMeetingIfOwner).toHaveBeenCalledWith(meetingId, userId);
      expect(result).toBe(true);
    });

    test('should return false when meeting not found', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.deleteMeetingIfOwner.mockResolvedValue({
        deleted: false,
        notFound: true,
        forbidden: false,
      });

      const result = await meetingResolvers.deleteMeeting({ id: meetingId }, context);

      expect(result).toBe(false);
    });

    test('should throw forbidden error when user is not owner', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.deleteMeetingIfOwner.mockResolvedValue({
        deleted: false,
        notFound: false,
        forbidden: true,
      });

      await expect(meetingResolvers.deleteMeeting({ id: meetingId }, context)).rejects.toThrow(
        GraphQLError,
      );
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(meetingResolvers.deleteMeeting({ id: meetingId }, context)).rejects.toThrow(
        'Not authenticated',
      );
    });

    test('should handle database errors', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.deleteMeetingIfOwner.mockRejectedValue(new Error('Database error'));

      await expect(meetingResolvers.deleteMeeting({ id: meetingId }, context)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
