const mongoose = require('mongoose');

/**
 * User Schema
 *
 * This schema defines the structure of a user in the database.
 * It includes fields for name, email, password, imageUrl, address, dob, role, and createdEvents.
 * The schema also includes timestamps for when the user was created and updated.
 */

// const EMAIL_REGEX = ;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      index: true,
      unique: true,
      dropDups: true,
      lowercase: true,
      // Regexp to validate emails with RFC2822 compliant pattern
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid email'],
    },
    password: { type: String, required: true },
    imageUrl: { type: String, default: null },
    address: { type: String, default: '' },
    dob: { type: Date, default: null },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    createdEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
