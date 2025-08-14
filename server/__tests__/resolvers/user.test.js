/**
 * User Resolver Tests
 * Comprehensive tests for all user-related GraphQL resolvers
 * Tests authentication, validation, error handling, and business logic
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');

const userResolvers = require('../../graphql/resolvers/user');
const {
  createTestUser,
  generateObjectId,
  createMockAuthRequest,
  createMockUnauthRequest,
  hashPassword,
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
  EMAIL_IN_USE: 'Email already in use',
  VALIDATION_FAILED: 'Validation failed',
  INVALID_CREDENTIALS: 'Invalid credentials',
  JWT_MISSING: 'JWT secret is missing',
  USER_NOT_FOUND: 'User not found',
};

mockMessages.ERROR_CODES = {
  BAD_USER_INPUT: 'BAD_USER_INPUT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
};

describe('User Resolvers', () => {
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

    mockHelpers.formatAuthUser.mockImplementation((user) => ({
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }));

    mockHelpers.formatUser.mockImplementation((user) => ({
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      imageUrl: user.imageUrl,
      address: user.address,
      dob: user.dob,
    }));

    // Setup validator mocks
    mockValidators.RegisterInputSchema = {
      parse: jest.fn().mockImplementation((input) => input),
    };

    mockValidators.LoginInputSchema = {
      parse: jest.fn().mockImplementation((input) => input),
    };

    mockValidators.UpdateProfileInputSchema = {
      parse: jest.fn().mockImplementation((input) => input),
    };
  });

  describe('register', () => {
    const validRegisterInput = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    beforeEach(() => {
      mockMongooseMethods.getUserByEmail.mockResolvedValue(null);
      mockMongooseMethods.createUser.mockImplementation(async (userData) => ({
        _id: generateObjectId(),
        ...userData,
        role: 'USER',
        createdAt: new Date(),
      }));
    });

    test('should register a new user successfully', async () => {
      const result = await userResolvers.register({ input: validRegisterInput }, {});

      expect(mockMongooseMethods.getUserByEmail).toHaveBeenCalledWith('john@example.com');
      expect(mockMongooseMethods.createUser).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: expect.any(String),
      });
      expect(mockHelpers.formatAuthUser).toHaveBeenCalled();
      expect(result).toEqual({
        id: expect.any(String),
        name: 'John Doe',
        email: 'john@example.com',
        role: 'USER',
      });
    });

    test('should hash password with bcrypt', async () => {
      const bcryptSpy = jest.spyOn(bcrypt, 'hash');

      await userResolvers.register({ input: validRegisterInput }, {});

      expect(bcryptSpy).toHaveBeenCalledWith('password123', 12);
      bcryptSpy.mockRestore();
    });

    test('should throw error if email already exists', async () => {
      mockMongooseMethods.getUserByEmail.mockResolvedValue(createTestUser());

      await expect(userResolvers.register({ input: validRegisterInput }, {})).rejects.toThrow(
        GraphQLError,
      );

      expect(mockMongooseMethods.createUser).not.toHaveBeenCalled();
    });

    test('should throw validation error for invalid input', async () => {
      const invalidInput = {
        name: '',
        email: 'invalid-email',
        password: '123',
      };

      // Mock validation to throw ZodError
      const zodError = new Error('Validation failed');
      zodError.name = 'ZodError';
      zodError.issues = [{ message: 'Invalid input' }];
      mockValidators.RegisterInputSchema.parse.mockImplementationOnce(() => {
        throw zodError;
      });

      await expect(userResolvers.register({ input: invalidInput }, {})).rejects.toThrow(
        GraphQLError,
      );
    });

    test('should handle unexpected errors', async () => {
      mockMongooseMethods.getUserByEmail.mockRejectedValue(new Error('Database error'));
      mockHelpers.handleUnexpectedError.mockImplementation((err) => {
        throw err; // Re-throw the error
      });

      await expect(userResolvers.register({ input: validRegisterInput }, {})).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('login', () => {
    const validLoginInput = {
      email: 'john@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: generateObjectId(),
      email: 'john@example.com',
      password: 'hashedpassword',
      name: 'John Doe',
      role: 'USER',
    };

    beforeEach(() => {
      process.env.JWT_SECRET = 'test-secret';
      mockMongooseMethods.findUserDocByEmail.mockResolvedValue(mockUser);
    });

    test('should login user successfully with valid credentials', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(jwt, 'sign').mockReturnValue('mock-jwt-token');

      const result = await userResolvers.login({ input: validLoginInput }, {});

      expect(mockMongooseMethods.findUserDocByEmail).toHaveBeenCalledWith('john@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(jwt.sign).toHaveBeenCalledWith({ userId: mockUser.id }, 'test-secret', {
        expiresIn: '7d',
      });
      expect(result).toEqual({
        token: 'mock-jwt-token',
        user: expect.objectContaining({
          email: 'john@example.com',
          name: 'John Doe',
        }),
        tokenExpiration: null,
      });
    });

    test('should throw error for non-existent user', async () => {
      mockMongooseMethods.findUserDocByEmail.mockResolvedValue(null);

      await expect(userResolvers.login({ input: validLoginInput }, {})).rejects.toThrow(
        GraphQLError,
      );
    });

    test('should throw error for invalid password', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await expect(userResolvers.login({ input: validLoginInput }, {})).rejects.toThrow(
        GraphQLError,
      );
    });

    test('should throw error if JWT_SECRET is missing', async () => {
      delete process.env.JWT_SECRET;
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      await expect(userResolvers.login({ input: validLoginInput }, {})).rejects.toThrow(
        GraphQLError,
      );
    });

    test('should handle validation errors', async () => {
      const invalidInput = {
        email: 'invalid-email',
        password: '',
      };

      // Mock validation to throw ZodError
      const zodError = new Error('Validation failed');
      zodError.name = 'ZodError';
      zodError.issues = [{ message: 'Invalid input' }];
      mockValidators.LoginInputSchema.parse.mockImplementationOnce(() => {
        throw zodError;
      });

      await expect(userResolvers.login({ input: invalidInput }, {})).rejects.toThrow(GraphQLError);
    });
  });

  describe('me', () => {
    const userId = generateObjectId();
    const mockUser = createTestUser({ _id: userId });

    test('should return current user when authenticated', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.getUserById.mockResolvedValue(mockUser);

      const result = await userResolvers.me({}, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.getUserById).toHaveBeenCalledWith(userId);
      expect(mockHelpers.formatAuthUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(
        expect.objectContaining({
          id: userId,
          name: mockUser.name,
          email: mockUser.email,
        }),
      );
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(userResolvers.me({}, context)).rejects.toThrow('Not authenticated');
    });

    test('should handle database errors', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.getUserById.mockRejectedValue(new Error('Database error'));

      await expect(userResolvers.me({}, context)).rejects.toThrow('Database error');
    });
  });

  describe('myProfile', () => {
    const userId = generateObjectId();
    const mockUser = createTestUser({ _id: userId });

    test('should return current user profile when authenticated', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.getUserById.mockResolvedValue(mockUser);

      const result = await userResolvers.myProfile({}, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.getUserById).toHaveBeenCalledWith(userId);
      expect(mockHelpers.formatUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(
        expect.objectContaining({
          id: userId,
          name: mockUser.name,
          email: mockUser.email,
        }),
      );
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(userResolvers.myProfile({}, context)).rejects.toThrow('Not authenticated');
    });
  });

  describe('user', () => {
    const userId = generateObjectId();
    const targetUserId = generateObjectId();
    const mockUser = createTestUser({ _id: targetUserId });

    test('should return user by id when authenticated', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.getUserById.mockResolvedValue(mockUser);

      const result = await userResolvers.user({ id: targetUserId }, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.getUserById).toHaveBeenCalledWith(targetUserId);
      expect(mockHelpers.formatUser).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(
        expect.objectContaining({
          id: targetUserId,
          name: mockUser.name,
        }),
      );
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(userResolvers.user({ id: targetUserId }, context)).rejects.toThrow(
        'Not authenticated',
      );
    });
  });

  describe('users', () => {
    const userId = generateObjectId();
    const mockUsers = [
      createTestUser({ _id: generateObjectId() }),
      createTestUser({ _id: generateObjectId() }),
    ];

    test('should return all users when authenticated', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.listUsers.mockResolvedValue(mockUsers);

      const result = await userResolvers.users({}, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.listUsers).toHaveBeenCalled();
      expect(mockHelpers.formatUser).toHaveBeenCalledTimes(mockUsers.length);
      expect(result).toHaveLength(mockUsers.length);
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(userResolvers.users({}, context)).rejects.toThrow('Not authenticated');
    });
  });

  describe('updateMyProfile', () => {
    const userId = generateObjectId();
    const updateInput = {
      name: 'Updated Name',
      address: 'New Address',
      dob: '1990-01-01T00:00:00.000Z',
    };

    test('should update user profile successfully', async () => {
      const context = { req: createMockAuthRequest(userId) };
      const updatedUser = createTestUser({ _id: userId, ...updateInput });
      mockMongooseMethods.updateUserById.mockResolvedValue(updatedUser);

      const result = await userResolvers.updateMyProfile({ input: updateInput }, context);

      expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
      expect(mockMongooseMethods.updateUserById).toHaveBeenCalledWith(userId, {
        ...updateInput,
        dob: new Date(updateInput.dob),
      });
      expect(mockHelpers.formatUser).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(
        expect.objectContaining({
          id: userId,
          name: 'Updated Name',
        }),
      );
    });

    test('should throw error if user not found', async () => {
      const context = { req: createMockAuthRequest(userId) };
      mockMongooseMethods.updateUserById.mockResolvedValue(null);

      await expect(userResolvers.updateMyProfile({ input: updateInput }, context)).rejects.toThrow(
        GraphQLError,
      );
    });

    test('should throw error when not authenticated', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      await expect(userResolvers.updateMyProfile({ input: updateInput }, context)).rejects.toThrow(
        'Not authenticated',
      );
    });

    test('should handle validation errors', async () => {
      const context = { req: createMockAuthRequest(userId) };
      const invalidInput = {
        name: '', // Invalid empty name
      };

      // Mock validation to throw ZodError
      const zodError = new Error('Validation failed');
      zodError.name = 'ZodError';
      zodError.issues = [{ message: 'Invalid input' }];
      mockValidators.UpdateProfileInputSchema.parse.mockImplementation(() => {
        throw zodError;
      });

      await expect(userResolvers.updateMyProfile({ input: invalidInput }, context)).rejects.toThrow(
        GraphQLError,
      );
    });
  });
});
