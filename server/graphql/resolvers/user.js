const bcrypt = require('bcryptjs');
const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');

const {
  requireAuth,
  handleUnexpectedError,
  formatAuthUser,
  formatUser,
} = require('../shared/helpers');

const { MESSAGES, ERROR_CODES } = require('../../constants/messages');
const {
  getUserById,
  getUserByEmail,
  updateUserById,
  listUsersFiltered,
  createUserWithRole,
  updateUserWithRole,
  deleteUserById,
} = require('../../utils/mongoose-methods');
const {
  UpdateProfileInputSchema,
  CreateUserInputSchema,
  UpdateUserInputSchema,
} = require('../../utils/validators');

/**
 * User-related GraphQL resolvers
 * Handles user authentication, profile management, and user queries
 */
const userResolvers = {
  /**
   * User Profile functions
   *
   * Me: Get the current user
   * MyProfile: Get the current user's profile
   * User: Get a user by id
   * Users: Get all users
   * UpdateMyProfile: Update the current user's profile
   */

  // Query resolvers for User
  me: async (_args, context) => {
    try {
      // step 01: validate the user by requireAuth
      const userId = requireAuth(context);
      // step 02: get the user by id
      const user = await getUserById(userId);
      // step 03: return the user
      return formatAuthUser(user);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  myProfile: async (_args, context) => {
    try {
      // step 01: validate the user by requireAuth
      const userId = requireAuth(context);
      // step 02: get the user by id
      const user = await getUserById(userId);
      // step 03: return the user
      return formatUser(user);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  user: async ({ id }, context) => {
    try {
      // step 01: validate the user by requireAuth
      requireAuth(context);
      // step 02: get the user by id
      const user = await getUserById(id);
      // step 03: return the user
      return formatUser(user);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  users: async ({ where, orderBy, pagination }, context) => {
    try {
      // step 01: validate the user by requireAuth
      requireAuth(context);
      // step 02: get the users with filtering, sorting, and pagination
      // TODO: properly need to validate the where, orderBy, pagination.
      // There are possibilities without proper validation there are chances of security issues.
      const result = await listUsersFiltered({ where, orderBy, pagination });
      // step 03: format and return the result
      return {
        usersList: result.usersList.map(formatUser),
        total: result.total,
        hasMore: result.hasMore,
      };
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  updateMyProfile: async ({ input }, context) => {
    try {
      // step 01: validate the input by Zod schema
      UpdateProfileInputSchema.parse(input);
      // step 02: extract the input destructuring
      const userId = requireAuth(context);

      // step 03: update the user
      const update = { ...input };
      if (update.dob) {
        update.dob = new Date(update.dob);
      }

      // step 04: update the user
      const user = await updateUserById(userId, update);
      // step 05: if the user is not found, throw an error
      if (!user) {
        throw new GraphQLError(MESSAGES.USER_NOT_FOUND, {
          extensions: { code: ERROR_CODES.NOT_FOUND },
        });
      }

      // step 06: return the user
      return formatUser(user);
    } catch (err) {
      if (err.name === 'ZodError') {
        throw new GraphQLError(MESSAGES.VALIDATION_FAILED, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT, details: err.issues },
        });
      }
      handleUnexpectedError(err);
    }
  },

  /**
   * User Management CRUD operations
   */

  createUser: async ({ input }, context) => {
    try {
      // step 01: validate the user by requireAuth
      requireAuth(context);
      // step 02: validate the input by Zod schema
      CreateUserInputSchema.parse(input);
      // step 03: check if the email is already in use
      const existing = await getUserByEmail(input.email);
      if (existing) {
        throw new GraphQLError(MESSAGES.EMAIL_IN_USE, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }
      // step 04: create the user
      const user = await createUserWithRole(input);
      // step 05: return the formatted user
      return formatUser(user);
    } catch (err) {
      if (err.name === 'ZodError') {
        throw new GraphQLError(MESSAGES.VALIDATION_FAILED, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT, details: err.issues },
        });
      }
      handleUnexpectedError(err);
    }
  },

  updateUser: async ({ id, input }, context) => {
    try {
      // step 01: validate the user by requireAuth
      requireAuth(context);
      // step 02: validate the input by Zod schema
      UpdateUserInputSchema.parse(input);
      // step 03: check if email is being changed and already exists
      if (input.email) {
        const existing = await getUserByEmail(input.email);
        if (existing && existing.id !== id) {
          throw new GraphQLError(MESSAGES.EMAIL_IN_USE, {
            extensions: { code: ERROR_CODES.BAD_USER_INPUT },
          });
        }
      }
      // step 04: update the user
      const user = await updateUserWithRole(id, input);
      if (!user) {
        throw new GraphQLError(MESSAGES.USER_NOT_FOUND, {
          extensions: { code: ERROR_CODES.NOT_FOUND },
        });
      }
      // step 05: return the formatted user
      return formatUser(user);
    } catch (err) {
      if (err.name === 'ZodError') {
        throw new GraphQLError(MESSAGES.VALIDATION_FAILED, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT, details: err.issues },
        });
      }
      handleUnexpectedError(err);
    }
  },

  deleteUser: async ({ id }, context) => {
    try {
      // step 01: validate the user by requireAuth
      requireAuth(context);
      // step 02: check if user exists
      const user = await getUserById(id);
      if (!user) {
        throw new GraphQLError(MESSAGES.USER_NOT_FOUND, {
          extensions: { code: ERROR_CODES.NOT_FOUND },
        });
      }
      // step 03: delete the user
      const success = await deleteUserById(id);
      return success;
    } catch (err) {
      handleUnexpectedError(err);
    }
  },
};

module.exports = userResolvers;
