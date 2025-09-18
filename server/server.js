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
 * - Error handling middleware
 *
 * Environment variables (consumed here)
 * - PORT: Port number to listen on (default: 4000)
 * - CLIENT_ORIGIN: Allowed CORS origin for the client app (default: http://localhost:5173)
 * - MONGO_URI: MongoDB connection string (required by `connectDB`)
 * - NODE_ENV: Environment name; when not `production`, GraphiQL and relaxed CSP are enabled
 */
const fs = require('fs').promises;
const path = require('path');

const cors = require('cors');
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const helmet = require('helmet');
const morgan = require('morgan');
const multer = require('multer');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const { connectDB } = require('./config/db');
const resolvers = require('./graphql/resolvers');
const typeDefs = require('./graphql/type-defs');
const { authMiddleware } = require('./middleware/auth');
const { errorHandler, normalizeError } = require('./middleware/error');

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Allow multiple client origins for development and production builds
const allowedOrigins = [
  'http://localhost:5173', // Development server
  'http://localhost:4173', // Production preview server (vite preview)
  'http://localhost:4174', // Production preview server (alternative port)
  'http://localhost:4175', // Production preview server (alternative port)
  'https://meeting-schedule-apps.netlify.app', // Production Netlify domain (correct one)
  'https://meeting-scheduler-apps.netlify.app', // Alternative domain (backup)
  // Note: Deploy previews are handled by regex patterns below (not static wildcards)
  CLIENT_ORIGIN, // From environment variable (only if different)
].filter((origin, index, arr) => origin && arr.indexOf(origin) === index); // Remove duplicates and undefined

async function start() {
  /**
   * Initialize database connection before accepting traffic.
   * If the connection fails, the process will exit in the catch block at the bottom.
   */
  await connectDB(process.env.MONGO_URI);

  // Express app
  const app = express();

  // Trust Railway proxy (secure configuration for production)
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // Trust first proxy (Railway)
  } else {
    app.set('trust proxy', true); // Development - trust all
  }

  /**
   * Security headers.
   * Note: GraphiQL uses inline scripts; Helmet's CSP(content security policy) blocks these by default.
   * We disable CSP outside production to allow GraphiQL to work in development.
   */
  app.use(
    // Helmet for security headers (CSP, XSS, etc.)
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
      xssFilter: true, // Enable X-XSS-Protection header
      frameguard: { action: 'deny' }, // Prevent clickjacking
      referrerPolicy: { policy: 'no-referrer' }, // Hide referrer info
      crossOriginResourcePolicy: { policy: 'same-origin' }, // Restrict resource sharing
    }),
    // Rate limiting: limit each IP to 100 requests per 15 minutes
    require('express-rate-limit')({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      message: { error: 'Too many requests, please try again later.' },
      // Skip rate limiting validation for Railway proxy setup
      skip: (_req) => process.env.NODE_ENV !== 'production',
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
   * Supports multiple origins for development and production builds.
   */
  app.use(
    cors({
      origin(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
          return callback(null, true);
        }

        // Check for exact matches
        if (allowedOrigins.indexOf(origin) !== -1) {
          return callback(null, true);
        }

        // Check for Netlify deploy preview patterns (both domain variations)
        if (origin) {
          const deployPreviewPatterns = [
            /^https:\/\/deploy-preview-\d+--meeting-schedule-apps\.netlify\.app$/,
            /^https:\/\/deploy-preview-\d+--meeting-scheduler-apps\.netlify\.app$/,
          ];

          if (deployPreviewPatterns.some((pattern) => pattern.test(origin))) {
            return callback(null, true);
          }
        }

        console.warn(
          `⚠️ CORS blocked request from origin: ${origin}. Allowed origins:`,
          allowedOrigins,
        );
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }),
  );

  /**
   * Static file serving for uploaded images
   */
  const uploadsPath = path.join(__dirname, '..', 'client', 'public', 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  /**
   * JSON body parsing for GraphQL POST requests.
   */
  app.use(express.json());

  // Additional error logging for debugging production issues (AFTER body parsing)
  app.use((req, res, next) => {
    if (req.method === 'POST' && req.url === '/graphql') {
      console.log('🚀 GraphQL Request Debug:', {
        requestId: req.id,
        method: req.method,
        url: req.url,
        origin: req.headers.origin,
        contentType: req.headers['content-type'],
        authorization: req.headers.authorization ? 'Bearer ***' : 'none',
        bodyExists: !!req.body,
        bodyKeys: req.body ? Object.keys(req.body) : 'no-body',
        queryExists: !!req.body?.query,
        variablesExists: !!req.body?.variables,
      });
    }
    next();
  });

  /**
   * Authentication middleware.
   * Should populate `req.user` when a valid token is presented; resolvers can read from context.
   */
  app.use(authMiddleware);

  /**
   * Image Upload Configuration
   */
  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, '..', 'client', 'public', 'uploads', 'users');

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
      // Only allow image files
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'));
      }
    },
  });

  /**
   * Image Upload Endpoint
   * POST /api/upload/image
   * Processes uploaded image, creates multiple sizes, and returns URLs
   */
  app.post('/api/upload/image', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required',
        });
      }

      // Ensure uploads directory exists
      try {
        await fs.mkdir(uploadsDir, { recursive: true });
      } catch (err) {
        // Directory might already exist, ignore error
      }

      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${userId}-${timestamp}`;
      const fileExtension = '.jpg'; // Always convert to JPEG for consistency

      // Define sizes
      const sizes = {
        thumb: 64,
        small: 150,
        medium: 300,
      };

      const imageUrls = {};

      // Process and save each size
      for (const [sizeName, dimension] of Object.entries(sizes)) {
        const outputFilename = `${filename}-${sizeName}${fileExtension}`;
        const outputPath = path.join(uploadsDir, outputFilename);

        await sharp(req.file.buffer)
          .resize(dimension, dimension, {
            fit: 'cover',
            position: 'center',
          })
          .jpeg({
            quality: 80,
            progressive: true,
          })
          .toFile(outputPath);

        imageUrls[sizeName] = `/uploads/users/${outputFilename}`;
      }

      res.json({
        success: true,
        imageUrl: imageUrls,
      });
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process image',
      });
    }
  });

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
      schema,
      rootValue: resolvers,
      context: { req },
      // graphiql: process.env.NODE_ENV !== 'production',

      // 👇 enable the header editor in the built-in GraphiQL UI
      graphiql:
        process.env.NODE_ENV !== 'production'
          ? { headerEditorEnabled: true /* optional: shouldPersistHeaders: true */ }
          : false,

      /**
       * Provide a consistent error shape for clients and attach diagnostic metadata.
       * If a validation library (e.g., Zod) throws a typed error, surface a BAD_USER_INPUT code
       * and include structured validation details; otherwise, default to INTERNAL_SERVER_ERROR.
       */
      customFormatErrorFn: (err) => {
        const n = normalizeError(err.originalError || err);
        return {
          message: n.message,
          locations: err.locations,
          path: err.path,
          extensions: {
            code: n.code,
            requestId: req.id,
            details: n.details,
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

  // Central error handler (must be before server.listen)
  app.use(errorHandler);

  /**
   * Start HTTP server and log the listening URL.
   */
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  throw err;
});
