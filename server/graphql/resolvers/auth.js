const bcrypt = require('bcryptjs');
const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');

const { handleUnexpectedError, formatAuthUser } = require('../shared/helpers');

const { MESSAGES, ERROR_CODES } = require('../../constants/messages');
const { getUserByEmail, findUserDocByEmail, createUser } = require('../../utils/mongoose-methods');
const { RegisterInputSchema, LoginInputSchema } = require('../../utils/validators');

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
      // step 01: validate the input by Zod schema
      RegisterInputSchema.parse(input);
      // step 02: extract the input destructuring
      const { name, email, password } = input;

      // step 03: check if the email is already in use
      const existing = await getUserByEmail(email);
      // step 04: if the email is already in use, throw an error
      if (existing) {
        throw new GraphQLError(MESSAGES.EMAIL_IN_USE, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }

      // step 05: hash the password using bcryptjs salt rounds
      const hashed = await bcrypt.hash(password, 12);
      // step 06: create the user with the hashed password
      const user = await createUser({ name, email, passwordHash: hashed });
      // step 07: return the user
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
      console.log('🔐 Login attempt started:', {
        email: input?.email || 'missing',
        passwordLength: input?.password?.length || 0,
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV,
      });

      // step 01: validate the input by Zod schema
      LoginInputSchema.parse(input);
      console.log('✅ Login input validation passed');
      // step 02: extract the input destructuring
      const { email, password } = input;

      // step 03: find the user by email
      const user = await findUserDocByEmail(email);
      console.log('🔍 Database query result:', {
        userFound: !!user,
        userId: user?.id || 'none',
        userEmail: user?.email || 'none',
        hasPasswordField: !!user?.password,
      });
      // step 04: if the user is not found, throw an error
      if (!user) {
        console.log('❌ User not found for email:', email);
        throw new GraphQLError(MESSAGES.INVALID_CREDENTIALS, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }

      // step 05: compare the password with the hashed password
      console.log('🔒 Password comparison starting...');
      const valid = await bcrypt.compare(password, user.password);
      console.log('🔒 Password comparison result:', { valid });
      // step 06: if the password is not valid, throw an error
      if (!valid) {
        console.log('❌ Invalid password for user:', email);
        throw new GraphQLError(MESSAGES.INVALID_CREDENTIALS, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      }

      // step 07: check if the JWT_SECRET is set
      console.log('🔑 JWT_SECRET check:', {
        hasSecret: !!process.env.JWT_SECRET,
        secretLength: process.env.JWT_SECRET?.length || 0,
      });
      if (!process.env.JWT_SECRET) {
        console.log('❌ JWT_SECRET missing!');
        throw new GraphQLError(MESSAGES.JWT_MISSING, {
          extensions: { code: ERROR_CODES.INTERNAL_SERVER_ERROR },
        });
      }

      // step 08: generate a JWT token
      console.log('🎫 Generating JWT token...');
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
      console.log('✅ JWT token generated successfully');

      // step 09: return the token and user
      console.log('🎉 Login successful for user:', email);
      return {
        token,
        user: formatAuthUser(user),
        tokenExpiration: null, // Add if needed
      };
    } catch (err) {
      console.log('💥 Login error caught:', {
        errorName: err.name,
        errorMessage: err.message,
        isZodError: err.name === 'ZodError',
        isGraphQLError: err.name === 'GraphQLError',
      });
      if (err.name === 'ZodError') {
        console.log('❌ Zod validation error details:', err.issues);
        throw new GraphQLError(MESSAGES.VALIDATION_FAILED, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT, details: err.issues },
        });
      }

      // Re-throw GraphQL errors as-is
      if (err.name === 'GraphQLError') {
        throw err;
      }

      console.log('💥 Unexpected login error:', err);
      handleUnexpectedError(err);
    }
  },
};

module.exports = userResolvers;
