/**
 * Meeting Scheduler – GraphQL API Server
 *
 * This file boots an Express server that exposes a single GraphQL endpoint at `/graphql`.
 * It wires security (Helmet), logging (Morgan), CORS, JSON body parsing, request id correlation,
 * authentication middleware, schema creation, and a health check endpoint.
 *
 * Key responsibilities
 * - Establish a MongoDB connection before serving requests
 * - Configure standard HTTP middleware (security, logging, cors, body parsing)
 * - Attach a per-request correlation id used in logs and error responses
 * - Apply authentication for downstream resolvers via `authMiddleware`
 * - Build a GraphQL schema from SDL (`typeDefs`) and resolvers (`rootValue`)
 * - Provide a GraphiQL IDE in non-production environments
 * - Normalize GraphQL errors with a consistent `extensions` shape
 * - Expose a lightweight health check at `/`
 *
 * Environment variables (consumed here)
 * - PORT: Port number to listen on (default: 4000)
 * - CLIENT_ORIGIN: Allowed CORS origin for the client app (default: http://localhost:5173)
 * - MONGO_URI: MongoDB connection string (required by `connectDB`)
 * - NODE_ENV: Environment name; when not `production`, GraphiQL and relaxed CSP are enabled
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema, GraphQLError } = require('graphql');
require('dotenv').config();

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { connectDB } = require('./config/db');
const { authMiddleware } = require('./middleware/auth');

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

async function start() {
  /**
   * Initialize database connection before accepting traffic.
   * If the connection fails, the process will exit in the catch block at the bottom.
   */
  await connectDB(process.env.MONGO_URI);

  // Express app 
  const app = express();

  /**
   * Security headers.
   * Note: GraphiQL uses inline scripts; Helmet's CSP blocks these by default.
   * We disable CSP outside production to allow GraphiQL to work in development.
   */
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
    }),
  );

  /**
   * Request correlation id – attach a stable id to each request.
   * Logged by Morgan and returned in GraphQL errors to aid debugging.
   */
  app.use((req, _res, next) => {
    req.id = uuidv4();
    next();
  });

  /**
   * HTTP request logging with request id, status, payload size and response time.
   */
  morgan.token('id', (req) => req.id);
  app.use(morgan(':id :method :url :status :res[content-length] - :response-time ms'));

  /**
   * Cross-origin resource sharing. Allows the front-end app to call this API with credentials.
   */
  app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));

  /**
   * JSON body parsing for GraphQL POST requests.
   */
  app.use(express.json());

  /**
   * Authentication middleware.
   * Should populate `req.user` when a valid token is presented; resolvers can read from context.
   */
  app.use(authMiddleware);

  /**
   * Build a GraphQL schema from SDL. `typeDefs` should be a valid GraphQL SDL string.
   */
  const schema = buildSchema(typeDefs);

  /**
   * GraphQL endpoint
   * - rootValue: resolver map implementing the schema fields
   * - context: exposes the Express `req` object (and anything placed on it by middleware)
   * - graphiql: enabled for local development and testing
   * - customFormatErrorFn: standardizes error responses and surfaces `requestId`
   */
  app.use(
    '/graphql',
    graphqlHTTP((req) => ({
      schema: schema,
      rootValue: resolvers,
      context: { req },
      graphiql: process.env.NODE_ENV !== 'production',
     
      /**
       * Provide a consistent error shape for clients and attach diagnostic metadata.
       * If a validation library (e.g., Zod) throws a typed error, surface a BAD_USER_INPUT code
       * and include structured validation details; otherwise, default to INTERNAL_SERVER_ERROR.
       */
      customFormatErrorFn: (err) => {
        console.log('err', err);
        console.log('req', req.body);
        const isZod = err.originalError && err.originalError.name === 'ZodError';
        const code = isZod ? 'BAD_USER_INPUT' : 'INTERNAL_SERVER_ERROR';
        const message = isZod ? 'Validation failed' : err.message;
        const details = isZod ? err.originalError.issues : undefined;
        return {
          message,
          locations: err.locations,
          path: err.path,
          extensions: {
            code,
            requestId: req.id,
            details,
          },
        };
      },
    })),
  );

  /**
   * Liveness probe for monitoring and quick smoke tests.
   * Returns minimal JSON without touching downstream dependencies.
   */
  app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'meeting-scheduler-server' });
  });

  /**
   * Start HTTP server and log the listening URL.
   */
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}


start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
