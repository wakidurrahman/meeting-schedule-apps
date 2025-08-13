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
