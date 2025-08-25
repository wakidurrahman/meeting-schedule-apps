/**
 * Centralized Mongoose data-access helpers.
 *
 * Keep all direct model interactions here so resolvers remain thin and focused
 * on validation, authorization, and data shaping.
 */

const bcrypt = require('bcryptjs');
const { MESSAGES } = require('../constants/messages');
const Booking = require('../models/booking-schema');
const Event = require('../models/event-schema');
const Meeting = require('../models/meeting-schema');
const User = require('../models/user-schema');
const { DEFAULT_PAGINATION, DEFAULT_SORT, USER_SORT_BY, USER_ROLE } = require('../constants/const');

// -------------------------
// User helpers
// -------------------------

/**
 * Fetch user by id (lean for read paths)
 */
const getUserById = async (id) => {
  try {
    return await User.findById(id).lean();
  } catch (err) {
    err.message = err.message || MESSAGES.INTERNAL_ERROR;
    throw err;
  }
};

/**
 * Fetch user by email (lean for read paths)
 */
const getUserByEmail = async (email) => {
  try {
    return await User.findOne({ email }).lean();
  } catch (err) {
    err.message = err.message || MESSAGES.INTERNAL_ERROR;
    throw err;
  }
};

/**
 * Fetch full user document by email (includes password hash)
 */
const findUserDocByEmail = async (email) => {
  try {
    return await User.findOne({ email });
  } catch (err) {
    err.message = err.message || MESSAGES.INTERNAL_ERROR;
    throw err;
  }
};

/**
 * Create a new user document
 */
const createUser = ({ name, email, passwordHash }) =>
  User.create({ name, email, password: passwordHash });

/**
 * Update a user by id and return the updated document
 */
const updateUserById = (id, update) =>
  User.findByIdAndUpdate(id, update, { new: true, runValidators: true });

/**
 * List all users (lean) sorted by name asc
 */
const listUsers = () => User.find({}).sort({ name: 1 }).populate('createdEvents').lean();

/**
 * Enhanced users list with search, filtering, sorting, and pagination
 */
const listUsersFiltered = async ({ where = {}, orderBy = {}, pagination = {} } = {}) => {
  try {
    // Get the where, orderBy, and pagination.
    const { search, role } = where;
    const { field = DEFAULT_SORT.FIELD, direction = DEFAULT_SORT.DIRECTION } = orderBy;
    const { limit = DEFAULT_PAGINATION.LIMIT, offset = DEFAULT_PAGINATION.OFFSET } = pagination;

    // Build query conditions
    const query = {};

    // Search by name OR email (case-insensitive)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Build sort object
    const sortMap = USER_SORT_BY;
    const sortField = sortMap[field] || USER_SORT_BY.NAME;
    const sortDirection =
      direction === DEFAULT_SORT.DESC
        ? DEFAULT_SORT.DIRECTION_MAP.DESC
        : DEFAULT_SORT.DIRECTION_MAP.ASC;
    const sort = {};
    sort[sortField] = sortDirection;

    // Execute queries
    const [usersList, total] = await Promise.all([
      User.find(query).sort(sort).skip(offset).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    const hasMore = offset + limit < total;
    return { usersList, total, hasMore };
  } catch (err) {
    err.message = err.message || MESSAGES.INTERNAL_ERROR;
    throw err;
  }
};

/**
 * Create a new user with role support
 */
const createUserWithRole = async ({
  name,
  email,
  password,
  imageUrl,
  role = USER_ROLE.USER,
  address,
  dob,
}) => {
  try {
    // For admin user creation, generate a default password if not provided
    const finalPassword = password || (await bcrypt.hash('TempPassword123!', 12));

    const userData = { name, email, password: finalPassword, role };
    if (imageUrl) {
      userData.imageUrl = imageUrl;
    }
    if (address) {
      userData.address = address;
    }
    if (dob) {
      userData.dob = dob;
    }

    return await User.create(userData);
  } catch (err) {
    err.message = err.message || MESSAGES.INTERNAL_ERROR;
    throw err;
  }
};

/**
 * Update user by ID with role support
 */
const updateUserWithRole = async (id, update) => {
  try {
    return await User.findByIdAndUpdate(
      id,
      { ...update, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).lean();
  } catch (err) {
    err.message = err.message || MESSAGES.INTERNAL_ERROR;
    throw err;
  }
};

/**
 * Delete user by ID (hard delete)
 */
const deleteUserById = async (id) => {
  try {
    const result = await User.findByIdAndDelete(id);
    return !!result; // Return boolean indicating success
  } catch (err) {
    err.message = err.message || MESSAGES.INTERNAL_ERROR;
    throw err;
  }
};

// -------------------------
// Meeting helpers
// -------------------------

/**
 * List all meetings (for testing/admin) populated and sorted by start time
 */
const listAllMeetingsPopulated = () =>
  Meeting.find({}).sort({ startTime: 1 }).populate('attendees').populate('createdBy');

/**
 * List meetings scoped to a specific user (created or attending)
 */
const listMeetingsForUserPopulated = (userId) =>
  Meeting.find({ $or: [{ createdBy: userId }, { attendees: userId }] })
    .sort({ startTime: 1 })
    .populate('attendees')
    .populate('createdBy');

/**
 * Fetch a meeting by id with attendees and creator populated
 */
const getMeetingByIdPopulated = (id) =>
  Meeting.findById(id).populate('attendees').populate('createdBy');

/**
 * Create a meeting document and return it populated
 */
const createMeetingDoc = async ({
  title,
  description,
  startTime,
  endTime,
  attendeeIds,
  createdBy,
}) => {
  const meeting = await Meeting.create({
    title,
    description,
    startTime: new Date(startTime),
    endTime: new Date(endTime),
    attendees: attendeeIds,
    createdBy,
  });
  await meeting.populate('attendees');
  await meeting.populate('createdBy');
  return meeting;
};

/**
 * Update a meeting document and return it populated
 */
const updateMeetingDoc = async (meetingId, updateData, userId) => {
  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    throw new Error(MESSAGES.MEETING_NOT_FOUND || 'Meeting not found');
  }
  if (String(meeting.createdBy) !== String(userId)) {
    throw new Error(MESSAGES.FORBIDDEN || 'Forbidden');
  }

  // Update only provided fields
  const updateFields = {};
  if (updateData.title !== undefined) updateFields.title = updateData.title;
  if (updateData.description !== undefined) updateFields.description = updateData.description;
  if (updateData.startTime !== undefined) updateFields.startTime = new Date(updateData.startTime);
  if (updateData.endTime !== undefined) updateFields.endTime = new Date(updateData.endTime);
  if (updateData.attendeeIds !== undefined) updateFields.attendees = updateData.attendeeIds;

  const updatedMeeting = await Meeting.findByIdAndUpdate(meetingId, updateFields, { new: true })
    .populate('attendees')
    .populate('createdBy');

  return updatedMeeting;
};

/**
 * Get meetings by date range
 */
const getMeetingsByDateRange = async (startDate, endDate) => {
  try {
    return await Meeting.find({
      startTime: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    })
      .sort({ startTime: 1 })
      .populate('attendees')
      .populate('createdBy');
  } catch (err) {
    err.message = err.message || MESSAGES.INTERNAL_ERROR;
    throw err;
  }
};

/**
 * Get meetings by user ID (created by or attending)
 */
const getMeetingsByUserId = async (userId) => {
  try {
    return await Meeting.find({
      $or: [{ createdBy: userId }, { attendees: userId }],
    })
      .sort({ startTime: 1 })
      .populate('attendees')
      .populate('createdBy');
  } catch (err) {
    err.message = err.message || MESSAGES.INTERNAL_ERROR;
    throw err;
  }
};

/**
 * Delete a meeting only if the given user is the creator
 * Returns an object describing the outcome rather than throwing.
 */
const deleteMeetingIfOwner = async (meetingId, userId) => {
  const meeting = await Meeting.findById(meetingId);
  if (!meeting) {
    return { deleted: false, notFound: true };
  }
  if (String(meeting.createdBy) !== String(userId)) {
    return { deleted: false, forbidden: true };
  }
  await meeting.deleteOne();
  return { deleted: true };
};

// -------------------------
// Event helpers
// -------------------------

/**
 * List all events (for testing/admin) populated and sorted by date
 */
const listAllEventsPopulated = () => Event.find({}).sort({ date: 1 }).populate('createdBy');

/**
 * List events with optional filters. All filters are optional.
 * - createdById: filter by creator id
 * - dateFrom/dateTo: inclusive range on `date`
 */
const listEventsFiltered = ({ createdById, dateFrom, dateTo } = {}) => {
  const query = {};
  if (createdById) {
    query.createdBy = createdById;
  }
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) {
      query.date.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      query.date.$lte = new Date(dateTo);
    }
  }
  return Event.find(query).sort({ date: 1 }).populate('createdBy');
};

/**
 * Fetch a single event by id populated with creator
 */
const getEventByIdPopulated = (id) => Event.findById(id).populate('createdBy');

/**
 * Update an event if the given user is the creator. Returns the updated event
 * or a descriptor object when forbidden/notFound.
 */
const updateEventIfOwner = async (eventId, userId, update) => {
  const event = await Event.findById(eventId);
  if (!event) {
    return { notFound: true };
  }
  if (String(event.createdBy) !== String(userId)) {
    return { forbidden: true };
  }
  if (update.date) {
    update.date = new Date(update.date);
  }
  const updated = await Event.findByIdAndUpdate(eventId, update, {
    new: true,
    runValidators: true,
  }).populate('createdBy');
  return { event: updated };
};

/**
 * Delete an event if the given user is the creator.
 */
const deleteEventIfOwner = async (eventId, userId) => {
  const event = await Event.findById(eventId);
  if (!event) {
    return { notFound: true };
  }
  if (String(event.createdBy) !== String(userId)) {
    return { forbidden: true };
  }
  await event.deleteOne();
  // Also unlink from user's createdEvents (best-effort)
  try {
    await User.findByIdAndUpdate(event.createdBy, { $pull: { createdEvents: event._id } });
  } catch (_) {
    // Best-effort unlink; ignore failures to keep delete idempotent
  }
  return { deleted: true };
};
/**
 * Create an event document and link it to the creator's `createdEvents`
 */
const createEventDoc = async ({ title, description, date, price, createdBy }) => {
  const event = await Event.create({
    title,
    description,
    date: new Date(date),
    price,
    createdBy,
  });
  // Link event to user.createdEvents (best-effort; ignore if user not found)
  try {
    await User.findByIdAndUpdate(createdBy, { $addToSet: { createdEvents: event._id } });
  } catch (_) {
    // Best-effort linking; ignore failures
  }
  await event.populate('createdBy');
  return event;
};

// -------------------------
// Booking helpers
// -------------------------

/**
 * List all bookings populated with event and user
 */
const listAllBookingsPopulated = () =>
  Booking.find({}).sort({ createdAt: -1 }).populate('event').populate('user');

/**
 * Create a booking for an event by a user
 */
const createBookingDoc = async ({ eventId, userId }) => {
  const event = await Event.findById(eventId);
  if (!event) {
    return null;
  }
  const booking = await Booking.create({ event: eventId, user: userId });
  await booking.populate('event');
  await booking.populate('user');
  return booking;
};

/**
 * Cancel a booking if it belongs to the given user; returns the associated event
 */
const cancelBookingDoc = async ({ bookingId, userId }) => {
  const booking = await Booking.findById(bookingId).populate('event').populate('user');
  if (!booking) {
    return { notFound: true };
  }
  if (String(booking.user._id) !== String(userId)) {
    return { forbidden: true };
  }
  const event = booking.event;
  await booking.deleteOne();
  return { event };
};

module.exports = {
  // user
  getUserById,
  getUserByEmail,
  findUserDocByEmail,
  createUser,
  updateUserById,
  listUsers,
  listUsersFiltered,
  createUserWithRole,
  updateUserWithRole,
  deleteUserById,
  // meeting
  listAllMeetingsPopulated,
  listMeetingsForUserPopulated,
  getMeetingByIdPopulated,
  createMeetingDoc,
  updateMeetingDoc,
  getMeetingsByDateRange,
  getMeetingsByUserId,
  deleteMeetingIfOwner,
  // event
  listAllEventsPopulated,
  listEventsFiltered,
  getEventByIdPopulated,
  updateEventIfOwner,
  deleteEventIfOwner,
  createEventDoc,
  // booking
  listAllBookingsPopulated,
  createBookingDoc,
  cancelBookingDoc,
};
