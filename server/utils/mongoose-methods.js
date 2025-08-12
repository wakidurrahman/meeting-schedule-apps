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

// -------------------------
// User helpers
// -------------------------

/**
 * Fetch user by id (lean for read paths)
 */
const getUserById = async (id) => {
  return User.findById(id).lean();
};

/**
 * Fetch user by email (lean for read paths)
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email }).lean();
};

/**
 * Fetch full user document by email (includes password hash)
 */
const findUserDocByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Create a new user document
 */
const createUser = async ({ name, email, passwordHash }) => {
  return User.create({ name, email, password: passwordHash });
};

/**
 * Update a user by id and return the updated document
 */
const updateUserById = async (id, update) => {
  return User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
};

/**
 * List all users (lean) sorted by name asc
 */
const listUsers = async () => {
  return User.find({}).sort({ name: 1 }).populate('createdEvents').lean();
};

// -------------------------
// Meeting helpers
// -------------------------

/**
 * List all meetings (for testing/admin) populated and sorted by start time
 */
const listAllMeetingsPopulated = async () => {
  return Meeting.find({})
    .sort({ startTime: 1 })
    .populate('attendees')
    .populate('createdBy');
};

/**
 * List meetings scoped to a specific user (created or attending)
 */
const listMeetingsForUserPopulated = async (userId) => {
  return Meeting.find({ $or: [{ createdBy: userId }, { attendees: userId }] })
    .sort({ startTime: 1 })
    .populate('attendees')
    .populate('createdBy');

};

/**
 * Fetch a meeting by id with attendees and creator populated
 */
const getMeetingByIdPopulated = async (id) => {
  return Meeting.findById(id).populate('attendees').populate('createdBy');
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
 * Delete a meeting only if the given user is the creator
 * Returns an object describing the outcome rather than throwing.
 */
const deleteMeetingIfOwner = async (meetingId, userId) => {
  const meeting = await Meeting.findById(meetingId);
  if (!meeting) return { deleted: false, notFound: true };
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
const listAllEventsPopulated = async () => {
  return Event.find({})
    .sort({ date: 1 })
    .populate('createdBy');
};

/**
 * Create an event document and link it to the creator's `createdEvents`
 */
const createEventDoc = async ({ title, description, date, price, createdBy }) => {
  const event = await Event.create({ title, description, date: new Date(date), price, createdBy });
  // Link event to user.createdEvents (best-effort; ignore if user not found)
  try {
    await User.findByIdAndUpdate(createdBy, { $addToSet: { createdEvents: event._id } });
  } catch (_) {}
  await event.populate('createdBy');
  return event;
};

// -------------------------
// Booking helpers
// -------------------------

/**
 * List all bookings populated with event and user
 */
const listAllBookingsPopulated = async () => {
  return Booking.find({}).sort({ createdAt: -1 }).populate('event').populate('user');
};

/**
 * Create a booking for an event by a user
 */
const createBookingDoc = async ({ eventId, userId }) => {
  // Ensure event exists
  const event = await Event.findById(eventId);
  if (!event) return null;
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
  if (!booking) return { notFound: true };
  if (String(booking.user._id) !== String(userId)) return { forbidden: true };
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
  // meeting
  listAllMeetingsPopulated,
  listMeetingsForUserPopulated,
  getMeetingByIdPopulated,
  createMeetingDoc,
  deleteMeetingIfOwner,
  // event
  listAllEventsPopulated,
  createEventDoc,
  // booking
  listAllBookingsPopulated,
  createBookingDoc,
  cancelBookingDoc,
};