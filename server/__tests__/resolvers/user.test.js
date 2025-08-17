/**
 * User Resolver Tests
 * Comprehensive tests for all user-related GraphQL resolvers
 * Tests authentication, validation, error handling, business logic, and new CRUD operations
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
const { USER_ROLE } = require('../../constants/const');

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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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

    mockValidators.CreateUserInputSchema = {
      parse: jest.fn().mockImplementation((input) => input),
    };

    mockValidators.UpdateUserInputSchema = {
      parse: jest.fn().mockImplementation((input) => input),
    };
  });

  describe('Authentication Resolvers', () => {
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
    });
  });

  describe('Profile Management Resolvers', () => {
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

        await expect(
          userResolvers.updateMyProfile({ input: updateInput }, context),
        ).rejects.toThrow(GraphQLError);
      });
    });
  });

  describe('User Management CRUD Resolvers', () => {
    describe('users', () => {
      const userId = generateObjectId();
      const mockUsersResult = {
        usersList: [
          createTestUser({ _id: generateObjectId(), name: 'Alice', role: USER_ROLE.USER }),
          createTestUser({ _id: generateObjectId(), name: 'Bob', role: USER_ROLE.ADMIN }),
        ],
        total: 2,
        hasMore: false,
      };

      test('should return filtered users with default parameters', async () => {
        const context = { req: createMockAuthRequest(userId) };
        mockMongooseMethods.listUsersFiltered.mockResolvedValue(mockUsersResult);

        const result = await userResolvers.users({}, context);

        expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
        expect(mockMongooseMethods.listUsersFiltered).toHaveBeenCalledWith({
          where: undefined,
          orderBy: undefined,
          pagination: undefined,
        });
        expect(mockHelpers.formatUser).toHaveBeenCalledTimes(2);
        expect(result).toEqual({
          usersList: expect.arrayContaining([
            expect.objectContaining({ name: 'Alice' }),
            expect.objectContaining({ name: 'Bob' }),
          ]),
          total: 2,
          hasMore: false,
        });
      });

      test('should return filtered users with search and role filter', async () => {
        const context = { req: createMockAuthRequest(userId) };
        const variables = {
          where: { search: 'alice', role: USER_ROLE.USER },
          orderBy: { field: 'NAME', direction: 'ASC' },
          pagination: { limit: 10, offset: 0 },
        };

        const filteredResult = {
          usersList: [mockUsersResult.usersList[0]], // Only Alice
          total: 1,
          hasMore: false,
        };

        mockMongooseMethods.listUsersFiltered.mockResolvedValue(filteredResult);

        const result = await userResolvers.users(variables, context);

        expect(mockMongooseMethods.listUsersFiltered).toHaveBeenCalledWith(variables);
        expect(result).toEqual({
          usersList: expect.arrayContaining([expect.objectContaining({ name: 'Alice' })]),
          total: 1,
          hasMore: false,
        });
      });

      test('should handle pagination correctly', async () => {
        const context = { req: createMockAuthRequest(userId) };
        const variables = {
          pagination: { limit: 1, offset: 0 },
        };

        const paginatedResult = {
          usersList: [mockUsersResult.usersList[0]],
          total: 2,
          hasMore: true,
        };

        mockMongooseMethods.listUsersFiltered.mockResolvedValue(paginatedResult);

        const result = await userResolvers.users(variables, context);

        expect(result.hasMore).toBe(true);
        expect(result.total).toBe(2);
        expect(result.usersList).toHaveLength(1);
      });

      test('should throw error when not authenticated', async () => {
        const context = { req: createMockUnauthRequest() };
        mockHelpers.requireAuth.mockImplementation(() => {
          throw new GraphQLError('Not authenticated');
        });

        await expect(userResolvers.users({}, context)).rejects.toThrow('Not authenticated');
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

    describe('createUser', () => {
      const userId = generateObjectId();
      const createUserInput = {
        name: 'New User',
        email: 'newuser@example.com',
        role: USER_ROLE.USER,
        imageUrl: 'https://example.com/avatar.jpg',
      };

      test('should create user successfully', async () => {
        const context = { req: createMockAuthRequest(userId) };
        const createdUser = createTestUser({
          _id: generateObjectId(),
          ...createUserInput,
        });

        mockMongooseMethods.getUserByEmail.mockResolvedValue(null);
        mockMongooseMethods.createUserWithRole.mockResolvedValue(createdUser);

        const result = await userResolvers.createUser({ input: createUserInput }, context);

        expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
        expect(mockValidators.CreateUserInputSchema.parse).toHaveBeenCalledWith(createUserInput);
        expect(mockMongooseMethods.getUserByEmail).toHaveBeenCalledWith('newuser@example.com');
        expect(mockMongooseMethods.createUserWithRole).toHaveBeenCalledWith(createUserInput);
        expect(mockHelpers.formatUser).toHaveBeenCalledWith(createdUser);
        expect(result).toEqual(
          expect.objectContaining({
            name: 'New User',
            email: 'newuser@example.com',
            role: USER_ROLE.USER,
          }),
        );
      });

      test('should throw error if email already exists', async () => {
        const context = { req: createMockAuthRequest(userId) };
        mockMongooseMethods.getUserByEmail.mockResolvedValue(createTestUser());

        await expect(userResolvers.createUser({ input: createUserInput }, context)).rejects.toThrow(
          GraphQLError,
        );

        expect(mockMongooseMethods.createUserWithRole).not.toHaveBeenCalled();
      });

      test('should throw validation error for invalid input', async () => {
        const context = { req: createMockAuthRequest(userId) };
        const invalidInput = {
          name: '',
          email: 'invalid-email',
        };

        const zodError = new Error('Validation failed');
        zodError.name = 'ZodError';
        zodError.issues = [{ message: 'Invalid input' }];
        mockValidators.CreateUserInputSchema.parse.mockImplementationOnce(() => {
          throw zodError;
        });

        await expect(userResolvers.createUser({ input: invalidInput }, context)).rejects.toThrow(
          GraphQLError,
        );
      });

      test('should throw error when not authenticated', async () => {
        const context = { req: createMockUnauthRequest() };
        mockHelpers.requireAuth.mockImplementation(() => {
          throw new GraphQLError('Not authenticated');
        });

        await expect(userResolvers.createUser({ input: createUserInput }, context)).rejects.toThrow(
          'Not authenticated',
        );
      });
    });

    describe('updateUser', () => {
      const userId = generateObjectId();
      const targetUserId = generateObjectId();
      const updateUserInput = {
        name: 'Updated User',
        email: 'updated@example.com',
        role: USER_ROLE.ADMIN,
      };

      test('should update user successfully', async () => {
        const context = { req: createMockAuthRequest(userId) };
        const updatedUser = createTestUser({
          _id: targetUserId,
          ...updateUserInput,
        });

        mockMongooseMethods.getUserByEmail.mockResolvedValue(null);
        mockMongooseMethods.updateUserWithRole.mockResolvedValue(updatedUser);

        const result = await userResolvers.updateUser(
          { id: targetUserId, input: updateUserInput },
          context,
        );

        expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
        expect(mockValidators.UpdateUserInputSchema.parse).toHaveBeenCalledWith(updateUserInput);
        expect(mockMongooseMethods.getUserByEmail).toHaveBeenCalledWith('updated@example.com');
        expect(mockMongooseMethods.updateUserWithRole).toHaveBeenCalledWith(
          targetUserId,
          updateUserInput,
        );
        expect(mockHelpers.formatUser).toHaveBeenCalledWith(updatedUser);
        expect(result).toEqual(
          expect.objectContaining({
            name: 'Updated User',
            email: 'updated@example.com',
            role: USER_ROLE.ADMIN,
          }),
        );
      });

      test('should throw error if email already exists for different user', async () => {
        const context = { req: createMockAuthRequest(userId) };
        const existingUser = createTestUser({ _id: generateObjectId() }); // Different ID

        mockMongooseMethods.getUserByEmail.mockResolvedValue(existingUser);

        await expect(
          userResolvers.updateUser({ id: targetUserId, input: updateUserInput }, context),
        ).rejects.toThrow(GraphQLError);

        expect(mockMongooseMethods.updateUserWithRole).not.toHaveBeenCalled();
      });

      test('should allow email update for same user', async () => {
        const context = { req: createMockAuthRequest(userId) };
        const existingUser = createTestUser({ id: targetUserId }); // Same ID
        const updatedUser = createTestUser({ _id: targetUserId, ...updateUserInput });

        mockMongooseMethods.getUserByEmail.mockResolvedValue(existingUser);
        mockMongooseMethods.updateUserWithRole.mockResolvedValue(updatedUser);

        const result = await userResolvers.updateUser(
          { id: targetUserId, input: updateUserInput },
          context,
        );

        expect(mockMongooseMethods.updateUserWithRole).toHaveBeenCalled();
        expect(result).toEqual(expect.objectContaining({ name: 'Updated User' }));
      });

      test('should throw error if user not found', async () => {
        const context = { req: createMockAuthRequest(userId) };
        mockMongooseMethods.getUserByEmail.mockResolvedValue(null);
        mockMongooseMethods.updateUserWithRole.mockResolvedValue(null);

        await expect(
          userResolvers.updateUser({ id: targetUserId, input: updateUserInput }, context),
        ).rejects.toThrow(GraphQLError);
      });

      test('should handle validation errors', async () => {
        const context = { req: createMockAuthRequest(userId) };
        const invalidInput = {
          name: '',
          email: 'invalid-email',
        };

        const zodError = new Error('Validation failed');
        zodError.name = 'ZodError';
        zodError.issues = [{ message: 'Invalid input' }];
        mockValidators.UpdateUserInputSchema.parse.mockImplementationOnce(() => {
          throw zodError;
        });

        await expect(
          userResolvers.updateUser({ id: targetUserId, input: invalidInput }, context),
        ).rejects.toThrow(GraphQLError);
      });
    });

    describe('deleteUser', () => {
      const userId = generateObjectId();
      const targetUserId = generateObjectId();

      test('should delete user successfully', async () => {
        const context = { req: createMockAuthRequest(userId) };
        const existingUser = createTestUser({ _id: targetUserId });

        mockMongooseMethods.getUserById.mockResolvedValue(existingUser);
        mockMongooseMethods.deleteUserById.mockResolvedValue(true);

        const result = await userResolvers.deleteUser({ id: targetUserId }, context);

        expect(mockHelpers.requireAuth).toHaveBeenCalledWith(context);
        expect(mockMongooseMethods.getUserById).toHaveBeenCalledWith(targetUserId);
        expect(mockMongooseMethods.deleteUserById).toHaveBeenCalledWith(targetUserId);
        expect(result).toBe(true);
      });

      test('should throw error if user not found', async () => {
        const context = { req: createMockAuthRequest(userId) };
        mockMongooseMethods.getUserById.mockResolvedValue(null);

        await expect(userResolvers.deleteUser({ id: targetUserId }, context)).rejects.toThrow(
          GraphQLError,
        );

        expect(mockMongooseMethods.deleteUserById).not.toHaveBeenCalled();
      });

      test('should throw error when not authenticated', async () => {
        const context = { req: createMockUnauthRequest() };
        mockHelpers.requireAuth.mockImplementation(() => {
          throw new GraphQLError('Not authenticated');
        });

        await expect(userResolvers.deleteUser({ id: targetUserId }, context)).rejects.toThrow(
          'Not authenticated',
        );
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle unexpected database errors', async () => {
      const userId = generateObjectId();
      const context = { req: createMockAuthRequest(userId) };
      const dbError = new Error('Database connection failed');

      mockMongooseMethods.getUserById.mockRejectedValue(dbError);
      mockHelpers.handleUnexpectedError.mockImplementation((err) => {
        throw err;
      });

      await expect(userResolvers.me({}, context)).rejects.toThrow('Database connection failed');
    });

    test('should handle validation errors consistently', async () => {
      const userId = generateObjectId();
      const context = { req: createMockAuthRequest(userId) };

      const zodError = new Error('Validation failed');
      zodError.name = 'ZodError';
      zodError.issues = [{ message: 'Name is required' }];

      mockValidators.CreateUserInputSchema.parse.mockImplementationOnce(() => {
        throw zodError;
      });

      await expect(
        userResolvers.createUser({ input: { name: '', email: 'test@example.com' } }, context),
      ).rejects.toThrow(GraphQLError);
    });

    test('should handle authentication errors consistently', async () => {
      const context = { req: createMockUnauthRequest() };
      mockHelpers.requireAuth.mockImplementation(() => {
        throw new GraphQLError('Not authenticated');
      });

      // Test multiple resolvers for consistent auth error handling
      await expect(userResolvers.me({}, context)).rejects.toThrow('Not authenticated');
      await expect(userResolvers.users({}, context)).rejects.toThrow('Not authenticated');
      await expect(userResolvers.createUser({ input: {} }, context)).rejects.toThrow(
        'Not authenticated',
      );
    });
  });
});
