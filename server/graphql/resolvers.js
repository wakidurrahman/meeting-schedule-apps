const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const { MESSAGES, ERROR_CODES } = require('../constants/messages');
const {
  // user helpers
  getUserById,
  getUserByEmail,
  findUserDocByEmail,
  createUser,
  updateUserById,
  listUsers,
  // meeting helpers
  listAllMeetingsPopulated,
  listMeetingsForUserPopulated,
  getMeetingByIdPopulated,
  createMeetingDoc,
  deleteMeetingIfOwner,
  // event helpers
  listAllEventsPopulated,
  listEventsFiltered,
  getEventByIdPopulated,
  updateEventIfOwner,
  deleteEventIfOwner,
  createEventDoc,
  // booking helpers
  listAllBookingsPopulated,
  createBookingDoc,
  cancelBookingDoc,
} = require('../utils/mongoose-methods');
const {
  RegisterInputSchema,
  LoginInputSchema,
  MeetingInputSchema,
  UpdateProfileInputSchema,
} = require('../utils/validators');

function requireAuth(context) {
  const userId = context?.req?.userId;
  if (!userId)
    throw new GraphQLError(MESSAGES.NOT_AUTHENTICATED, {
      extensions: { code: ERROR_CODES.UNAUTHENTICATED },
    });
  return userId;
}

function handleUnexpectedError(err) {
  if (err instanceof GraphQLError) throw err;
  throw new GraphQLError(MESSAGES.INTERNAL_ERROR, {
    extensions: { code: ERROR_CODES.INTERNAL_SERVER_ERROR },
  });
}

module.exports = {
  // Query resolvers (buildSchema root resolvers: (args, context))
  me: async (_args, context) => {
    try {
      const userId = requireAuth(context);
      const user = await getUserById(userId);
      if (!user) return null;
      return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl ?? null,
      };
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  myProfile: async (_args, context) => {
    try {
      const userId = requireAuth(context);
      const user = await getUserById(userId);
      if (!user) return null;
      return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl ?? null,
        address: user.address ?? '',
        dob: user.dob ? user.dob.toISOString() : null,
        role: user.role || 'USER',
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  meetings: async (_args, context) => {
    try {
      requireAuth(context);
      // For admin/testing: list all meetings. To scope to user, use listMeetingsForUserPopulated(userId)
      return listAllMeetingsPopulated();
    } catch (err) {
      handleUnexpectedError(err);
    }
  },
  users: async (_args, context) => {
    try {
      requireAuth(context);
      const users = await listUsers();
      return users.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        imageUrl: u.imageUrl ?? null,
        address: u.address ?? '',
        dob: u.dob ? u.dob.toISOString() : null,
        role: u.role || 'USER',
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      }));
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  meeting: async ({ id }, context) => {
    try {
      requireAuth(context);
      return getMeetingByIdPopulated(id);
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  // Mutation resolvers
  register: async ({ input }, context) => {
    try {
      RegisterInputSchema.parse(input);
      const { name, email, password } = input;
      const existing = await getUserByEmail(email);
      if (existing)
        throw new GraphQLError(MESSAGES.EMAIL_IN_USE, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      const hashed = await bcrypt.hash(password, 12);
      const user = await createUser({ name, email, passwordHash: hashed });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl ?? null,
      };
    } catch (err) {
      if (err.name === 'ZodError')
        throw new GraphQLError(MESSAGES.VALIDATION_FAILED, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT, details: err.issues },
        });
      handleUnexpectedError(err);
    }
  },

  login: async ({ input }, context) => {
    try {
      LoginInputSchema.parse(input);
      const { email, password } = input;
      const user = await findUserDocByEmail(email);
      if (!user)
        throw new GraphQLError(MESSAGES.INVALID_CREDENTIALS, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid)
        throw new GraphQLError(MESSAGES.INVALID_CREDENTIALS, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      if (!process.env.JWT_SECRET) {
        throw new GraphQLError(MESSAGES.JWT_MISSING, {
          extensions: { code: ERROR_CODES.INTERNAL_SERVER_ERROR },
        });
      }
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });
      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          imageUrl: user.imageUrl ?? null,
        },
      };
    } catch (err) {
      if (err.name === 'ZodError')
        throw new GraphQLError(MESSAGES.VALIDATION_FAILED, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT, details: err.issues },
        });
      handleUnexpectedError(err);
    }
  },

  updateMyProfile: async ({ input }, context) => {
    try {
      const userId = requireAuth(context);
      UpdateProfileInputSchema.parse(input);
      const update = { ...input };
      if (update.dob) update.dob = new Date(update.dob);
      const user = await updateUserById(userId, update);
      if (!user) throw new GraphQLError(MESSAGES.USER_NOT_FOUND);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl ?? null,
        address: user.address ?? '',
        dob: user.dob ? user.dob.toISOString() : null,
        role: user.role || 'USER',
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (err) {
      if (err.name === 'ZodError')
        throw new GraphQLError(MESSAGES.VALIDATION_FAILED, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT, details: err.issues },
        });
      handleUnexpectedError(err);
    }
  },

  createMeeting: async ({ input }, context) => {
    try {
      const userId = requireAuth(context);
      const parsed = MeetingInputSchema.parse(input);
      const { title, description, startTime, endTime, attendeeIds } = parsed;
      return createMeetingDoc({
        title,
        description,
        startTime,
        endTime,
        attendeeIds,
        createdBy: userId,
      });
    } catch (err) {
      if (err.name === 'ZodError')
        throw new GraphQLError(MESSAGES.VALIDATION_FAILED, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT, details: err.issues },
        });
      handleUnexpectedError(err);
    }
  },

  deleteMeeting: async ({ id }, context) => {
    try {
      const userId = requireAuth(context);
      const result = await deleteMeetingIfOwner(id, userId);
      if (result.notFound) return false;
      if (result.forbidden)
        throw new GraphQLError(MESSAGES.FORBIDDEN, {
          extensions: { code: ERROR_CODES.FORBIDDEN },
        });
      return !!result.deleted;
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  // Events
  events: async ({ filter }, context) => {
    try {
      requireAuth(context);
      const events = filter ? await listEventsFiltered(filter) : await listAllEventsPopulated();
      return events.map((e) => ({
        id: String(e._id),
        title: e.title,
        description: e.description ?? '',
        date: e.date,
        price: e.price,
        createdBy: e.createdBy,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      }));
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  event: async ({ id }, context) => {
    try {
      requireAuth(context);
      const e = await getEventByIdPopulated(id);
      if (!e) return null;
      return {
        id: String(e._id),
        title: e.title,
        description: e.description ?? '',
        date: e.date,
        price: e.price,
        createdBy: e.createdBy,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      };
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  createEvent: async ({ eventInput }, context) => {
    try {
      const userId = requireAuth(context);
      const event = await createEventDoc({ ...eventInput, createdBy: userId });
      return {
        id: String(event._id),
        title: event.title,
        description: event.description ?? '',
        date: event.date,
        price: event.price,
        createdBy: event.createdBy,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      };
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  updateEvent: async ({ id, eventInput }, context) => {
    try {
      const userId = requireAuth(context);
      const result = await updateEventIfOwner(id, userId, eventInput || {});
      if (result.notFound)
        throw new GraphQLError(MESSAGES.EVENT_NOT_FOUND, { extensions: { code: ERROR_CODES.BAD_USER_INPUT } });
      if (result.forbidden)
        throw new GraphQLError(MESSAGES.FORBIDDEN, { extensions: { code: ERROR_CODES.FORBIDDEN } });
      const e = result.event;
      return {
        id: String(e._id),
        title: e.title,
        description: e.description ?? '',
        date: e.date,
        price: e.price,
        createdBy: e.createdBy,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      };
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  deleteEvent: async ({ id }, context) => {
    try {
      const userId = requireAuth(context);
      const result = await deleteEventIfOwner(id, userId);
      if (result.notFound) return false;
      if (result.forbidden)
        throw new GraphQLError(MESSAGES.FORBIDDEN, { extensions: { code: ERROR_CODES.FORBIDDEN } });
      return !!result.deleted;
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  // Bookings
  bookings: async (_args, context) => {
    try {
      requireAuth(context);
      const bookings = await listAllBookingsPopulated();
      return bookings.map((b) => ({
        id: String(b._id),
        event: b.event,
        user: b.user,
        createdAt: b.createdAt.toISOString(),
        updatedAt: b.updatedAt.toISOString(),
      }));
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  bookEvent: async ({ eventId }, context) => {
    try {
      const userId = requireAuth(context);
      const booking = await createBookingDoc({ eventId, userId });
      if (!booking)
        throw new GraphQLError(MESSAGES.EVENT_NOT_FOUND, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      return {
        id: String(booking._id),
        event: booking.event,
        user: booking.user,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
      };
    } catch (err) {
      handleUnexpectedError(err);
    }
  },

  cancelBooking: async ({ bookingId }, context) => {
    try {
      const userId = requireAuth(context);
      const result = await cancelBookingDoc({ bookingId, userId });
      if (result.notFound)
        throw new GraphQLError(MESSAGES.BOOKING_NOT_FOUND, {
          extensions: { code: ERROR_CODES.BAD_USER_INPUT },
        });
      if (result.forbidden)
        throw new GraphQLError(MESSAGES.FORBIDDEN, {
          extensions: { code: ERROR_CODES.FORBIDDEN },
        });
      const event = result.event;
      return {
        id: String(event._id),
        title: event.title,
        description: event.description ?? '',
        date: event.date,
        price: event.price,
        createdBy: event.createdBy,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      };
    } catch (err) {
      handleUnexpectedError(err);
    }
  },
};
