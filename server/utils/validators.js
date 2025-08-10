const { z } = require('zod');
const mongoose = require('mongoose');

const RegisterInputSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
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
