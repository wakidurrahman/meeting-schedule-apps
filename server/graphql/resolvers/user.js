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
  findUserDocByEmail,
  createUser,
  updateUserById,
  listUsers,
} = require('../../utils/mongoose-methods');
const {
  RegisterInputSchema,
  LoginInputSchema,
  UpdateProfileInputSchema,
} = require('../../utils/validators');

/**
 * User-related GraphQL resolvers
 * Handles user authentication, profile management, and user queries
 */
const userResolvers = {
  // Query resolvers
  me: async (_args, context) => {
    try {
      const userId = requireAuth(context);
      const user = await getUserById(userId);
      return formatAuthUser(user);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  myProfile: async (_args, context) => {
    try {
      const userId = requireAuth(context);
      const user = await getUserById(userId);
      return formatUser(user);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  user: async ({ id }, context) => {
    try {
      requireAuth(context);
      const user = await getUserById(id);
      return formatUser(user);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  users: async (_args, context) => {
    try {
      requireAuth(context);
      const users = await listUsers();
      return users.map(formatUser);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  // Mutation resolvers
  register: async ({ input }, _context) => {
    try {
      RegisterInputSchema.parse(input);
      const { name, email, password } = input;

      const existing = await getUserByEmail(email);
      if (existing) {
        throw new GraphQLError(MESSAGES.EMAIL_IN_USE, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }

      const hashed = await bcrypt.hash(password, 12);
      const user = await createUser({ name, email, passwordHash: hashed });

      return formatAuthUser(user);
    } catch (err) {
      if (err.name === 'ZodError') {
        throw new GraphQLError(MESSAGES.VALIDATION_FAILED, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT, details: err.issues },
        });
      }
      handleUnexpectedError(err);
    }
  },

  login: async ({ input }, _context) => {
    try {
      LoginInputSchema.parse(input);
      const { email, password } = input;

      const user = await findUserDocByEmail(email);
      if (!user) {
        throw new GraphQLError(MESSAGES.INVALID_CREDENTIALS, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new GraphQLError(MESSAGES.INVALID_CREDENTIALS, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }

      if (!process.env.JWT_SECRET) {
        throw new GraphQLError(MESSAGES.JWT_MISSING, {
          extensions: { code: ERROR_CODES.INTERNAL_SERVER_ERROR },
        });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      return {
        token,
        user: formatAuthUser(user),
        tokenExpiration: null, // Add if needed
      };
    } catch (err) {
      if (err.name === 'ZodError') {
        throw new GraphQLError(MESSAGES.VALIDATION_FAILED, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT, details: err.issues },
        });
      }
      handleUnexpectedError(err);
    }
  },

  updateMyProfile: async ({ input }, context) => {
    try {
      const userId = requireAuth(context);
      UpdateProfileInputSchema.parse(input);

      const update = { ...input };
      if (update.dob) {
        update.dob = new Date(update.dob);
      }

      const user = await updateUserById(userId, update);
      if (!user) {
        throw new GraphQLError(MESSAGES.USER_NOT_FOUND, {
          extensions: { code: ERROR_CODES.NOT_FOUND },
        });
      }

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
};

module.exports = userResolvers;
