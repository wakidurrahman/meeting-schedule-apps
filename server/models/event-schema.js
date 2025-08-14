const mongoose = require('mongoose');

/**
 * Event Schema
 *
 * This schema defines the structure of an event in the database.
 * It includes fields for title, description, date, price, and createdBy.
 * The schema also includes timestamps for when the event was created and updated.
 */

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    date: { type: Date, required: true },
    price: { type: Number, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Event', eventSchema);
