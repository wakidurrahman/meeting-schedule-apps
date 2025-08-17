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
} as const;
