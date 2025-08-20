import { z } from 'zod';

import {
  EMAIL_REGEX,
  NAME_REGEX,
  SORT_DIRECTION_ENUM,
  SORT_FIELD_ENUM,
  USER_ROLE_ENUM,
  USER_SEARCH_ROLE_ENUM,
} from '@/constants/const';
import { ValidationMessages as VM } from '@/constants/messages';

/**
 * Password validation error messages
 * These are displayed to the user when password validation fails
 */
export const passwordValidationErrors = {
  required: VM.passwordRequired,
  too_short: VM.passwordTooShort,
  too_long: VM.passwordTooLong,
  no_whitespace: VM.passwordNoWhitespace,
  missing_digits: VM.passwordMissingDigits,
  missing_uppercase: VM.passwordMissingUppercase,
  missing_lowercase: VM.passwordMissingLowercase,
  missing_special: VM.passwordMissingSpecial,
} as const;

/**
 * Validates a password against security requirements
 * @param password - The password to validate
 * @returns Array of error messages for failed validations
 */
export const validatePassword = (password: string): string[] => {
  if (!password) {
    return [passwordValidationErrors.required];
  }

  // Define validation rules as an array of {test, errorMessage} pairs
  const validationRules = [
    {
      test: (pwd: string) => pwd.length < 8,
      errorMessage: passwordValidationErrors.too_short,
    },
    {
      test: (pwd: string) => pwd.length > 50,
      errorMessage: passwordValidationErrors.too_long,
    },
    {
      test: (pwd: string) => /\s/.test(pwd),
      errorMessage: passwordValidationErrors.no_whitespace,
    },
    {
      test: (pwd: string) => !/\d/.test(pwd),
      errorMessage: passwordValidationErrors.missing_digits,
    },
    {
      test: (pwd: string) => !/[A-Z]/.test(pwd),
      errorMessage: passwordValidationErrors.missing_uppercase,
    },
    {
      test: (pwd: string) => !/[a-z]/.test(pwd),
      errorMessage: passwordValidationErrors.missing_lowercase,
    },
    {
      test: (pwd: string) => !/[@$!%*?&]/.test(pwd),
      errorMessage: passwordValidationErrors.missing_special,
    },
  ];

  // Apply all rules and collect error messages
  return validationRules.filter((rule) => rule.test(password)).map((rule) => rule.errorMessage);
};

// Register schema
export const RegisterSchema = z.object({
  name: z
    .string()
    .min(1, VM.nameRequired)
    .min(2, VM.nameMin)
    .max(50, VM.nameMax)
    .regex(NAME_REGEX, VM.namePattern)
    .transform((str) => str.trim()),
  email: z.string().regex(EMAIL_REGEX, VM.emailInvalid),
  password: z
    .string()
    .min(1, VM.passwordRequired)
    .min(8, VM.passwordTooShort)
    .max(50, VM.passwordTooLong)
    .refine((val) => !/\s/.test(val), {
      message: VM.passwordNoWhitespace,
    })
    .refine((val) => /\d/.test(val), {
      message: VM.passwordMissingDigits,
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: VM.passwordMissingUppercase,
    })
    .refine((val) => /[a-z]/.test(val), {
      message: VM.passwordMissingLowercase,
    })
    .refine((val) => /[@$!%*?&]/.test(val), {
      message: VM.passwordMissingSpecial,
    }),
});

// Login schema
export const LoginSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, VM.emailInvalid),
  password: z.string().min(8, VM.passwordMin), // Example password base on the following regex: e.g. Zain123@, Min_123$
});

// User management schemas
export const CreateUserSchema = z.object({
  name: z
    .string()
    .min(1, VM.nameRequired)
    .min(2, VM.nameMin)
    .max(50, VM.nameMax)
    .regex(NAME_REGEX, VM.namePattern)
    .transform((str) => str.trim()),
  email: z.string().regex(EMAIL_REGEX, VM.emailInvalid),
  imageUrl: z.string().url(VM.invalidUrl).optional().or(z.literal('')),
  role: z.enum(USER_ROLE_ENUM, {
    required_error: VM.roleRequired,
    invalid_type_error: VM.roleInvalid,
  }),
});

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(1, VM.nameRequired)
    .min(2, VM.nameMin)
    .max(50, VM.nameMax)
    .regex(NAME_REGEX, VM.namePattern)
    .transform((str) => str.trim())
    .optional(),
  email: z.string().regex(EMAIL_REGEX, VM.emailInvalid).optional(),
  imageUrl: z.string().url(VM.invalidUrl).optional().or(z.literal('')),
  role: z
    .enum(USER_ROLE_ENUM, {
      required_error: VM.roleRequired,
      invalid_type_error: VM.roleInvalid,
    })
    .optional(),
});

// Meeting schema
export const CreateMeetingEventSchema = z
  .object({
    title: z.string().min(1, VM.titleRequired).max(100, 'Title too long'),
    description: z.string().optional(),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    attendeeIds: z.array(z.string()).optional().default([]),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return start < end;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    },
  )
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      const duration = (end.getTime() - start.getTime()) / (1000 * 60);
      return duration >= 5 && duration <= 480; // 5 minutes to 8 hours
    },
    {
      message: 'Meeting duration must be between 5 minutes and 8 hours',
      path: ['endTime'],
    },
  );

// User search schema

export const UserSearchSchema = z.object({
  search: z.string().optional(),
  role: z.enum(USER_SEARCH_ROLE_ENUM).optional(),
  sortField: z.enum(SORT_FIELD_ENUM).optional(),
  sortDirection: z.enum(SORT_DIRECTION_ENUM).optional(),
  page: z.number().min(1).optional(),
});
