const { HTTP_STATUS, ERROR_CODES, MESSAGES } = require('../constants/messages');

// Normalize various error shapes (GraphQL, Mongoose, Zod, generic) to a consistent shape
function normalizeError(err) {
  // Mongoose duplicate key
  if (err && err.code === 11000) {
    return {
      message: MESSAGES.DUPLICATE_KEY,
      status: HTTP_STATUS.CONFLICT,
      code: ERROR_CODES.CONFLICT,
      details: err.keyValue,
    };
  }

  // Zod (server side validation)
  if (err && err.name === 'ZodError') {
    return {
      message: MESSAGES.VALIDATION_FAILED,
      status: HTTP_STATUS.BAD_REQUEST,
      code: ERROR_CODES.BAD_USER_INPUT,
      details: err.issues,
    };
  }

  // GraphQL error with extensions
  if (err && err.extensions && err.extensions.code) {
    const code = err.extensions.code;
    const status =
      code === ERROR_CODES.BAD_USER_INPUT
        ? HTTP_STATUS.BAD_REQUEST
        : code === ERROR_CODES.UNAUTHENTICATED
        ? HTTP_STATUS.UNAUTHORIZED
        : code === ERROR_CODES.FORBIDDEN
        ? HTTP_STATUS.FORBIDDEN
        : code === ERROR_CODES.NOT_FOUND
        ? HTTP_STATUS.NOT_FOUND
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;
    return {
      message: err.message || MESSAGES.INTERNAL_ERROR,
      status,
      code,
      details: err.extensions.details,
    };
  }

  // Fallback
  return {
    message: err?.message || MESSAGES.INTERNAL_ERROR,
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: ERROR_CODES.INTERNAL_SERVER_ERROR,
  };
}

// Express error handler middleware
function errorHandler(err, req, res, _next) {
  const n = normalizeError(err);
  const payload = {
    error: n.message,
    code: n.code,
    requestId: req.id,
  };
  if (n.details) payload.details = n.details;
  res.status(n.status).json(payload);
}

module.exports = { errorHandler, normalizeError };


