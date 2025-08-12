const mongoose = require('mongoose');


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
      // Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
      match: [
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please enter a valid email',
      ],
    },
    password: { type: String, required: true },
    imageUrl: { type: String, default: null },
    address: { type: String, default: '' },
    dob: { type: Date, default: null },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    createdEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
