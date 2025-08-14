const mongoose = require('mongoose');

const { MESSAGES } = require('../constants/messages');
const { logger } = require('../utils/logger');

/**
 * Connect to MongoDB.
 * @param {string} mongoUri - The MongoDB URI.
 * @returns {Promise<mongoose.Connection>} The MongoDB connection.
 */
async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error(MESSAGES.DB_URI_MISSING);
  }

  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(mongoUri, { autoIndex: true });
    logger.info('Connected to MongoDB');
  } catch (err) {
    err.message = `${MESSAGES.DB_CONNECTION_FAILED}: ${err.message}`;
    throw err;
  }
  return mongoose.connection;
}

module.exports = { connectDB };
