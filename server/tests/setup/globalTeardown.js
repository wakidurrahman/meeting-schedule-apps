/**
 * Global test teardown
 * Runs once after all tests complete
 */

module.exports = async () => {
  console.log('🧹 Starting global test teardown...');

  // Stop the MongoDB Memory Server
  if (global.__MONGO_SERVER__) {
    await global.__MONGO_SERVER__.stop();
    console.log('✅ MongoDB Memory Server stopped');
  }

  console.log('✅ Global test teardown completed');
};
