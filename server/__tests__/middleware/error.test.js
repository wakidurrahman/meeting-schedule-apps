/**
 * Error Middleware Tests
 * Tests for error handling and normalization middleware
 * Tests various error types, status codes, and response formatting
 */

const { errorHandler, normalizeError } = require('../../middleware/error');

describe('Error Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    // Mock request, response, and next function
    req = {
      id: 'test-request-id-123',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('normalizeError', () => {
    test('should normalize MongoDB duplicate key error', () => {
      const mongoError = {
        code: 11000,
        keyValue: { email: 'test@example.com' },
        message: 'Duplicate key error',
      };

      const normalized = normalizeError(mongoError);

      expect(normalized).toEqual({
        message: expect.stringContaining('already exists'),
        status: 409,
        code: 'CONFLICT',
        details: { email: 'test@example.com' },
      });
    });

    test('should normalize Zod validation error', () => {
      const zodError = {
        name: 'ZodError',
        issues: [
          { message: 'Invalid email format', path: ['email'] },
          { message: 'Password too short', path: ['password'] },
        ],
      };

      const normalized = normalizeError(zodError);

      expect(normalized).toEqual({
        message: expect.stringContaining('Validation failed'),
        status: 400,
        code: 'BAD_USER_INPUT',
        details: zodError.issues,
      });
    });

    test('should normalize GraphQL BAD_USER_INPUT error', () => {
      const graphqlError = {
        message: 'Invalid input provided',
        extensions: {
          code: 'BAD_USER_INPUT',
          details: { field: 'email', reason: 'invalid format' },
        },
      };

      const normalized = normalizeError(graphqlError);

      expect(normalized).toEqual({
        message: 'Invalid input provided',
        status: 400,
        code: 'BAD_USER_INPUT',
        details: { field: 'email', reason: 'invalid format' },
      });
    });

    test('should normalize GraphQL UNAUTHENTICATED error', () => {
      const graphqlError = {
        message: 'Not authenticated',
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      };

      const normalized = normalizeError(graphqlError);

      expect(normalized).toEqual({
        message: 'Not authenticated',
        status: 401,
        code: 'UNAUTHENTICATED',
        details: undefined,
      });
    });

    test('should normalize GraphQL FORBIDDEN error', () => {
      const graphqlError = {
        message: 'Access denied',
        extensions: {
          code: 'FORBIDDEN',
        },
      };

      const normalized = normalizeError(graphqlError);

      expect(normalized).toEqual({
        message: 'Access denied',
        status: 403,
        code: 'FORBIDDEN',
        details: undefined,
      });
    });

    test('should normalize GraphQL NOT_FOUND error', () => {
      const graphqlError = {
        message: 'Resource not found',
        extensions: {
          code: 'NOT_FOUND',
        },
      };

      const normalized = normalizeError(graphqlError);

      expect(normalized).toEqual({
        message: 'Resource not found',
        status: 404,
        code: 'NOT_FOUND',
        details: undefined,
      });
    });

    test('should normalize unknown GraphQL error code', () => {
      const graphqlError = {
        message: 'Unknown error',
        extensions: {
          code: 'UNKNOWN_CODE',
        },
      };

      const normalized = normalizeError(graphqlError);

      expect(normalized).toEqual({
        message: 'Unknown error',
        status: 500,
        code: 'UNKNOWN_CODE',
        details: undefined,
      });
    });

    test('should normalize generic error with message', () => {
      const genericError = {
        message: 'Something went wrong',
      };

      const normalized = normalizeError(genericError);

      expect(normalized).toEqual({
        message: 'Something went wrong',
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    test('should normalize error without message', () => {
      const noMessageError = {};

      const normalized = normalizeError(noMessageError);

      expect(normalized).toEqual({
        message: expect.stringContaining('Internal server error'),
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    test('should handle null error', () => {
      const normalized = normalizeError(null);

      expect(normalized).toEqual({
        message: expect.stringContaining('Internal server error'),
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    test('should handle undefined error', () => {
      const normalized = normalizeError(undefined);

      expect(normalized).toEqual({
        message: expect.stringContaining('Internal server error'),
        status: 500,
        code: 'INTERNAL_SERVER_ERROR',
      });
    });

    test('should prioritize MongoDB error over generic message', () => {
      const mongoError = {
        code: 11000,
        message: 'Generic MongoDB error message',
        keyValue: { username: 'johndoe' },
      };

      const normalized = normalizeError(mongoError);

      expect(normalized.message).not.toBe('Generic MongoDB error message');
      expect(normalized.code).toBe('CONFLICT');
      expect(normalized.status).toBe(409);
    });

    test('should prioritize Zod error over generic message', () => {
      const zodError = {
        name: 'ZodError',
        message: 'Generic Zod error message',
        issues: [{ message: 'Required field missing', path: ['name'] }],
      };

      const normalized = normalizeError(zodError);

      expect(normalized.message).not.toBe('Generic Zod error message');
      expect(normalized.code).toBe('BAD_USER_INPUT');
      expect(normalized.status).toBe(400);
    });
  });

  describe('errorHandler', () => {
    test('should handle MongoDB duplicate key error', () => {
      const mongoError = {
        code: 11000,
        keyValue: { email: 'test@example.com' },
      };

      errorHandler(mongoError, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('already exists'),
        code: 'CONFLICT',
        requestId: 'test-request-id-123',
        details: { email: 'test@example.com' },
      });
    });

    test('should handle Zod validation error', () => {
      const zodError = {
        name: 'ZodError',
        issues: [{ message: 'Invalid email', path: ['email'] }],
      };

      errorHandler(zodError, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('Validation failed'),
        code: 'BAD_USER_INPUT',
        requestId: 'test-request-id-123',
        details: zodError.issues,
      });
    });

    test('should handle GraphQL authentication error', () => {
      const authError = {
        message: 'Not authenticated',
        extensions: {
          code: 'UNAUTHENTICATED',
        },
      };

      errorHandler(authError, req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Not authenticated',
        code: 'UNAUTHENTICATED',
        requestId: 'test-request-id-123',
      });
    });

    test('should handle GraphQL authorization error', () => {
      const forbiddenError = {
        message: 'Access forbidden',
        extensions: {
          code: 'FORBIDDEN',
          details: { reason: 'insufficient permissions' },
        },
      };

      errorHandler(forbiddenError, req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Access forbidden',
        code: 'FORBIDDEN',
        requestId: 'test-request-id-123',
        details: { reason: 'insufficient permissions' },
      });
    });

    test('should handle generic server error', () => {
      const genericError = {
        message: 'Something went wrong',
      };

      errorHandler(genericError, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Something went wrong',
        code: 'INTERNAL_SERVER_ERROR',
        requestId: 'test-request-id-123',
      });
    });

    test('should include requestId from request', () => {
      req.id = 'custom-request-id-456';

      const error = { message: 'Test error' };

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: 'custom-request-id-456',
        }),
      );
    });

    test('should handle missing requestId gracefully', () => {
      delete req.id;

      const error = { message: 'Test error' };

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          requestId: undefined,
        }),
      );
    });

    test('should not include details when not present', () => {
      const error = { message: 'Simple error' };

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        error: 'Simple error',
        code: 'INTERNAL_SERVER_ERROR',
        requestId: 'test-request-id-123',
      });
    });

    test('should include details when present', () => {
      const error = {
        message: 'Validation error',
        extensions: {
          code: 'BAD_USER_INPUT',
          details: {
            field: 'email',
            value: 'invalid-email',
            message: 'Must be valid email format',
          },
        },
      };

      errorHandler(error, req, res, next);

      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation error',
        code: 'BAD_USER_INPUT',
        requestId: 'test-request-id-123',
        details: {
          field: 'email',
          value: 'invalid-email',
          message: 'Must be valid email format',
        },
      });
    });

    test('should handle JavaScript Error objects', () => {
      const jsError = new Error('JavaScript runtime error');
      jsError.stack = 'Error: JavaScript runtime error\n    at test.js:10:5';

      errorHandler(jsError, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'JavaScript runtime error',
        code: 'INTERNAL_SERVER_ERROR',
        requestId: 'test-request-id-123',
      });
    });

    test('should handle network and database connection errors', () => {
      const networkError = {
        message: 'ECONNREFUSED',
        code: 'ECONNREFUSED',
        errno: -61,
        syscall: 'connect',
      };

      errorHandler(networkError, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'ECONNREFUSED',
        code: 'INTERNAL_SERVER_ERROR',
        requestId: 'test-request-id-123',
      });
    });
  });

  describe('Error Response Format', () => {
    test('should always include required fields in error response', () => {
      const error = { message: 'Test error' };

      errorHandler(error, req, res, next);

      const responseCall = res.json.mock.calls[0][0];

      expect(responseCall).toHaveProperty('error');
      expect(responseCall).toHaveProperty('code');
      expect(responseCall).toHaveProperty('requestId');
      expect(typeof responseCall.error).toBe('string');
      expect(typeof responseCall.code).toBe('string');
    });

    test('should maintain consistent response structure across error types', () => {
      const errors = [
        { code: 11000, keyValue: { id: 1 } }, // MongoDB
        { name: 'ZodError', issues: [] }, // Zod
        { message: 'Auth error', extensions: { code: 'UNAUTHENTICATED' } }, // GraphQL
        { message: 'Generic error' }, // Generic
      ];

      errors.forEach((error, index) => {
        res.status.mockClear();
        res.json.mockClear();

        errorHandler(error, req, res, next);

        const responseCall = res.json.mock.calls[0][0];

        expect(responseCall).toHaveProperty('error');
        expect(responseCall).toHaveProperty('code');
        expect(responseCall).toHaveProperty('requestId');
        expect(res.status).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledTimes(1);
      });
    });
  });
});
