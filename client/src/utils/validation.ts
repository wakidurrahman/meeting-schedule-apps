import { z } from 'zod';

import { ValidationMessages as VM } from '@/constants/messages';
import { UserRole, UserSortBy, UserSortDirection } from '@/types/user';

/**
 * Password validation error messages
 * These are displayed to the user when password validation fails
 */
export const passwordValidationErrors = {
  required: 'Password is required',
  too_short: 'Password must be at least 8 characters long',
  too_long: 'Password must be at most 50 characters long',
  no_whitespace: 'Password cannot contain spaces',
  missing_digits: 'Password must contain at least one number',
  missing_uppercase: 'Password must contain at least one uppercase letter',
  missing_lowercase: 'Password must contain at least one lowercase letter',
  missing_special: 'Password must contain at least one special character (@$!%*?&)',
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
    .regex(/^[a-zA-Z\s'-]+$/, VM.namePattern)
    .transform((str) => str.trim()),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, VM.emailInvalid),
  password: z
    .string()
    .min(1, passwordValidationErrors.required)
    .min(8, passwordValidationErrors.too_short)
    .max(50, passwordValidationErrors.too_long)
    .refine((val) => !/\s/.test(val), {
      message: passwordValidationErrors.no_whitespace,
    })
    .refine((val) => /\d/.test(val), {
      message: passwordValidationErrors.missing_digits,
    })
    .refine((val) => /[A-Z]/.test(val), {
      message: passwordValidationErrors.missing_uppercase,
    })
    .refine((val) => /[a-z]/.test(val), {
      message: passwordValidationErrors.missing_lowercase,
    })
    .refine((val) => /[@$!%*?&]/.test(val), {
      message: passwordValidationErrors.missing_special,
    }),
});

// Login schema
export const LoginSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, VM.emailInvalid),
  password: z.string().min(8, VM.passwordMin), // Example password base on the following regex: e.g. Zain123@, Min_123$
});

// User management schemas
export const CreateUserSchema = z.object({
  name: z
    .string()
    .min(1, VM.nameRequired)
    .min(2, VM.nameMin)
    .max(50, VM.nameMax)
    .regex(/^[a-zA-Z\s'-]+$/, VM.namePattern)
    .transform((str) => str.trim()),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, VM.emailInvalid),
  imageUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'USER'], {
    required_error: 'Role is required',
    invalid_type_error: 'Role must be either ADMIN or USER',
  }),
});

export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(1, VM.nameRequired)
    .min(2, VM.nameMin)
    .max(50, VM.nameMax)
    .regex(/^[a-zA-Z\s'-]+$/, VM.namePattern)
    .transform((str) => str.trim())
    .optional(),
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, VM.emailInvalid)
    .optional(),
  imageUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  role: z
    .enum(['ADMIN', 'USER'], {
      required_error: 'Role is required',
      invalid_type_error: 'Role must be either ADMIN or USER',
    })
    .optional(),
});

// User search schema

export const UserSearchSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['ALL', 'ADMIN', 'USER'] as [UserRole, ...UserRole[]]).optional(),
  sortField: z
    .enum(['NAME', 'CREATED_AT', 'UPDATED_AT'] as [UserSortBy, ...UserSortBy[]])
    .optional(),
  sortDirection: z.enum(['ASC', 'DESC'] as [UserSortDirection, ...UserSortDirection[]]).optional(),
  page: z.number().min(1).optional(),
});
