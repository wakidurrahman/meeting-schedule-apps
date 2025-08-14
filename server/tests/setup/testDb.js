/**
 * Test Database Setup
 * Provides in-memory MongoDB instance for testing
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

/**
 * Connect to in-memory database for testing
 */
const connectTestDB = async () => {
  try {
    // Start in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '7.0.0', // Use a stable version
      },
      instance: {
        dbName: 'meeting-scheduler-test',
      },
    });

    const mongoUri = mongoServer.getUri();

    // Connect mongoose to the test database
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

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
 * Disconnect from test database and stop server
 */
const disconnectTestDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    if (mongoServer) {
      await mongoServer.stop();
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
