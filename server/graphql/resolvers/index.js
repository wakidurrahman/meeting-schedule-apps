/**
 * Main GraphQL resolvers entry point
 * Combines all domain-specific resolvers into a single resolver object
 */

const bookingResolvers = require('./booking');
const eventResolvers = require('./event');
const meetingResolvers = require('./meeting');
const userResolvers = require('./user');

/**
 * Combined resolvers object that merges all domain-specific resolvers
 * This follows the pattern expected by express-graphql with buildSchema
 */
module.exports = {
  // User resolvers
  ...userResolvers,

  // Meeting resolvers
  ...meetingResolvers,

  // Event resolvers
  ...eventResolvers,

  // Booking resolvers
  ...bookingResolvers,
};
