/**
 * Global test setup configuration
 * Handles database setup, environment variables, and global test utilities
 */

const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-secret-key-for-jwt-tokens-very-long-and-secure';

// Test timeout is now handled in jest.config.js

// Global test helpers
global.testHelpers = {
  // Add any global test utilities here
  delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Suppress console.log during tests unless explicitly needed
const originalConsoleLog = console.log;
global.console = {
  ...console,
  log: originalConsoleLog, // Keep logs for debugging during test development
  error: originalConsoleLog, // Keep error logs for debugging
  warn: originalConsoleLog, // Keep warnings for debugging
};
