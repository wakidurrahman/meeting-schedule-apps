export const ValidationMessages = {
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

  // Meeting validation
  titleRequired: 'Meeting title is required',
  titleTooLong: 'Meeting title is too long',
  titleVeryLong: 'Meeting title is very long',
  descriptionVeryLong: 'Meeting description is very long',

  // Time validation
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

  // Date and time validation
  invalidStartTime: 'Invalid startTime',
  invalidEndTime: 'Invalid endTime',
  startBeforeEnd: 'startTime must be before endTime',
  invalidDob: 'Invalid dob',
  invalidAttendeeId: 'Invalid attendee id',

  // Generic validation messages
  validationFailed: 'Validation failed',
  required: 'This field is required',

  // Context error messages
  mustBeUsedWithinProvider: 'must be used within a Provider',
  requiresAuthenticatedUser: 'requires an authenticated user',
  requiresAuthenticatedToken: 'requires an authenticated token',
} as const;

// Error Messages for different contexts
export const ErrorMessages = {
  // Context errors
  useToastProvider: 'useToast must be used within a ToastProvider',
  useAuthProvider: 'useAuthContext must be used within AuthProvider',
  requiresUser: 'useAuthUser requires an authenticated user',
  requiresToken: 'useAuthToken requires an authenticated token',
} as const;
