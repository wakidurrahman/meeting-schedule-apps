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
  await connectDB(process.env.MONGO_URI);

  const app = express();

  app.use(helmet());
  app.use((req, _res, next) => {
    req.id = uuidv4();
    next();
  });
  morgan.token('id', (req) => req.id);
  app.use(
    morgan(':id :method :url :status :res[content-length] - :response-time ms')
  );
  app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(authMiddleware);

  const schema = buildSchema(typeDefs);

  app.use(
    '/graphql',
    graphqlHTTP((req) => ({
      schema,
      rootValue: resolvers,
      context: { req },
      graphiql: process.env.NODE_ENV !== 'production',
      customFormatErrorFn: (err) => {
        console.log('err', err);
        console.log('req', req.body);
        const isZod =
          err.originalError && err.originalError.name === 'ZodError';
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
    }))
  );

  app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'meeting-scheduler-server' });
  });

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
