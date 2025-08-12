const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
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
    throw new GraphQLError('Not authenticated', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  return userId;
}

module.exports = {
  // Query resolvers (buildSchema root resolvers: (args, context))
  me: async (_args, context) => {
    const userId = requireAuth(context);
    const user = await getUserById(userId);
    if (!user) return null;
    return {
      id: String(user._id),
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl ?? null,
    };
  },

  myProfile: async (_args, context) => {
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
  },

  meetings: async (_args, context) => {
    requireAuth(context);
    // For admin/testing: list all meetings. To scope to user, use listMeetingsForUserPopulated(userId)
    return listAllMeetingsPopulated();
  },
  users: async (_args, context) => {
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
  },

  meeting: async ({ id }, context) => {
    requireAuth(context);
    return getMeetingByIdPopulated(id);
  },

  // Mutation resolvers
  register: async ({ input }, context) => {
    // step 01: validate the input by Zod schema
    RegisterInputSchema.parse(input);
    // step 02: extract the input destructuring
    const { name, email, password } = input;
    // step 03: check if the email is already in use
    const existing = await getUserByEmail(email);
    // step 04: if the email is already in use, throw an error
    if (existing)
      throw new GraphQLError('Email already in use', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    // step 05: hash the password using bcryptjs salt rounds
    const hashed = await bcrypt.hash(password, 12);
    // step 06: create the user with the hashed password
    const user = await createUser({ name, email, passwordHash: hashed });
    // step 07: return the user
    // Return AuthUser projection
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl ?? null,
    };
  },

  login: async ({ input }, context) => {
    // step 01: validate the input by Zod schema
    LoginInputSchema.parse(input);
    // step 02: extract the input destructuring
    const { email, password } = input;
    // step 03: check if the user exists
    const user = await findUserDocByEmail(email);
    if (!user)
      throw new GraphQLError('Invalid credentials', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    // step 05: compare the password with the hashed password using bcryptjs
    const valid = await bcrypt.compare(password, user.password);
    // step 06: if the password is invalid, throw an error
    if (!valid)
      throw new GraphQLError('Invalid credentials', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    // step 07: if the JWT secret is not set, throw an error
    if (!process.env.JWT_SECRET) {
      throw new GraphQLError('Server misconfiguration: JWT secret missing', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
      });
    }
    // step 08: sign the JWT token with the user id and the JWT secret
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    // step 09: return the token and the user
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        imageUrl: user.imageUrl ?? null,
      },
    };
  },

  updateMyProfile: async ({ input }, context) => {
    const userId = requireAuth(context);
    UpdateProfileInputSchema.parse(input);
    const update = { ...input };
    if (update.dob) update.dob = new Date(update.dob);
    const user = await updateUserById(userId, update);
    if (!user) throw new GraphQLError('User not found');
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
  },

  createMeeting: async ({ input }, context) => {
    console.log('input', input);
    const userId = requireAuth(context);
    let parsed;
    try {
      parsed = MeetingInputSchema.parse(input);
    } catch (err) {
      throw new GraphQLError('Invalid meeting input', {
        extensions: {
          code: 'BAD_USER_INPUT',
          details: err?.errors ?? undefined,
        },
      });
    }
    const { title, description, startTime, endTime, attendeeIds } = parsed;
    return createMeetingDoc({
      title,
      description,
      startTime,
      endTime,
      attendeeIds,
      createdBy: userId,
    });
  },

  deleteMeeting: async ({ id }, context) => {
    const userId = requireAuth(context);
    const result = await deleteMeetingIfOwner(id, userId);
    if (result.notFound) return false;
    if (result.forbidden)
      throw new GraphQLError('Forbidden', {
        extensions: { code: 'FORBIDDEN' },
      });
    return !!result.deleted;
  },

  // Events
  events: async ({ filter }, context) => {
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
  },

  event: async ({ id }, context) => {
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
  },

  createEvent: async ({ eventInput }, context) => {
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
  },

  updateEvent: async ({ id, eventInput }, context) => {
    const userId = requireAuth(context);
    const result = await updateEventIfOwner(id, userId, eventInput || {});
    if (result.notFound)
      throw new GraphQLError('Event not found', { extensions: { code: 'BAD_USER_INPUT' } });
    if (result.forbidden)
      throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
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
  },

  deleteEvent: async ({ id }, context) => {
    const userId = requireAuth(context);
    const result = await deleteEventIfOwner(id, userId);
    if (result.notFound) return false;
    if (result.forbidden)
      throw new GraphQLError('Forbidden', { extensions: { code: 'FORBIDDEN' } });
    return !!result.deleted;
  },

  // Bookings
  bookings: async (_args, context) => {
    requireAuth(context);
    const bookings = await listAllBookingsPopulated();
    return bookings.map((b) => ({
      id: String(b._id),
      event: b.event,
      user: b.user,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));
  },

  bookEvent: async ({ eventId }, context) => {
    const userId = requireAuth(context);
    const booking = await createBookingDoc({ eventId, userId });
    if (!booking)
      throw new GraphQLError('Event not found', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    return {
      id: String(booking._id),
      event: booking.event,
      user: booking.user,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  },

  cancelBooking: async ({ bookingId }, context) => {
    const userId = requireAuth(context);
    const result = await cancelBookingDoc({ bookingId, userId });
    if (result.notFound)
      throw new GraphQLError('Booking not found', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    if (result.forbidden)
      throw new GraphQLError('Forbidden', {
        extensions: { code: 'FORBIDDEN' },
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
  },
};
