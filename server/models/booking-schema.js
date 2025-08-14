const mongoose = require('mongoose');

/**
 * Booking Schema
 *
 * This schema defines the structure of a booking in the database.
 * It includes fields for event and user.
 * The schema also includes timestamps for when the booking was created and updated.
 */

const bookingSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Booking', bookingSchema);
