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
const testPassword = 'password123';
const hashedPassword = 'Hashed@Password123';
/**
 * Create a test user object
 */
const createTestUser = (overrides = {}) => ({
  _id: generateObjectId(),
  name: 'Test User',
  email: 'test@example.com',
  password: hashedPassword,
  role: 'USER',
  imageUrl: null,
  address: '',
  dob: null,
  createdEvents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

/**
 * Create multiple test users with different roles and data
 */
const createTestUsers = (count = 5) => {
  const roles = ['USER', 'ADMIN'];
  const names = ['Alice Johnson', 'Bob Smith', 'Charlie Brown', 'Diana Prince', 'Eve Davis'];
  const domains = ['example.com', 'test.com', 'company.com'];

  return Array.from({ length: count }, (_, index) => {
    const name = names[index % names.length] || `User ${index}`;
    const role = roles[index % roles.length];
    const domain = domains[index % domains.length];
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@${domain}`;

    return createTestUser({
      _id: generateObjectId(),
      name,
      email,
      role,
      imageUrl: index % 2 === 0 ? `https://example.com/avatar${index}.jpg` : null,
      address: index % 3 === 0 ? `${100 + index} Test Street` : '',
      dob: index % 4 === 0 ? new Date(1990 + index, index % 12, (index % 28) + 1) : null,
    });
  });
};

/**
 * Create test user input for mutations
 */
const createTestUserInput = (overrides = {}) => ({
  name: 'New Test User',
  email: 'newuser@example.com',
  role: 'USER',
  imageUrl: 'https://example.com/avatar.jpg',
  ...overrides,
});

/**
 * Create test user update input
 */
const createTestUserUpdateInput = (overrides = {}) => ({
  name: 'Updated User',
  email: 'updated@example.com',
  role: 'ADMIN',
  imageUrl: 'https://example.com/new-avatar.jpg',
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
const hashPassword = async (password = testPassword) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Generate a JWT token for testing
 */
const generateTestToken = (userId = generateObjectId()) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
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

  // User Management Queries
  GET_USERS: `
    query GetUsers($where: UsersWhere, $orderBy: UsersOrderBy, $pagination: Pagination) {
      users(where: $where, orderBy: $orderBy, pagination: $pagination) {
        usersList {
          id
          name
          email
          role
          imageUrl
          createdAt
          updatedAt
        }
        total
        hasMore
      }
    }
  `,

  GET_USER: `
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        email
        role
        imageUrl
        address
        dob
        createdAt
        updatedAt
      }
    }
  `,

  CREATE_USER: `
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        id
        name
        email
        role
        imageUrl
        createdAt
        updatedAt
      }
    }
  `,

  UPDATE_USER: `
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
      updateUser(id: $id, input: $input) {
        id
        name
        email
        role
        imageUrl
        updatedAt
      }
    }
  `,

  DELETE_USER: `
    mutation DeleteUser($id: ID!) {
      deleteUser(id: $id)
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
  createTestUsers,
  createTestUserInput,
  createTestUserUpdateInput,
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
