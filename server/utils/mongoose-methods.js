/**
 * Centralized Mongoose data-access helpers.
 *
 * Keep all direct model interactions here so resolvers remain thin and focused
 * on validation, authorization, and data shaping.
 */

const User = require('../models/user-schema');
const Meeting = require('../models/meeting-schema');
const Event = require('../models/event-schema');
const Booking = require('../models/booking-schema');
const { MESSAGES } = require('../constants/messages');

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
const createUser = async ({ name, email, passwordHash }) => {
  try {
    return await User.create({ name, email, password: passwordHash });
  } catch (err) {
    throw err;
  }
};

/**
 * Update a user by id and return the updated document
 */
const updateUserById = async (id, update) => {
  try {
    return await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  } catch (err) {
    throw err;
  }
};

/**
 * List all users (lean) sorted by name asc
 */
const listUsers = async () => {
  try {
    return await User.find({}).sort({ name: 1 }).populate('createdEvents').lean();
  } catch (err) {
    throw err;
  }
};

// -------------------------
// Meeting helpers
// -------------------------

/**
 * List all meetings (for testing/admin) populated and sorted by start time
 */
const listAllMeetingsPopulated = async () => {
  try {
    return await Meeting.find({}).sort({ startTime: 1 }).populate('attendees').populate('createdBy');
  } catch (err) {
    throw err;
  }
};

/**
 * List meetings scoped to a specific user (created or attending)
 */
const listMeetingsForUserPopulated = async (userId) => {
  try {
    return await Meeting.find({ $or: [{ createdBy: userId }, { attendees: userId }] })
      .sort({ startTime: 1 })
      .populate('attendees')
      .populate('createdBy');
  } catch (err) {
    throw err;
  }
};

/**
 * Fetch a meeting by id with attendees and creator populated
 */
const getMeetingByIdPopulated = async (id) => {
  try {
    return await Meeting.findById(id).populate('attendees').populate('createdBy');
  } catch (err) {
    throw err;
  }
};

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
  try {
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
  } catch (err) {
    throw err;
  }
};

/**
 * Delete a meeting only if the given user is the creator
 * Returns an object describing the outcome rather than throwing.
 */
const deleteMeetingIfOwner = async (meetingId, userId) => {
  try {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return { deleted: false, notFound: true };
    if (String(meeting.createdBy) !== String(userId)) {
      return { deleted: false, forbidden: true };
    }
    await meeting.deleteOne();
    return { deleted: true };
  } catch (err) {
    throw err;
  }
};

// -------------------------
// Event helpers
// -------------------------

/**
 * List all events (for testing/admin) populated and sorted by date
 */
const listAllEventsPopulated = async () => {
  try {
    return await Event.find({}).sort({ date: 1 }).populate('createdBy');
  } catch (err) {
    throw err;
  }
};

/**
 * List events with optional filters. All filters are optional.
 * - createdById: filter by creator id
 * - dateFrom/dateTo: inclusive range on `date`
 */
const listEventsFiltered = async ({ createdById, dateFrom, dateTo } = {}) => {
  try {
    const query = {};
    if (createdById) query.createdBy = createdById;
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    return await Event.find(query).sort({ date: 1 }).populate('createdBy');
  } catch (err) {
    throw err;
  }
};

/**
 * Fetch a single event by id populated with creator
 */
const getEventByIdPopulated = async (id) => {
  try {
    return await Event.findById(id).populate('createdBy');
  } catch (err) {
    throw err;
  }
};

/**
 * Update an event if the given user is the creator. Returns the updated event
 * or a descriptor object when forbidden/notFound.
 */
const updateEventIfOwner = async (eventId, userId, update) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) return { notFound: true };
    if (String(event.createdBy) !== String(userId)) return { forbidden: true };
    if (update.date) update.date = new Date(update.date);
    const updated = await Event.findByIdAndUpdate(eventId, update, {
      new: true,
      runValidators: true,
    }).populate('createdBy');
    return { event: updated };
  } catch (err) {
    throw err;
  }
};

/**
 * Delete an event if the given user is the creator.
 */
const deleteEventIfOwner = async (eventId, userId) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) return { notFound: true };
    if (String(event.createdBy) !== String(userId)) return { forbidden: true };
    await event.deleteOne();
    // Also unlink from user's createdEvents (best-effort)
    try {
      await User.findByIdAndUpdate(event.createdBy, { $pull: { createdEvents: event._id } });
    } catch (_) {
      // Best-effort unlink; ignore failures to keep delete idempotent
    }
    return { deleted: true };
  } catch (err) {
    throw err;
  }
};
/**
 * Create an event document and link it to the creator's `createdEvents`
 */
const createEventDoc = async ({ title, description, date, price, createdBy }) => {
  try {
    const event = await Event.create({ title, description, date: new Date(date), price, createdBy });
    // Link event to user.createdEvents (best-effort; ignore if user not found)
    try {
      await User.findByIdAndUpdate(createdBy, { $addToSet: { createdEvents: event._id } });
    } catch (_) {
      // Best-effort linking; ignore failures
    }
    await event.populate('createdBy');
    return event;
  } catch (err) {
    throw err;
  }
};

// -------------------------
// Booking helpers
// -------------------------

/**
 * List all bookings populated with event and user
 */
const listAllBookingsPopulated = async () => {
  try {
    return await Booking.find({}).sort({ createdAt: -1 }).populate('event').populate('user');
  } catch (err) {
    throw err;
  }
};

/**
 * Create a booking for an event by a user
 */
const createBookingDoc = async ({ eventId, userId }) => {
  try {
    const event = await Event.findById(eventId);
    if (!event) return null;
    const booking = await Booking.create({ event: eventId, user: userId });
    await booking.populate('event');
    await booking.populate('user');
    return booking;
  } catch (err) {
    throw err;
  }
};

/**
 * Cancel a booking if it belongs to the given user; returns the associated event
 */
const cancelBookingDoc = async ({ bookingId, userId }) => {
  try {
    const booking = await Booking.findById(bookingId).populate('event').populate('user');
    if (!booking) return { notFound: true };
    if (String(booking.user._id) !== String(userId)) return { forbidden: true };
    const event = booking.event;
    await booking.deleteOne();
    return { event };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  // user
  getUserById,
  getUserByEmail,
  findUserDocByEmail,
  createUser,
  updateUserById,
  listUsers,
  // meeting
  listAllMeetingsPopulated,
  listMeetingsForUserPopulated,
  getMeetingByIdPopulated,
  createMeetingDoc,
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
