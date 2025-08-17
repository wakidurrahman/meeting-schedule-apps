/**
 * Global test setup
 * Runs once before all tests start
 */

const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET =
    process.env.JWT_SECRET || 'test-secret-key-for-jwt-tokens-very-long-and-secure';
  process.env.TEST_DB_NAME = 'meeting-scheduler-test';

  console.log('🚀 Starting global test setup...');

  // Create MongoDB Memory Server instance
  const mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '6.0.0', // Use a more stable version
    },
    instance: {
      dbName: process.env.TEST_DB_NAME,
    },
  });

  const mongoUri = mongoServer.getUri();

  // Store the URI and server instance for use in tests
  global.__MONGO_URI__ = mongoUri;
  global.__MONGO_DB_NAME__ = process.env.TEST_DB_NAME;
  global.__MONGO_SERVER__ = mongoServer;

  console.log('✅ Global test setup completed');
  console.log(`📊 Test database URI: ${mongoUri}`);
};
