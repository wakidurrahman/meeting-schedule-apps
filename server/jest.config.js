/**
 * Jest configuration for GraphQL + Mongoose testing
 * Provides comprehensive test coverage and setup for the meeting scheduler API
 */
module.exports = {
  // Test environment
  testEnvironment: 'node',

  // Test patterns
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup/testSetup.js'],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],

  // Files to collect coverage from
  collectCoverageFrom: [
    'graphql/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**',
    '!coverage/**',
    '!server.js', // Exclude main server file
  ],

  // Coverage thresholds - initially lower, will increase as we add more tests
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // Test timeout - increased for database operations
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Force exit after tests complete
  forceExit: true,

  // Detect open handles
  detectOpenHandles: true,

  // Global setup and teardown for database
  globalSetup: '<rootDir>/tests/setup/globalSetup.js',
  globalTeardown: '<rootDir>/tests/setup/globalTeardown.js',

  // Max workers for parallel execution
  maxWorkers: 1, // Run tests sequentially to avoid database conflicts
};
