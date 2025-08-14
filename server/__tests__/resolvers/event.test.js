/**
 * Event Resolver Tests
 * Comprehensive tests for all event-related GraphQL resolvers
 * Tests CRUD operations, filtering, authentication, and error handling
 */

const { GraphQLError } = require('graphql');

const eventResolvers = require('../../graphql/resolvers/event');
const {
  createTestEvent,
  generateObjectId,
  createMockAuthRequest,
  createMockUnauthRequest,
} = require('../../tests/setup/helpers');

// Mock the dependencies
jest.mock('../../utils/mongoose-methods');
jest.mock('../../graphql/shared/helpers');
jest.mock('../../constants/messages');

const mockMongooseMethods = require('../../utils/mongoose-methods');
const mockHelpers = require('../../graphql/shared/helpers');
const mockMessages = require('../../constants/messages');

// Setup mock constants
mockMessages.MESSAGES = {
  EVENT_NOT_FOUND: 'Event not found',
  FORBIDDEN: 'Access forbidden',
};

mockMessages.ERROR_CODES = {
  BAD_USER_INPUT: 'BAD_USER_INPUT',
  FORBIDDEN: 'FORBIDDEN',
};

describe('Event Resolvers', () => {
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

    mockHelpers.formatEvent.mockImplementation((event) => ({
      id: event._id || event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      price: event.price,
      createdBy: event.createdBy,
    }));
  });

  describe('events', () => {
    const userId = generateObjectId();
    const mockEvents = [
      createTestEvent({ _id: generateObjectId() }),
      createTestEvent({ _id: generateObjectId() }),
    ];

    test('should return all events when no filter provided', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.listAllEventsPopulated.mockResolvedValue(mockEvents);

      const result = await eventResolvers.events({}, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.listAllEventsPopulated).toHaveBeenCalled();
      expect(mockHelpers.formatEvent).toHaveBeenCalledTimes(mockEvents.length);
      expect(result).toHaveLength(mockEvents.length);
    });

    test('should return filtered events when filter provided', async () => {
      const context = { req: createMockAuthRequest(userId) };
      const filter = { createdByMe: true };
      const filteredEvents = [mockEvents[0]];

      mockMongooseMethods.listEventsFiltered.mockResolvedValue(filteredEvents);

      const result = await eventResolvers.events({ filter }, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.listEventsFiltered).toHaveBeenCalledWith(filter);
      expect(mockHelpers.formatEvent).toHaveBeenCalledTimes(filteredEvents.length);
      expect(result).toHaveLength(filteredEvents.length);
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(eventResolvers.events({}, context)).rejects.toThrow('Not authenticated');
    });

    test('should handle database errors', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.listAllEventsPopulated.mockRejectedValue(new Error('Database error'));

      await expect(eventResolvers.events({}, context)).rejects.toThrow('Database error');
    });
  });

  describe('event', () => {
    const userId = generateObjectId();
    const eventId = generateObjectId();
    const mockEvent = createTestEvent({ _id: eventId });

    test('should return event by id when authenticated', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.getEventByIdPopulated.mockResolvedValue(mockEvent);

      const result = await eventResolvers.event({ id: eventId }, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.getEventByIdPopulated).toHaveBeenCalledWith(eventId);
      expect(mockHelpers.formatEvent).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual(
        expect.objectContaining({
          id: eventId,
          title: mockEvent.title,
        }),
      );
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(eventResolvers.event({ id: eventId }, context)).rejects.toThrow(
        'Not authenticated',
      );
    });

    test('should handle event not found', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.getEventByIdPopulated.mockResolvedValue(null);

      await expect(eventResolvers.event({ id: eventId }, context)).rejects.toThrow();
    });
  });

  describe('createEvent', () => {
    const userId = generateObjectId();
    const validEventInput = {
      title: 'Tech Conference',
      description: 'Annual technology conference',
      date: '2024-12-25T09:00:00Z',
      price: 99.99,
    };

    beforeEach(() => {
      mockMongooseMethods.createEventDoc.mockImplementation(async (eventData) => ({
        _id: generateObjectId(),
        ...eventData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    });

    test('should create event successfully', async () => {
      const context = { req: createMockAuthRequest(userId) };

      const result = await eventResolvers.createEvent({ eventInput: validEventInput }, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.createEventDoc).toHaveBeenCalledWith({
        ...validEventInput,
        createdBy: userId,
      });
      expect(mockHelpers.formatEvent).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          title: 'Tech Conference',
          description: 'Annual technology conference',
        }),
      );
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(
        eventResolvers.createEvent({ eventInput: validEventInput }, context),
      ).rejects.toThrow('Not authenticated');
    });

    test('should handle database creation errors', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.createEventDoc.mockRejectedValue(new Error('Database error'));

      await expect(
        eventResolvers.createEvent({ eventInput: validEventInput }, context),
      ).rejects.toThrow('Database error');
    });
  });

  describe('updateEvent', () => {
    const userId = generateObjectId();
    const eventId = generateObjectId();
    const updateInput = {
      title: 'Updated Tech Conference',
      price: 149.99,
    };

    test('should update event successfully when user is owner', async () => {
      const context = { req: createMockAuthRequest(userId) };
      const updatedEvent = { ...createTestEvent({ _id: eventId }), ...updateInput };

      mockMongooseMethods.updateEventIfOwner.mockResolvedValue({
        event: updatedEvent,
        notFound: false,
        forbidden: false,
      });

      const result = await eventResolvers.updateEvent(
        { id: eventId, eventInput: updateInput },
        context,
      );

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.updateEventIfOwner).toHaveBeenCalledWith(
        eventId,
        userId,
        updateInput,
      );
      expect(mockHelpers.formatEvent).toHaveBeenCalledWith(updatedEvent);
      expect(result).toEqual(
        expect.objectContaining({
          title: 'Updated Tech Conference',
          price: 149.99,
        }),
      );
    });

    test('should throw error when event not found', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.updateEventIfOwner.mockResolvedValue({
        event: null,
        notFound: true,
        forbidden: false,
      });

      await expect(
        eventResolvers.updateEvent({ id: eventId, eventInput: updateInput }, context),
      ).rejects.toThrow(GraphQLError);
    });

    test('should throw forbidden error when user is not owner', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.updateEventIfOwner.mockResolvedValue({
        event: null,
        notFound: false,
        forbidden: true,
      });

      await expect(
        eventResolvers.updateEvent({ id: eventId, eventInput: updateInput }, context),
      ).rejects.toThrow(GraphQLError);
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(
        eventResolvers.updateEvent({ id: eventId, eventInput: updateInput }, context),
      ).rejects.toThrow('Not authenticated');
    });
  });

  describe('deleteEvent', () => {
    const userId = generateObjectId();
    const eventId = generateObjectId();

    test('should delete event successfully when user is owner', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.deleteEventIfOwner.mockResolvedValue({
        deleted: true,
        notFound: false,
        forbidden: false,
      });

      const result = await eventResolvers.deleteEvent({ id: eventId }, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.deleteEventIfOwner).toHaveBeenCalledWith(eventId, userId);
      expect(result).toBe(true);
    });

    test('should return false when event not found', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.deleteEventIfOwner.mockResolvedValue({
        deleted: false,
        notFound: true,
        forbidden: false,
      });

      const result = await eventResolvers.deleteEvent({ id: eventId }, context);

      expect(result).toBe(false);
    });

    test('should throw forbidden error when user is not owner', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.deleteEventIfOwner.mockResolvedValue({
        deleted: false,
        notFound: false,
        forbidden: true,
      });

      await expect(eventResolvers.deleteEvent({ id: eventId }, context)).rejects.toThrow(
        GraphQLError,
      );
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(eventResolvers.deleteEvent({ id: eventId }, context)).rejects.toThrow(
        'Not authenticated',
      );
    });

    test('should handle database errors', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.deleteEventIfOwner.mockRejectedValue(new Error('Database error'));

      await expect(eventResolvers.deleteEvent({ id: eventId }, context)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
