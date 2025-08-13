const mongoose = require('mongoose');
const { MESSAGES } = require('../constants/messages');

async function connectDB(mongoUri) {
  if (!mongoUri) throw new Error(MESSAGES.DB_URI_MISSING);
  console.log('Connecting to MongoDB...');
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(mongoUri, { autoIndex: true });
  } catch (err) {
    err.message = `${MESSAGES.DB_CONNECTION_FAILED}: ${err.message}`;
    throw err;
  }
  return mongoose.connection;
}

module.exports = { connectDB };
