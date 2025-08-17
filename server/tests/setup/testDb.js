/**
 * Test Database Setup
 * Provides in-memory MongoDB instance for testing
 */

const mongoose = require('mongoose');

/**
 * Connect to in-memory database for testing
 */
const connectTestDB = async () => {
  try {
    // Use the global MongoDB URI from global setup
    const mongoUri = global.__MONGO_URI__;

    if (!mongoUri) {
      throw new Error('Global MongoDB URI not found. Make sure globalSetup is configured.');
    }

    // Disconnect if already connected
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Connect mongoose to the test database
    await mongoose.connect(mongoUri);

    console.log('✅ Connected to test database');
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    throw error;
  }
};

/**
 * Clear all collections in the test database
 */
const clearTestDB = async () => {
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;

    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
};

/**
 * Disconnect from test database
 * Note: MongoDB server is managed by global teardown
 */
const disconnectTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    console.log('✅ Disconnected from test database');
  } catch (error) {
    console.error('❌ Error disconnecting test database:', error);
    throw error;
  }
};

module.exports = {
  connectTestDB,
  clearTestDB,
  disconnectTestDB,
};
