/**
 * Booking Resolver Tests
 * Comprehensive tests for all booking-related GraphQL resolvers
 * Tests booking operations, authentication, and error handling
 */

const { GraphQLError } = require('graphql');

const bookingResolvers = require('../../graphql/resolvers/booking');
const {
  createTestBooking,
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
  BOOKING_NOT_FOUND: 'Booking not found',
  FORBIDDEN: 'Access forbidden',
};

mockMessages.ERROR_CODES = {
  BAD_USER_INPUT: 'BAD_USER_INPUT',
  FORBIDDEN: 'FORBIDDEN',
};

describe('Booking Resolvers', () => {
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

    mockHelpers.formatBooking.mockImplementation((booking) => ({
      id: booking._id || booking.id,
      event: booking.event,
      user: booking.user,
      bookedAt: booking.createdAt || booking.bookedAt,
    }));

    mockHelpers.formatEvent.mockImplementation((event) => ({
      id: event._id || event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      price: event.price,
      createdBy: event.createdBy,
    }));
  });

  describe('bookings', () => {
    const userId = generateObjectId();
    const mockBookings = [
      createTestBooking({ _id: generateObjectId() }),
      createTestBooking({ _id: generateObjectId() }),
    ];

    test('should return all bookings when authenticated', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.listAllBookingsPopulated.mockResolvedValue(mockBookings);

      const result = await bookingResolvers.bookings({}, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.listAllBookingsPopulated).toHaveBeenCalled();
      expect(mockHelpers.formatBooking).toHaveBeenCalledTimes(mockBookings.length);
      expect(result).toHaveLength(mockBookings.length);
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(bookingResolvers.bookings({}, context)).rejects.toThrow('Not authenticated');
    });

    test('should handle database errors', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.listAllBookingsPopulated.mockRejectedValue(new Error('Database error'));

      await expect(bookingResolvers.bookings({}, context)).rejects.toThrow('Database error');
    });
  });

  describe('bookEvent', () => {
    const userId = generateObjectId();
    const eventId = generateObjectId();

    beforeEach(() => {
      mockMongooseMethods.createBookingDoc.mockImplementation(async ({ eventId, userId }) => ({
        _id: generateObjectId(),
        event: eventId,
        user: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    });

    test('should create booking successfully', async () => {
      const context = { req: createMockAuthRequest(userId) };
      const mockBooking = createTestBooking({ event: eventId, user: userId });
      mockMongooseMethods.createBookingDoc.mockResolvedValue(mockBooking);

      const result = await bookingResolvers.bookEvent({ eventId }, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.createBookingDoc).toHaveBeenCalledWith({ eventId, userId });
      expect(mockHelpers.formatBooking).toHaveBeenCalledWith(mockBooking);
      expect(result).toEqual(
        expect.objectContaining({
          event: eventId,
          user: userId,
        }),
      );
    });

    test('should throw error when event not found', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.createBookingDoc.mockResolvedValue(null);

      await expect(bookingResolvers.bookEvent({ eventId }, context)).rejects.toThrow(GraphQLError);

      expect(mockMongooseMethods.createBookingDoc).toHaveBeenCalledWith({ eventId, userId });
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(bookingResolvers.bookEvent({ eventId }, context)).rejects.toThrow(
        'Not authenticated',
      );
    });

    test('should handle database creation errors', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.createBookingDoc.mockRejectedValue(new Error('Database error'));

      await expect(bookingResolvers.bookEvent({ eventId }, context)).rejects.toThrow(
        'Database error',
      );
    });

    test('should handle duplicate booking attempts', async () => {
      const context = { req: createMockAuthRequest(userId) };
      const duplicateError = new Error('Duplicate booking');
      duplicateError.code = 11000; // MongoDB duplicate key error
      mockMongooseMethods.createBookingDoc.mockRejectedValue(duplicateError);

      await expect(bookingResolvers.bookEvent({ eventId }, context)).rejects.toThrow(
        'Duplicate booking',
      );
    });
  });

  describe('cancelBooking', () => {
    const userId = generateObjectId();
    const bookingId = generateObjectId();
    const mockEvent = createTestEvent({ _id: generateObjectId() });

    test('should cancel booking successfully when user owns the booking', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.cancelBookingDoc.mockResolvedValue({
        event: mockEvent,
        notFound: false,
        forbidden: false,
      });

      const result = await bookingResolvers.cancelBooking({ bookingId }, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.cancelBookingDoc).toHaveBeenCalledWith({ bookingId, userId });
      expect(mockHelpers.formatEvent).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual(
        expect.objectContaining({
          id: mockEvent._id,
          title: mockEvent.title,
        }),
      );
    });

    test('should throw error when booking not found', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.cancelBookingDoc.mockResolvedValue({
        event: null,
        notFound: true,
        forbidden: false,
      });

      await expect(bookingResolvers.cancelBooking({ bookingId }, context)).rejects.toThrow(
        GraphQLError,
      );
    });

    test('should throw forbidden error when user does not own the booking', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.cancelBookingDoc.mockResolvedValue({
        event: null,
        notFound: false,
        forbidden: true,
      });

      await expect(bookingResolvers.cancelBooking({ bookingId }, context)).rejects.toThrow(
        GraphQLError,
      );
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(bookingResolvers.cancelBooking({ bookingId }, context)).rejects.toThrow(
        'Not authenticated',
      );
    });

    test('should handle database errors', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.cancelBookingDoc.mockRejectedValue(new Error('Database error'));

      await expect(bookingResolvers.cancelBooking({ bookingId }, context)).rejects.toThrow(
        'Database error',
      );
    });

    test('should handle booking already cancelled', async () => {
      const context = { req: createMockAuthRequest(userId) };
      const alreadyCancelledError = new Error('Booking already cancelled');
      mockMongooseMethods.cancelBookingDoc.mockRejectedValue(alreadyCancelledError);

      await expect(bookingResolvers.cancelBooking({ bookingId }, context)).rejects.toThrow(
        'Booking already cancelled',
      );
    });
  });
});
