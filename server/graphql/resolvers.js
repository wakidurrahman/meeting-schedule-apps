const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GraphQLError } = require('graphql');
const User = require('../models/User');
const Meeting = require('../models/Meeting');
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
    const user = await User.findById(userId).lean();
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
    const user = await User.findById(userId).lean();
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
    const userId = requireAuth(context);
    // 01.The meetings query is scoped to the authenticated user. If you haven’t created any meetings as the current logged-in user (or you created them under another account), the server will legitimately return an empty array.
    // return Meeting.find({ $or: [{ createdBy: userId }, { attendees: userId }] })
    // .sort({ startTime: 1 })
    // .populate('attendees')
    // .populate('createdBy');

    // 02.If you want to see all meetings (for testing or admin), you can do:
    return Meeting.find({})
      .sort({ startTime: 1 })
      .populate('attendees')
      .populate('createdBy');
  },
  users: async (_args, context) => {
    requireAuth(context);
    const users = await User.find({}).sort({ name: 1 }).lean();
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
    return Meeting.findById(id).populate('attendees').populate('createdBy');
  },

  // Mutation resolvers
  register: async ({ input }, context) => {
    RegisterInputSchema.parse(input);
    const { name, email, password } = input;
    const existing = await User.findOne({ email });
    if (existing)
      throw new GraphQLError('Email already in use', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    // Return AuthUser projection
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl ?? null,
    };
  },
  login: async ({ input }, context) => {
    LoginInputSchema.parse(input);
    const { email, password } = input;
    const user = await User.findOne({ email });
    if (!user)
      throw new GraphQLError('Invalid credentials', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      throw new GraphQLError('Invalid credentials', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    if (!process.env.JWT_SECRET) {
      throw new GraphQLError('Server misconfiguration: JWT secret missing', {
        extensions: { code: 'INTERNAL_SERVER_ERROR' },
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
  },
  updateMyProfile: async ({ input }, context) => {
    const userId = requireAuth(context);
    UpdateProfileInputSchema.parse(input);
    const update = { ...input };
    if (update.dob) update.dob = new Date(update.dob);
    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    });
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
    // Ensure attendees are ObjectIds to avoid cast errors surfacing as 500s
    const meeting = await Meeting.create({
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      attendees: attendeeIds,
      createdBy: userId,
    });
    await meeting.populate('attendees');
    await meeting.populate('createdBy');
    return meeting;
  },
  deleteMeeting: async ({ id }, context) => {
    const userId = requireAuth(context);
    const meeting = await Meeting.findById(id);
    if (!meeting) return false;
    if (String(meeting.createdBy) !== String(userId))
      throw new GraphQLError('Forbidden', {
        extensions: { code: 'FORBIDDEN' },
      });
    await meeting.deleteOne();
    return true;
  },
};
