/**
 * Test Helper Functions
 * Shared utilities for creating test data and common test operations
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongoose').Types;

/**
 * Generate a valid MongoDB ObjectId string
 */
const generateObjectId = () => new ObjectId().toString();

/**
 * Create a test user object
 */
const createTestUser = (overrides = {}) => ({
  _id: generateObjectId(),
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword123',
  role: 'USER',
  createdEvents: [],
  ...overrides,
});

/**
 * Create a test meeting object
 */
const createTestMeeting = (overrides = {}) => ({
  _id: generateObjectId(),
  title: 'Test Meeting',
  startTime: new Date('2024-12-25T10:00:00Z'),
  endTime: new Date('2024-12-25T11:00:00Z'),
  creator: generateObjectId(),
  attendees: [],
  ...overrides,
});

/**
 * Create a test event object
 */
const createTestEvent = (overrides = {}) => ({
  _id: generateObjectId(),
  title: 'Test Event',
  description: 'Test event description',
  startTime: new Date('2024-12-25T14:00:00Z'),
  endTime: new Date('2024-12-25T15:00:00Z'),
  createdBy: generateObjectId(),
  ...overrides,
});

/**
 * Create a test booking object
 */
const createTestBooking = (overrides = {}) => ({
  _id: generateObjectId(),
  event: generateObjectId(),
  user: generateObjectId(),
  bookedAt: new Date(),
  ...overrides,
});

/**
 * Hash a password for testing
 */
const hashPassword = async (password = 'password123') => {
  return await bcrypt.hash(password, 10);
};

/**
 * Generate a JWT token for testing
 */
const generateTestToken = (userId = generateObjectId()) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

/**
 * Create a mock request object with authentication
 */
const createMockAuthRequest = (userId = generateObjectId()) => ({
  isAuth: true,
  userId,
  get: jest.fn(() => `Bearer ${generateTestToken(userId)}`),
});

/**
 * Create a mock request object without authentication
 */
const createMockUnauthRequest = () => ({
  isAuth: false,
  userId: null,
  get: jest.fn(() => null),
});

/**
 * Common GraphQL query strings for testing
 */
const TEST_QUERIES = {
  GET_ME: `
    query {
      me {
        id
        name
        email
        role
      }
    }
  `,

  REGISTER: `
    mutation Register($input: RegisterInput!) {
      register(input: $input) {
        token
        user {
          id
          name
          email
          role
        }
      }
    }
  `,

  LOGIN: `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        token
        user {
          id
          name
          email
          role
        }
      }
    }
  `,

  GET_MEETINGS: `
    query {
      meetings {
        id
        title
        startTime
        endTime
        creator {
          id
          name
        }
        attendees {
          id
          name
        }
      }
    }
  `,

  CREATE_MEETING: `
    mutation CreateMeeting($input: CreateMeetingInput!) {
      createMeeting(input: $input) {
        id
        title
        startTime
        endTime
        creator {
          id
          name
        }
      }
    }
  `,

  GET_EVENTS: `
    query GetEvents($filter: EventFilterInput) {
      events(filter: $filter) {
        id
        title
        description
        startTime
        endTime
        createdBy {
          id
          name
        }
      }
    }
  `,

  CREATE_EVENT: `
    mutation CreateEvent($input: CreateEventInput!) {
      createEvent(input: $input) {
        id
        title
        description
        startTime
        endTime
        createdBy {
          id
          name
        }
      }
    }
  `,

  BOOK_EVENT: `
    mutation BookEvent($eventId: ID!) {
      bookEvent(eventId: $eventId) {
        id
        event {
          id
          title
        }
        user {
          id
          name
        }
        bookedAt
      }
    }
  `,
};

/**
 * Assert that an object matches the expected shape
 */
const expectObjectShape = (actual, expected) => {
  Object.keys(expected).forEach((key) => {
    expect(actual).toHaveProperty(key);
    if (typeof expected[key] === 'object' && expected[key] !== null) {
      expectObjectShape(actual[key], expected[key]);
    }
  });
};

/**
 * Wait for async operations to complete
 */
const waitFor = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  generateObjectId,
  createTestUser,
  createTestMeeting,
  createTestEvent,
  createTestBooking,
  hashPassword,
  generateTestToken,
  createMockAuthRequest,
  createMockUnauthRequest,
  TEST_QUERIES,
  expectObjectShape,
  waitFor,
};
