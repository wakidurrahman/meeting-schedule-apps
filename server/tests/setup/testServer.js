/**
 * Test Server Setup
 * Creates a test GraphQL server instance for integration testing
 */

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const request = require('supertest');

const typeDefs = require('../../graphql/type-defs');
const resolvers = require('../../graphql/resolvers');
const authMiddleware = require('../../middleware/auth');
const { customFormatErrorFn } = require('../../middleware/error');

/**
 * Create a test Express server with GraphQL endpoint
 */
const createTestServer = () => {
  const app = express();

  // Basic middleware
  app.use(express.json());
  app.use(authMiddleware);

  // GraphQL endpoint
  app.use(
    '/graphql',
    graphqlHTTP((req) => ({
      schema: buildSchema(typeDefs),
      rootValue: resolvers,
      context: { req },
      customFormatErrorFn,
      graphiql: false, // Disable GraphiQL in tests
    })),
  );

  return app;
};

/**
 * Helper function to make GraphQL requests
 */
const graphqlRequest = (app, query, variables = {}, token = null) => {
  const req = request(app).post('/graphql');

  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }

  return req.send({
    query,
    variables,
  });
};

/**
 * Helper function to create authenticated GraphQL request
 */
const authenticatedRequest = (app, query, variables = {}, userId = 'test-user-id') => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

  return graphqlRequest(app, query, variables, token);
};

module.exports = {
  createTestServer,
  graphqlRequest,
  authenticatedRequest,
};
