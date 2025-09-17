const mongoose = require('mongoose');
const { z } = require('zod');

const { USER_ROLE } = require('../constants/const');
const { VALIDATION_MESSAGES: VM } = require('../constants/messages');

const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

// Auth schemas

const RegisterInputSchema = z.object({
  name: z
    .string()
    .min(1, VM.nameRequired)
    .min(2, VM.nameMin)
    .max(50, VM.nameMax)
    .regex(/^[a-zA-Z\s'-]+$/, VM.namePattern)
    .transform((str) => str.trim()),
  email: z.string().regex(EmailRegex, VM.emailInvalid),
  password: z.string().min(8, VM.passwordMin).regex(PasswordRegex, VM.passwordComplexity), // Example password base on the following regex: e.g. Zain123@, Min_123$
});

const LoginInputSchema = z.object({
  email: z.string().regex(EmailRegex, VM.emailInvalid),
  password: z.string().min(8, VM.passwordMin), // Example password base on the following regex: e.g. Zain123@, Min_123$
});

// Meeting schemas

const MeetingInputSchema = z
  .object({
    title: z.string().min(1, VM.titleRequired),
    description: z.string().optional().default(''),
    startTime: z.string().refine((val) => !Number.isNaN(Date.parse(val)), VM.invalidStartTime),
    endTime: z.string().refine((val) => !Number.isNaN(Date.parse(val)), VM.invalidEndTime),
    attendeeIds: z
      .array(z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), VM.invalidAttendeeId))
      .default([]),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: VM.startBeforeEnd,
    path: ['endTime'],
  });

const CreateMeetingInputSchema = z
  .object({
    title: z
      .string()
      .min(1, VM.titleRequired)
      .max(100, VM.titleMax || 'Title too long'),
    description: z.string().optional().default(''),
    startTime: z.string().refine((val) => !Number.isNaN(Date.parse(val)), VM.invalidStartTime),
    endTime: z.string().refine((val) => !Number.isNaN(Date.parse(val)), VM.invalidEndTime),
    attendeeIds: z
      .array(z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), VM.invalidAttendeeId))
      .default([]),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: VM.startBeforeEnd,
    path: ['endTime'],
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      const durationMinutes = (end - start) / (1000 * 60);
      return durationMinutes >= 5 && durationMinutes <= 480; // 5 minutes to 8 hours
    },
    {
      message: 'Meeting duration must be between 5 minutes and 8 hours',
      path: ['endTime'],
    },
  );

const UpdateMeetingInputSchema = z
  .object({
    title: z
      .string()
      .min(1, VM.titleRequired)
      .max(100, VM.titleMax || 'Title too long')
      .optional(),
    description: z.string().optional(),
    startTime: z
      .string()
      .refine((val) => !Number.isNaN(Date.parse(val)), VM.invalidStartTime)
      .optional(),
    endTime: z
      .string()
      .refine((val) => !Number.isNaN(Date.parse(val)), VM.invalidEndTime)
      .optional(),
    attendeeIds: z
      .array(z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), VM.invalidAttendeeId))
      .optional(),
  })
  .refine(
    (data) => {
      // Only validate start/end relationship if both are provided
      if (data.startTime && data.endTime) {
        return new Date(data.startTime) < new Date(data.endTime);
      }
      return true;
    },
    {
      message: VM.startBeforeEnd,
      path: ['endTime'],
    },
  );

// Profile schemas

const UpdateProfileInputSchema = z.object({
  name: z.string().min(2, VM.nameMinProfile).optional(),
  address: z.string().optional(),
  dob: z
    .string()
    .refine((val) => !val || !Number.isNaN(Date.parse(val)), VM.invalidDob)
    .optional(),
  imageUrl: z.string().url(VM.invalidUrl).optional(),
});

/**
 * User management schemas
 *
 * Create user input schema.
 * Update user input schema.
 */

const CreateUserInputSchema = z.object({
  name: z
    .string()
    .min(1, VM.nameRequired)
    .min(2, VM.nameMin)
    .max(50, VM.nameMax)
    .regex(/^[a-zA-Z\s'-]+$/, VM.namePattern)
    .transform((str) => str.trim()),
  email: z.string().regex(EmailRegex, VM.emailInvalid),
  imageUrl: z
    .union([
      z.string().url(), // String URL
      z.string().refine((val) => val === '' || val.startsWith('{'), {
        message: 'Must be a valid URL or JSON string',
      }), // JSON string (UserImageSizes serialized) or empty
      z.object({
        thumb: z.string(),
        small: z.string(),
        medium: z.string(),
      }), // UserImageSizes object
    ])
    .optional(),
  role: z.enum([USER_ROLE.USER, USER_ROLE.ADMIN]).default(USER_ROLE.USER),
});

const UpdateUserInputSchema = z.object({
  name: z
    .string()
    .min(1, VM.nameRequired)
    .min(2, VM.nameMin)
    .max(50, VM.nameMax)
    .regex(/^[a-zA-Z\s'-]+$/, VM.namePattern)
    .transform((str) => str.trim())
    .optional(),
  email: z.string().regex(EmailRegex, VM.emailInvalid).optional(),
  imageUrl: z
    .union([
      z.string().url(), // String URL
      z.string().refine((val) => val === '' || val.startsWith('{'), {
        message: 'Must be a valid URL or JSON string',
      }), // JSON string (UserImageSizes serialized) or empty
      z.object({
        thumb: z.string(),
        small: z.string(),
        medium: z.string(),
      }), // UserImageSizes object
    ])
    .optional(),
  role: z.enum([USER_ROLE.USER, USER_ROLE.ADMIN]).optional(),
});

/**
 * Event schemas
 *
 * Create event input schema.
 */

const EventInputSchema = z.object({
  title: z.string().min(1, VM.titleRequired),
  description: z.string().optional().default(''),
  date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), 'Invalid date format'),
  price: z.number().min(0, 'Price must be non-negative'),
});

module.exports = {
  RegisterInputSchema,
  LoginInputSchema,
  MeetingInputSchema,
  CreateMeetingInputSchema,
  UpdateMeetingInputSchema,
  UpdateProfileInputSchema,
  EventInputSchema,
  CreateUserInputSchema,
  UpdateUserInputSchema,
};
