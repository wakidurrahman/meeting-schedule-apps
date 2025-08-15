const mongoose = require('mongoose');
const { z } = require('zod');

const { VALIDATION_MESSAGES: VM } = require('../constants/messages');

const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

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

const MeetingInputSchema = z
  .object({
    title: z.string().min(1),
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

const UpdateProfileInputSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().optional(),
  dob: z
    .string()
    .refine((val) => !val || !Number.isNaN(Date.parse(val)), VM.invalidDob)
    .optional(),
  imageUrl: z.string().url().optional(),
});

// User management schemas
const CreateUserInputSchema = z.object({
  name: z
    .string()
    .min(1, VM.nameRequired)
    .min(2, VM.nameMin)
    .max(50, VM.nameMax)
    .regex(/^[a-zA-Z\s'-]+$/, VM.namePattern)
    .transform((str) => str.trim()),
  email: z.string().regex(EmailRegex, VM.emailInvalid),
  imageUrl: z.string().url().optional().or(z.literal('')),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
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
  imageUrl: z.string().url().optional().or(z.literal('')),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

const EventInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  startTime: z.string().refine((val) => !Number.isNaN(Date.parse(val)), VM.invalidStartTime),
  endTime: z.string().refine((val) => !Number.isNaN(Date.parse(val)), VM.invalidEndTime),
  attendeeIds: z
    .array(z.string().refine((id) => mongoose.Types.ObjectId.isValid(id), VM.invalidAttendeeId))
    .default([]),
});

module.exports = {
  RegisterInputSchema,
  LoginInputSchema,
  MeetingInputSchema,
  UpdateProfileInputSchema,
  EventInputSchema,
  CreateUserInputSchema,
  UpdateUserInputSchema,
};
