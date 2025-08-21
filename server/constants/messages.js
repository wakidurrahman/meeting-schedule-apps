/**
 * Centralized error/message catalog and status mapping.
 * @property {Object} HTTP_STATUS - HTTP status codes.
 * @property {Object} ERROR_CODES - Error codes.
 * @property {Object} MESSAGES - Error messages.
 * @property {Object} VALIDATION_MESSAGES - Validation messages.
 */

const HTTP_STATUS = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

const ERROR_CODES = {
  BAD_USER_INPUT: 'BAD_USER_INPUT',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};

const MESSAGES = {
  // Generic
  VALIDATION_FAILED: 'Validation failed',
  NOT_AUTHENTICATED: 'Not authenticated',
  FORBIDDEN: 'Forbidden',
  NOT_FOUND: 'Resource not found',
  DUPLICATE_KEY: 'Duplicate key violation',
  INTERNAL_ERROR: 'An unexpected error occurred',

  // Auth
  INVALID_CREDENTIALS: 'Invalid credentials',
  EMAIL_IN_USE: 'Email already in use',
  JWT_MISSING: 'Server misconfiguration: JWT secret missing',

  // Domain
  USER_NOT_FOUND: 'User not found',
  MEETING_NOT_FOUND: 'Meeting not found',
  EVENT_NOT_FOUND: 'Event not found',
  BOOKING_NOT_FOUND: 'Booking not found',

  // DB
  DB_URI_MISSING: 'MONGO_URI is not set',
  DB_CONNECTION_FAILED: 'Failed to connect to the database',
};

// Server-side validation message catalog (Zod)
const VALIDATION_MESSAGES = {
  nameRequired: 'Name is required',
  nameMin: 'Name must be at least 2 characters',
  nameMax: 'Name must be less than 50 characters',
  namePattern: 'Name can only contain letters, spaces, hyphens, and apostrophes',

  emailInvalid: 'Invalid email format',

  passwordMin: 'Password must be at least 8 characters',
  passwordComplexity:
    'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',

  // Enhanced password validation messages
  passwordRequired: 'Password is required',
  passwordTooShort: 'Password must be at least 8 characters long',
  passwordTooLong: 'Password must be at most 50 characters long',
  passwordNoWhitespace: 'Password cannot contain spaces',
  passwordMissingDigits: 'Password must contain at least one number',
  passwordMissingUppercase: 'Password must contain at least one uppercase letter',
  passwordMissingLowercase: 'Password must contain at least one lowercase letter',
  passwordMissingSpecial: 'Password must contain at least one special character (@$!%*?&)',

  // URL validation
  invalidUrl: 'Please enter a valid URL',

  // Role validation
  roleRequired: 'Role is required',
  roleInvalid: 'Role must be either ADMIN or USER',

  // Date and time validation
  invalidStartTime: 'Invalid startTime',
  invalidEndTime: 'Invalid endTime',
  invalidAttendeeId: 'Invalid attendee id',
  startBeforeEnd: 'startTime must be before endTime',
  invalidDob: 'Invalid dob',

  // Generic validation messages
  required: 'This field is required',
  titleRequired: 'Title is required',
  titleMin: 'Title must be at least 1 character',
  titleTooLong: 'Meeting title is too long',
  nameMinProfile: 'Name must be at least 2 characters',

  // Meeting validation messages
  titleVeryLong: 'Meeting title is very long',
  descriptionVeryLong: 'Meeting description is very long',
  startTimeRequired: 'Start time is required',
  endTimeRequired: 'End time is required',
  endTimeAfterStart: 'End time must be after start time',
  meetingDurationRange: 'Meeting duration must be between 5 minutes and 8 hours',

  // Business rule warnings
  meetingDurationShort: 'Meeting duration is very short (less than 5 minutes)',
  meetingDurationLong: 'Meeting duration is very long (more than 8 hours)',
  meetingInPast: 'Meeting is scheduled in the past',
  meetingOnWeekend: 'Meeting is scheduled for a weekend',
  meetingOffHours: 'Meeting is scheduled outside business hours',
};

module.exports = { HTTP_STATUS, ERROR_CODES, MESSAGES, VALIDATION_MESSAGES };
