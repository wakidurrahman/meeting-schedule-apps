/**
 * GraphQL Integration Tests
 * End-to-end tests for GraphQL operations including authentication,
 * data persistence, and complex workflows
 */

const request = require('supertest');
const { createTestServer } = require('../../tests/setup/testServer');
const { connectTestDB, clearTestDB, disconnectTestDB } = require('../../tests/setup/testDb');
const { TEST_QUERIES, hashPassword } = require('../../tests/setup/helpers');
const User = require('../../models/user-schema');
const Meeting = require('../../models/meeting-schema');
const Event = require('../../models/event-schema');

describe('GraphQL Integration Tests', () => {
  let app;
  let server;

  beforeAll(async () => {
    await connectTestDB();
    app = createTestServer();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  afterAll(async () => {
    await disconnectTestDB();
  });

  describe('Authentication Flow', () => {
    test('should register new user successfully', async () => {
      const registerInput = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const response = await request(app)
        .post('/graphql')
        .send({
          query: TEST_QUERIES.REGISTER,
          variables: { input: registerInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.register).toEqual({
        token: expect.any(String),
        user: {
          id: expect.any(String),
          name: 'John Doe',
          email: 'john@example.com',
          role: 'USER',
        },
      });

      // Verify user was created in database
      const savedUser = await User.findOne({ email: 'john@example.com' });
      expect(savedUser).toBeTruthy();
      expect(savedUser.name).toBe('John Doe');
    });

    test('should login existing user successfully', async () => {
      // Create user in database
      const hashedPassword = await hashPassword('SecurePass123!');
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      });
      await user.save();

      const loginInput = {
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const response = await request(app)
        .post('/graphql')
        .send({
          query: TEST_QUERIES.LOGIN,
          variables: { input: loginInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.login).toEqual({
        token: expect.any(String),
        user: {
          id: user._id.toString(),
          name: 'John Doe',
          email: 'john@example.com',
          role: 'USER',
        },
        tokenExpiration: null,
      });
    });

    test('should reject invalid credentials', async () => {
      const loginInput = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/graphql')
        .send({
          query: TEST_QUERIES.LOGIN,
          variables: { input: loginInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Invalid credentials');
    });
  });

  describe('Protected Queries', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Create and authenticate user
      const hashedPassword = await hashPassword('SecurePass123!');
      const user = new User({
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
      });
      await user.save();
      userId = user._id.toString();

      // Get auth token
      const loginResponse = await request(app)
        .post('/graphql')
        .send({
          query: TEST_QUERIES.LOGIN,
          variables: {
            input: { email: 'john@example.com', password: 'SecurePass123!' },
          },
        });

      authToken = loginResponse.body.data.login.token;
    });

    test('should get current user with valid token', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: TEST_QUERIES.GET_ME,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.me).toEqual({
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'USER',
      });
    });

    test('should reject request without authentication token', async () => {
      const response = await request(app).post('/graphql').send({
        query: TEST_QUERIES.GET_ME,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Not authenticated');
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          query: TEST_QUERIES.GET_ME,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Not authenticated');
    });
  });

  describe('Meeting Operations', () => {
    let authToken;
    let userId;
    let attendeeId;

    beforeEach(async () => {
      // Create authenticated user
      const hashedPassword = await hashPassword('SecurePass123!');
      const user = new User({
        name: 'Meeting Creator',
        email: 'creator@example.com',
        password: hashedPassword,
      });
      await user.save();
      userId = user._id.toString();

      // Create attendee user
      const attendee = new User({
        name: 'Meeting Attendee',
        email: 'attendee@example.com',
        password: hashedPassword,
      });
      await attendee.save();
      attendeeId = attendee._id.toString();

      // Get auth token
      const loginResponse = await request(app)
        .post('/graphql')
        .send({
          query: TEST_QUERIES.LOGIN,
          variables: {
            input: { email: 'creator@example.com', password: 'SecurePass123!' },
          },
        });

      authToken = loginResponse.body.data.login.token;
    });

    test('should create meeting successfully', async () => {
      const meetingInput = {
        title: 'Team Stand-up',
        description: 'Daily team synchronization',
        startTime: '2024-12-25T09:00:00Z',
        endTime: '2024-12-25T10:00:00Z',
        attendeeIds: [attendeeId],
      };

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: TEST_QUERIES.CREATE_MEETING,
          variables: { input: meetingInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createMeeting).toEqual({
        id: expect.any(String),
        title: 'Team Stand-up',
        startTime: '2024-12-25T09:00:00.000Z',
        endTime: '2024-12-25T10:00:00.000Z',
        creator: {
          id: userId,
          name: 'Meeting Creator',
        },
      });

      // Verify meeting was created in database
      const savedMeeting = await Meeting.findOne({ title: 'Team Stand-up' });
      expect(savedMeeting).toBeTruthy();
      expect(savedMeeting.createdBy.toString()).toBe(userId);
    });

    test('should list meetings for authenticated user', async () => {
      // Create test meeting in database
      const meeting = new Meeting({
        title: 'Test Meeting',
        description: 'Test description',
        startTime: new Date('2024-12-25T09:00:00Z'),
        endTime: new Date('2024-12-25T10:00:00Z'),
        createdBy: userId,
        attendees: [attendeeId],
      });
      await meeting.save();

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: TEST_QUERIES.GET_MEETINGS,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.meetings).toHaveLength(1);
      expect(response.body.data.meetings[0]).toEqual({
        id: meeting._id.toString(),
        title: 'Test Meeting',
        startTime: '2024-12-25T09:00:00.000Z',
        endTime: '2024-12-25T10:00:00.000Z',
        creator: {
          id: userId,
          name: 'Meeting Creator',
        },
        attendees: [
          {
            id: attendeeId,
            name: 'Meeting Attendee',
          },
        ],
      });
    });
  });

  describe('Event and Booking Operations', () => {
    let authToken;
    let userId;
    let eventId;

    beforeEach(async () => {
      // Create authenticated user
      const hashedPassword = await hashPassword('SecurePass123!');
      const user = new User({
        name: 'Event Creator',
        email: 'creator@example.com',
        password: hashedPassword,
      });
      await user.save();
      userId = user._id.toString();

      // Get auth token
      const loginResponse = await request(app)
        .post('/graphql')
        .send({
          query: TEST_QUERIES.LOGIN,
          variables: {
            input: { email: 'creator@example.com', password: 'SecurePass123!' },
          },
        });

      authToken = loginResponse.body.data.login.token;

      // Create test event
      const event = new Event({
        title: 'Tech Conference',
        description: 'Annual technology conference',
        date: new Date('2024-12-25T09:00:00Z'),
        price: 99.99,
        createdBy: userId,
      });
      await event.save();
      eventId = event._id.toString();
    });

    test('should create event successfully', async () => {
      const eventInput = {
        title: 'Workshop',
        description: 'Technical workshop',
        date: '2024-12-26T09:00:00Z',
        price: 49.99,
      };

      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: TEST_QUERIES.CREATE_EVENT,
          variables: { input: eventInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createEvent).toEqual({
        id: expect.any(String),
        title: 'Workshop',
        description: 'Technical workshop',
        startTime: '2024-12-26T09:00:00.000Z',
        endTime: '2024-12-26T09:00:00.000Z',
        createdBy: {
          id: userId,
          name: 'Event Creator',
        },
      });
    });

    test('should list events for authenticated user', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: TEST_QUERIES.GET_EVENTS,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.events).toHaveLength(1);
      expect(response.body.data.events[0]).toEqual({
        id: eventId,
        title: 'Tech Conference',
        description: 'Annual technology conference',
        startTime: '2024-12-25T09:00:00.000Z',
        endTime: '2024-12-25T09:00:00.000Z',
        createdBy: {
          id: userId,
          name: 'Event Creator',
        },
      });
    });

    test('should book event successfully', async () => {
      const response = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: TEST_QUERIES.BOOK_EVENT,
          variables: { eventId },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.bookEvent).toEqual({
        id: expect.any(String),
        event: {
          id: eventId,
          title: 'Tech Conference',
        },
        user: {
          id: userId,
          name: 'Event Creator',
        },
        bookedAt: expect.any(String),
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle GraphQL syntax errors', async () => {
      const response = await request(app).post('/graphql').send({
        query: 'invalid graphql syntax {',
      });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    test('should handle missing required fields', async () => {
      const registerInput = {
        name: 'John Doe',
        // Missing email and password
      };

      const response = await request(app)
        .post('/graphql')
        .send({
          query: TEST_QUERIES.REGISTER,
          variables: { input: registerInput },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Validation failed');
    });

    test('should handle non-existent queries', async () => {
      const response = await request(app)
        .post('/graphql')
        .send({
          query: `
            query {
              nonExistentQuery {
                id
              }
            }
          `,
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Complex Workflows', () => {
    test('should complete full user registration and meeting creation workflow', async () => {
      // Step 1: Register user
      const registerResponse = await request(app)
        .post('/graphql')
        .send({
          query: TEST_QUERIES.REGISTER,
          variables: {
            input: {
              name: 'Workflow User',
              email: 'workflow@example.com',
              password: 'SecurePass123!',
            },
          },
        });

      expect(registerResponse.body.data.register.token).toBeDefined();
      const authToken = registerResponse.body.data.register.token;
      const userId = registerResponse.body.data.register.user.id;

      // Step 2: Create meeting
      const meetingResponse = await request(app)
        .post('/graphql')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: TEST_QUERIES.CREATE_MEETING,
          variables: {
            input: {
              title: 'Workflow Meeting',
              description: 'Meeting created during workflow test',
              startTime: '2024-12-25T09:00:00Z',
              endTime: '2024-12-25T10:00:00Z',
              attendeeIds: [],
            },
          },
        });

      expect(meetingResponse.body.data.createMeeting.title).toBe('Workflow Meeting');

      // Step 3: Verify data persistence
      const savedUser = await User.findById(userId);
      const savedMeeting = await Meeting.findOne({ title: 'Workflow Meeting' });

      expect(savedUser.email).toBe('workflow@example.com');
      expect(savedMeeting.createdBy.toString()).toBe(userId);
    });
  });
});
