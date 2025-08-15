import { z } from 'zod';

import { ValidationMessages as VM } from '../constants/messages';

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
    .min(8, VM.passwordMin)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      VM.passwordComplexity,
    ), // Example password base on the following regex: e.g. Zain123@, Min_123$
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

export const UserSearchSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['ALL', 'ADMIN', 'USER']).optional(),
  sortField: z.enum(['NAME', 'CREATED_AT', 'UPDATED_AT']).optional(),
  sortDirection: z.enum(['ASC', 'DESC']).optional(),
  page: z.number().min(1).optional(),
});
