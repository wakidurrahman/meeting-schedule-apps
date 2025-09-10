const mongoose = require('mongoose');

/**
 * Meeting Schema
 *
 * This schema defines the structure of a meeting in the database.
 * It includes fields for title, description, startTime, endTime, attendees, and createdBy.
 * The schema also includes timestamps for when the meeting was created and updated.
 */
const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true },
);

meetingSchema.index({ startTime: 1, endTime: 1 }); // for date range queries

module.exports = mongoose.model('Meeting', meetingSchema);
