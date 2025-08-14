# Testing Documentation for Meeting Scheduler GraphQL API

## Overview

This document provides comprehensive testing documentation for the Meeting Scheduler GraphQL API server. The testing setup follows industry best practices with comprehensive unit tests, integration tests, and code coverage reporting.

## Testing Stack

- **Jest** - Primary testing framework
- **Supertest** - HTTP testing for GraphQL endpoints
- **MongoDB Memory Server** - In-memory database for isolated testing
- **Coverage Reporting** - Built-in Jest coverage with HTML/JSON/LCOV reports

## Test Structure

```
server/
├── __tests__/
│   ├── resolvers/         # GraphQL resolver tests
│   │   └── user.test.js   # User authentication & profile tests
│   ├── models/            # Mongoose model tests
│   │   └── user.test.js   # User schema validation tests
│   ├── middleware/        # Express middleware tests
│   │   └── auth.test.js   # JWT authentication tests
│   └── utils/             # Utility function tests
│       └── validators.test.js  # Zod validation schema tests
├── tests/
│   └── setup/             # Test configuration and helpers
│       ├── testDb.js      # Database setup for integration tests
│       ├── testServer.js  # GraphQL server setup for integration tests
│       ├── helpers.js     # Test data factories and utilities
│       └── testSetup.js   # Global Jest configuration
├── jest.config.js         # Jest configuration
└── .env.test             # Test environment variables
```

## Running Tests

### Basic Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci

# Run specific test file
npm test -- __tests__/resolvers/user.test.js

# Run tests matching pattern
npm test -- --testNamePattern="register"
```

### Coverage Reports

Coverage reports are generated in multiple formats:

- **Terminal**: Real-time coverage summary
- **HTML**: `coverage/lcov-report/index.html` - Interactive browser report
- **LCOV**: `coverage/lcov.info` - For CI/CD integration
- **JSON**: `coverage/coverage-final.json` - For programmatic analysis

## Test Categories

### 1. GraphQL Resolver Tests (`__tests__/resolvers/`)

**Purpose**: Test GraphQL resolver logic, authentication, validation, and error handling

**Example**: `user.test.js`

- ✅ User registration with validation
- ✅ User authentication (login/logout)
- ✅ Profile management (view/update)
- ✅ Authorization checks
- ✅ Error handling and edge cases
- ✅ Input validation with Zod schemas

**Coverage**: 96% of user resolver functions

### 2. Model Tests (`__tests__/models/`)

**Purpose**: Test Mongoose schemas, validation rules, and database operations

**Example**: `user.test.js`

- ✅ Schema validation (required fields, data types)
- ✅ Unique constraints (email uniqueness)
- ✅ Default values and transformations
- ✅ Custom validation rules (email format)
- ✅ Database operations (CRUD)
- ✅ Model methods and virtuals

**Features Tested**:

- Email format validation with regex
- Password requirement validation
- Role enumeration (USER/ADMIN)
- Automatic timestamp generation
- Data transformation (lowercase email, trimmed name)

### 3. Middleware Tests (`__tests__/middleware/`)

**Purpose**: Test Express middleware functions for authentication and error handling

**Example**: `auth.test.js`

- ✅ JWT token validation
- ✅ Bearer token parsing
- ✅ Authentication state management
- ✅ Invalid token handling
- ✅ Missing token handling
- ✅ Expired token handling

**Security Features Tested**:

- Token signature verification
- Token expiration validation
- Malformed token handling
- Case sensitivity in Authorization headers

### 4. Utility Tests (`__tests__/utils/`)

**Purpose**: Test utility functions, validation schemas, and helper methods

**Example**: `validators.test.js`

- ✅ Zod schema validation (Register, Login, UpdateProfile)
- ✅ Input sanitization and trimming
- ✅ Error message generation
- ✅ Optional field handling
- ✅ Data type validation

## Test Data Management

### Test Factories (`tests/setup/helpers.js`)

Provides consistent test data generation:

```javascript
// Generate test users
const user = createTestUser({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'ADMIN',
});

// Generate ObjectIds
const id = generateObjectId();

// Mock authentication
const authReq = createMockAuthRequest(userId);
```

### Database Setup (`tests/setup/testDb.js`)

- **Isolation**: Each test runs with a clean database
- **Performance**: In-memory MongoDB for fast execution
- **Cleanup**: Automatic cleanup between tests

## Mocking Strategy

### External Dependencies

- **Mongoose Methods**: Mocked for unit tests
- **JWT Operations**: Real JWT for auth tests, mocked for unit tests
- **GraphQL Helpers**: Mocked for resolver isolation
- **Email Services**: Mocked to prevent external calls

### Mock Patterns

```javascript
// Mock implementation with real behavior
mockHelpers.requireAuth.mockImplementation((context) => {
  if (!context.req?.userId) {
    throw new GraphQLError('Not authenticated');
  }
  return context.req.userId;
});

// Mock with controlled errors
mockValidators.RegisterInputSchema.parse.mockImplementationOnce(() => {
  throw zodError;
});
```

## Coverage Goals & Current Status

### Current Coverage (User Module)

- **Statements**: 96.15%
- **Branches**: 83.33%
- **Functions**: 100%
- **Lines**: 96.15%

### Target Coverage

- **Statements**: 85%+
- **Branches**: 80%+
- **Functions**: 90%+
- **Lines**: 85%+

## Test Results Summary

### User Resolver Tests

- **Total Tests**: 23
- **Passing**: 21 ✅
- **Failing**: 2 ⚠️ (Validation error edge cases)
- **Success Rate**: 91%

### Model Tests

- **User Schema**: Comprehensive validation testing
- **Database Operations**: CRUD operations tested
- **Constraints**: Unique fields and required fields tested

### Middleware Tests

- **Authentication**: JWT validation and error handling
- **Security**: Malformed token and unauthorized access

### Utility Tests

- **Validation Schemas**: Zod schema testing
- **Input Sanitization**: Trimming and transformation

## Continuous Integration

### CI/CD Integration

```yaml
# Example GitHub Actions
- name: Run Tests
  run: npm run test:ci

- name: Upload Coverage
  uses: codecov/codecov-action@v1
  with:
    file: ./coverage/lcov.info
```

### Quality Gates

- Minimum 80% code coverage required
- All tests must pass before deployment
- Linting and formatting checks included

## Best Practices Implemented

### 1. Test Isolation

- Each test runs independently
- Database cleared between tests
- Mocks reset between tests

### 2. Realistic Test Data

- Valid email formats and strong passwords
- Realistic user names and addresses
- Proper date formats and ObjectIds

### 3. Error Testing

- Invalid input validation
- Authentication failures
- Database constraint violations
- Network and service errors

### 4. Performance

- Fast test execution with in-memory database
- Parallel test execution where possible
- Efficient mock implementations

### 5. Maintainability

- Clear test descriptions and organization
- Reusable test helpers and factories
- Comprehensive documentation

## Future Enhancements

### Additional Test Types

- **Integration Tests**: Full GraphQL operations
- **End-to-End Tests**: Complete user workflows
- **Performance Tests**: Load and stress testing
- **Security Tests**: Penetration testing scenarios

### Extended Coverage

- **Meeting Resolvers**: Meeting CRUD operations
- **Event Resolvers**: Event creation and booking
- **Booking Resolvers**: Event booking system
- **Error Middleware**: Error formatting and logging

### Advanced Features

- **Snapshot Testing**: GraphQL response snapshots
- **Property-Based Testing**: Randomized input testing
- **Mutation Testing**: Test quality validation
- **Visual Regression**: UI component testing (if applicable)

## Troubleshooting

### Common Issues

1. **Database Connection Timeout**
   - Increase Jest timeout in `jest.config.js`
   - Check MongoDB Memory Server configuration

2. **Mock Not Working**
   - Ensure mocks are reset in `beforeEach`
   - Check mock import paths
   - Verify mock implementation timing

3. **Coverage Threshold Failures**
   - Review uncovered lines in coverage report
   - Add tests for missing branches
   - Exclude non-testable files if necessary

### Debug Commands

```bash
# Run with verbose output
npm test -- --verbose

# Run specific test with debug info
npm test -- --testNamePattern="register" --verbose

# Generate coverage report only
npm run test:coverage -- --passWithNoTests
```

This testing setup provides a solid foundation for maintaining code quality and reliability in the Meeting Scheduler GraphQL API.
