/**
 * Main GraphQL type definitions entry point
 * Combines all domain-specific type definitions into a single schema
 */

const scalars = require('../shared/scalars');

const bookingTypeDefs = require('./booking');
const eventTypeDefs = require('./event');
const meetingTypeDefs = require('./meeting');
const userTypeDefs = require('./user');
const authTypeDefs = require('./auth');

// Base types that other files extend
const baseTypes = `
  # Base Query type (extended by other modules)
  type Query {
    _empty: String
  }

  # Base Mutation type (extended by other modules)
  type Mutation {
    _empty: String
  }

  # Base Subscription type (extended by other modules)
  type Subscription {
    _empty: String
  }
`;

module.exports = [
  scalars,
  baseTypes,
  userTypeDefs,
  authTypeDefs,
  meetingTypeDefs,
  eventTypeDefs,
  bookingTypeDefs,
].join('\n');
