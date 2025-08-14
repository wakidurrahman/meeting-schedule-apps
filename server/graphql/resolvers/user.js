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
  /**
   * User Authentication functions
   *
   * Register: Create a new user
   * Login: Authenticate a user
   *
   */
  // Mutation resolvers
  register: async ({ input }, _context) => {
    try {
      console.log('Register input:', input);
      // step 01: validate the input by Zod schema
      RegisterInputSchema.parse(input);
      // step 02: extract the input destructuring
      const { name, email, password } = input;
      console.log('name', name);
      console.log('email', email);
      console.log('password', password);

      // step 03: check if the email is already in use
      const existing = await getUserByEmail(email);
      console.log('existing', existing);
      // step 04: if the email is already in use, throw an error
      if (existing) {
        throw new GraphQLError(MESSAGES.EMAIL_IN_USE, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }

      // step 05: hash the password using bcryptjs salt rounds
      const hashed = await bcrypt.hash(password, 12);
      // step 06: create the user with the hashed password
      console.log('hashed', hashed);
      const user = await createUser({ name, email, passwordHash: hashed });
      console.log('user', user);
      // step 07: return the user
      return formatAuthUser(user);
    } catch (err) {
      console.log('err---->', err);
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
      // step 01: validate the input by Zod schema
      LoginInputSchema.parse(input);
      // step 02: extract the input destructuring
      const { email, password } = input;

      // step 03: find the user by email
      const user = await findUserDocByEmail(email);
      // step 04: if the user is not found, throw an error
      if (!user) {
        throw new GraphQLError(MESSAGES.INVALID_CREDENTIALS, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }

      // step 05: compare the password with the hashed password
      const valid = await bcrypt.compare(password, user.password);
      // step 06: if the password is not valid, throw an error
      if (!valid) {
        throw new GraphQLError(MESSAGES.INVALID_CREDENTIALS, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }

      // step 07: check if the JWT_SECRET is set
      if (!process.env.JWT_SECRET) {
        throw new GraphQLError(MESSAGES.JWT_MISSING, {
          extensions: { code: ERROR_CODES.INTERNAL_SERVER_ERROR },
        });
      }

      // step 08: generate a JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      // step 09: return the token and user
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

  users: async (_args, context) => {
    try {
      // step 01: validate the user by requireAuth
      requireAuth(context);
      // step 02: get the users
      const users = await listUsers();
      // step 03: return the users
      return users.map(formatUser);
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
};

module.exports = userResolvers;
