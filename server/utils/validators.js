const { z } = require('zod');
const mongoose = require('mongoose');

const RegisterInputSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .transform((str) => str.trim()),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    ), // Example password base on the following regex: e.g. Zain123@, Min_123$
});

const LoginInputSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'), // Example password base on the following regex: e.g. Zain123@, Min_123$
});

const MeetingInputSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional().default(''),
    startTime: z
      .string()
      .refine((val) => !Number.isNaN(Date.parse(val)), 'Invalid startTime'),
    endTime: z
      .string()
      .refine((val) => !Number.isNaN(Date.parse(val)), 'Invalid endTime'),
    attendeeIds: z
      .array(
        z
          .string()
          .refine(
            (id) => mongoose.Types.ObjectId.isValid(id),
            'Invalid attendee id'
          )
      )
      .default([]),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'startTime must be before endTime',
    path: ['endTime'],
  });

const UpdateProfileInputSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().optional(),
  dob: z
    .string()
    .refine((val) => !val || !Number.isNaN(Date.parse(val)), 'Invalid dob')
    .optional(),
  imageUrl: z.string().url().optional(),
});

module.exports = {
  RegisterInputSchema,
  LoginInputSchema,
  MeetingInputSchema,
  UpdateProfileInputSchema,
};
