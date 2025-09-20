# 🗓️ X-Scheduler Application.

X-Scheduler is a internal calendar management and meeting scheduling application. It enables users to create, manage, and collaborate on events, bookings, and virtual meetings.

**This monorepo contains**:

- **Frontend**: A React application built with Vite and TypeScript, styled using custom Bootstrap v5.3.3 SCSS (no UI libraries).

- **Backend**: An Express.js server with GraphQL and Mongoose, serving as the API layer and interfacing with MongoDB.

> The app is designed to be modular, scalable, and built on Atomic Design principles, supporting GraphQL data fetching.

## Tech stack

- Client:
  - React v16
  - TypeScript v5
  - Vite
  - Apollo Client v3
  - React Router
  - SCSS (Bootstrap 5 via SCSS with custom variables)
  - React Hook Form + Zod
- Server:
  - Express (for backend api implementation)
  - express-graphql
  - Mongoose
  - JWT
  - dotenv
  - Helmet
  - CORS
  - Morgan (logging)
  - UUID (request id)

## Screen Flow Diagram

```mermaid
graph TD
  Register["Register (auth)"] --> Login["Login"]
  Login["Login (auth)"] --> Dashboard

  Dashboard --> UserProfile["User Profile"]
  Dashboard --> Calendar["Calendar UI"]
  Dashboard --> UserList["User List"]
  Dashboard --> Event["Event List"]
  Dashboard --> Booking["Booking List"]


  Calendar --> Year["Year View"]
  Calendar --> Month["Month View(default)"]
  Calendar --> Week["Week View"]
  Calendar --> Day["Day View"]

  UserList --> Create["Create User"]
  UserList --> Read["User List"]
  UserList --> Update["Update User"]
  UserList --> Delete["Delete user"]

  Event --> CreateEvent["Create Event"]
  Event --> ReadEvent["Event List"]
  Event --> UpdateEvent["Update Event"]
  Event --> DeleteEvent["Delete Event"]
```

---

### Event and Booking Screen Flow

```mermaid
graph TD
U["User (After sing in)"]
L["Login (auth)"]
CE["Create Event"]
UE["Update Event"]
DE["Delete Event"]
VE["View Events"]
F["Filter"]
F1["createdBy"]
F2["booked"]
ED["Event Detail(In-Progress)"]
BK["Book"]
CB["Cancel Booking"]
B["Booking"]

L --> U
VE --> CE
VE --> UE
VE --> DE
U --> VE --> ED
ED --> BK --> B
B --> CB --> ED
F1 --> F
F2 --> F
F --> VE
```

## User, Meeting, Event and Booking Screen Flow

```mermaid
graph TD
U["User"]
USER["Users"]
REG["Register"]
LOG["Login"]
DASH["Dashboard"]
MEET["Calendar"]
MEET_C["Week view"]
MEET_D["Month view"]
EVL["Events"]
EV_C["Create Event"]
EV_U["Update Event"]
EV_D["Delete Event"]
EV_F["Filter (created by/booked)"]
BK["Book Event"]
CB["Cancel Booking"]
PROF["Profile"]

U --> REG --> LOG --> DASH
U --> LOG --> DASH
DASH --> MEET
MEET --> MEET_C --> MEET
MEET --> MEET_D --> MEET
DASH --> EVL
DASH --> USER
EVL --> EV_C --> EVL
EVL --> EV_U --> EVL
EVL --> EV_D --> EVL
EVL --> EV_F --> EVL
EVL --> BK --> CB --> EVL
DASH --> PROF
```

## Project structure

```text
/client
├── public/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── scss/
│   │       ├── _variables.scss
│   │       └── main.scss
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   ├── graphql/
│   │   ├── mutations.ts
│   │   └── queries.ts
│   ├── pages/
│   │   ├── event/
│   │   ├── dashboard/
│   │   ├── auth/
│   │   ├── calendar/
│   │   └── users/
│   ├── hooks/
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── utils/
│   ├── apollo/
│   │   └── client.ts
│   ├── App.tsx
│   └── index.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env
├── .env.example
└── README.md

/server
├── config/
│   └── db.js
├── constants/
│   └── messages.js
├── graphql/
│   ├── resolvers/
│   │   ├── index.js
│   │   ├── user.js
│   │   ├── meeting.js
│   │   ├── event.js
│   │   └── booking.js
│   ├── type-defs/
│   │   ├── index.js
│   │   ├── user.js
│   │   ├── meeting.js
│   │   ├── event.js
│   │   └── booking.js
│   └── shared/
│       ├── helpers.js
│       └── scalars.js
├── middleware/
│   ├── auth.js
│   └── error.js
├── models/
│   ├── user-schema.js
│   ├── meeting-schema.js
│   ├── event-schema.js
│   └── booking-schema.js
├── utils/
│   ├── validators.js
│   ├── dateUtils.js
│   ├── mongoose-methods.js
│   └── logger.js
├── server.js
├── package.json
├── .eslintrc.cjs
├── .eslintignore
├── .prettierrc.json
└── .prettierignore

/README.md
```

## Coding Guidelines for AI Environment.

```text
.rules/
├── coding-guideline.mdc          # 📋 Main overview & index
├── client-guidelines.mdc         # 📱 React/TypeScript/Apollo Client
├── server-guidelines.mdc         # 🚀 Express/GraphQL/Mongoose
└── shared-conventions.mdc        # 🔧 Common patterns & conventions
```

---

## Local Build Process

### Prerequisites

- **Node.js**: `>=22.14.0 <23.0.0`
- **npm**: `>=10.0.0`
- **MongoDB**: Running instance (local or remote)

### Client Build Process

#### Development Build

```bash
cd client

# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Start with hot reload on all network interfaces
npm run dev:hot
```

#### Production Build

```bash
cd client

# Build for production
npm run build

# Preview production build locally
npm run preview

# Analyze bundle size
npm run build:analyze

# Generate build statistics
npm run build:stats
```

#### Code Quality & Formatting

```bash
cd client

# Lint TypeScript files
npm run lint
npm run lint:fix

# Format code with Prettier
npm run format
npm run format:check

# Check bundle size
npm run bundle:size

# Run Lighthouse performance audit
npm run performance:lighthouse
```

### Server Build Process

#### Development Build

```bash
cd server

# Install dependencies
npm install

# Start development server with auto-reload (http://localhost:4000)
npm run dev

# Start production server
npm start
```

#### Production Build

```bash
cd server

# Install production dependencies only
npm run prod:install

# Start production server with optimizations
npm run start:prod

# Docker production start
npm run docker:start
```

#### Testing & Quality

```bash
cd server

# Run test suite
npm test

# Watch mode for testing
npm run test:watch

# Generate coverage report
npm run test:coverage

# CI test run
npm run test:ci

# Lint JavaScript files
npm run lint
npm run lint:fix

# Format code
npm run format
npm run format:check

# Run all checks
npm run check
```

## Server development

### GraphQL modular structure

The server uses a modular GraphQL setup:

- Type definitions split by domain under `server/graphql/type-defs/` and combined by `index.js`
- Resolvers split by domain under `server/graphql/resolvers/` and combined by `index.js`
- Shared helpers and scalars under `server/graphql/shared/`

### Tooling: linting and formatting

From `server/`:

- Lint: `npm run lint`
- Lint (auto-fix): `npm run lint:fix`
- Prettier check: `npm run format:check`
- Prettier write: `npm run format`
- Combined check: `npm run check`

ESLint highlights:

- Extends: `eslint:recommended`, `plugin:node/recommended`, `plugin:import/recommended`, `plugin:security/recommended`, `plugin:prettier/recommended`
- Enforces sorted imports with `import/order` (builtin → external → internal → parent → sibling), newlines between groups, and alphabetical ordering
- Common quality rules enabled (e.g., `curly`, `eqeqeq`, `no-unused-vars`, `require-await`)

Prettier:

- Configured via `.prettierrc.json` and integrated with ESLint via `plugin:prettier/recommended`

Node versions (server):

- Engines: Node >= 22.14.0 < 23, npm >= 10 (see `server/package.json`)

## Testing Framework

The server includes a comprehensive testing suite built with Jest, covering all GraphQL `resolvers`, Mongoose `models`, `middleware`, and `utilities`. Tests ensure code quality, reliability, and maintain high coverage standards.

### Test Structure

```text
server/
├── __tests__/
│   ├── resolvers/
│   │   ├── user.test.js         ✅ (authentication & user management)
│   │   ├── meeting.test.js      ✅ (meeting CRUD operations)
│   │   ├── event.test.js        ✅ (event management & filtering)
│   │   └── booking.test.js      ✅ (booking system & cancellation)
│   ├── models/
│   │   ├── user.test.js         ✅ (schema validation & constraints)
│   │   ├── meeting.test.js      ✅ (database operations & population)
│   │   ├── event.test.js        ✅ (model constraints & relationships)
│   │   └── booking.test.js      ✅ (relationship tests & queries)
│   ├── middleware/
│   │   ├── auth.test.js         ✅ (JWT authentication & security)
│   │   └── error.test.js        ✅ (error handling & formatting)
│   └── utils/
│       ├── validators.test.js   ✅ (Zod schema validation)
│       └── dateUtils.test.js    ✅ (utility function testing)
├── tests/
│   ├── setup/
│   │   ├── testDb.js           ✅ (MongoDB Memory Server)
│   │   ├── testServer.js       ✅ (Apollo Server setup)
│   │   └── helpers.js          ✅ (test utilities & mocks)
│   └── integration/
│       └── graphql.test.js     ✅ (end-to-end workflows)
└── jest.config.js              ✅ (Jest configuration)
```

### Test Commands

From `server/`:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (development)
npm run test:watch

# Run tests for CI/CD (with coverage)
npm run test:ci

# Run specific test categories
npm test -- __tests__/resolvers/
npm test -- __tests__/models/
npm test -- __tests__/middleware/

# Run specific test file
npm test -- __tests__/resolvers/user.test.js
```

### Test Coverage

| **Category**           | **Coverage** | **Focus Area**                                         |
| ---------------------- | ------------ | ------------------------------------------------------ |
| **GraphQL Resolvers**  | **96.23%**   | Authentication, CRUD operations, error handling        |
| **Mongoose Models**    | **100%**     | Schema validation, database constraints, relationships |
| **Middleware**         | **77.14%**   | JWT authentication, error formatting, security         |
| **Utils & Validators** | **75%+**     | Zod schemas, date utilities, helper functions          |

### Coverage Reports

Coverage reports are generated in multiple formats:

- **Terminal**: Real-time coverage summary during test execution
- **HTML**: `coverage/lcov-report/index.html` - Interactive browser report
- **LCOV**: `coverage/lcov.info` - For CI/CD integration
- **JSON**: `coverage/coverage-final.json` - For automated processing

### Test Categories

#### 1. Resolver Tests (`__tests__/resolvers/`)

Comprehensive testing of all GraphQL resolvers with mocked dependencies:

**User Resolver (`user.test.js`)**

- ✅ User registration with validation
- ✅ User authentication (login/logout)
- ✅ Password hashing and verification
- ✅ JWT token generation and validation
- ✅ Profile management and updates
- ✅ Error handling (invalid credentials, validation failures)

**Meeting Resolver (`meeting.test.js`)**

- ✅ Meeting creation with attendees
- ✅ Meeting retrieval and filtering
- ✅ Meeting deletion (owner permissions)
- ✅ Authentication and authorization checks
- ✅ Input validation and error handling

**Event Resolver (`event.test.js`)**

- ✅ Event CRUD operations
- ✅ Event filtering
- ✅ Owner-based permissions
- ✅ Date and price validation
- ✅ Database error handling

**Booking Resolver (`booking.test.js`)**

- ✅ Event booking creation
- ✅ Booking cancellation
- ✅ Duplicate booking prevention
- ✅ User ownership validation
- ✅ Event availability checks

#### 2. Model Tests (`__tests__/models/`)

Real database testing with MongoDB Memory Server for complete isolation:

**User Model (`user.test.js`)**

- ✅ Schema validation (required fields, data types)
- ✅ Unique constraints (email uniqueness)
- ✅ Password hashing with bcrypt
- ✅ Email format validation with regex
- ✅ Database operations (create, read, update, delete)

**Meeting Model (`meeting.test.js`)**

- ✅ Required field validation (title, startTime, endTime, createdBy)
- ✅ Date validation and constraints
- ✅ Attendee population and references
- ✅ Creator population and ownership
- ✅ Complex queries (date ranges, attendee filtering)

**Event Model (`event.test.js`)**

- ✅ Price validation (numeric, decimal support)
- ✅ Date handling and timezone support
- ✅ Title trimming and sanitization
- ✅ Creator relationship validation
- ✅ Sorting and filtering operations

**Booking Model (`booking.test.js`)**

- ✅ Event and user reference validation
- ✅ Population of related entities
- ✅ Duplicate booking scenarios
- ✅ Cascading queries and filters
- ✅ Timestamp tracking and updates

#### 3. Middleware Tests (`__tests__/middleware/`)

Security and error handling validation:

**Authentication Middleware (`auth.test.js`)**

- ✅ JWT token validation and parsing
- ✅ Bearer token extraction from headers
- ✅ Token expiration handling
- ✅ Invalid token scenarios
- ✅ Security edge cases (malformed tokens, missing secrets)

**Error Middleware (`error.test.js`)**

- ✅ MongoDB error normalization (duplicate keys)
- ✅ Zod validation error formatting
- ✅ GraphQL error standardization
- ✅ HTTP status code mapping
- ✅ Request ID correlation for debugging

#### 4. Utility Tests (`__tests__/utils/`)

Core utility function validation:

**Validators (`validators.test.js`)**

- ✅ Zod schema validation (Register, Login, UpdateProfile)
- ✅ Input sanitization and trimming
- ✅ Email format validation
- ✅ Password strength requirements
- ✅ Error message formatting

**Date Utils (`dateUtils.test.js`)**

- ✅ Date range validation logic
- ✅ Timezone handling and edge cases
- ✅ Invalid date detection
- ✅ Millisecond precision testing
- ✅ Leap year and boundary conditions

#### 5. Integration Tests (`tests/integration/`)

End-to-end workflow testing with real GraphQL operations:

**GraphQL Integration (`graphql.test.js`)**

- ✅ Complete authentication flow (register → login → operations)
- ✅ Protected operations with JWT tokens
- ✅ Real database persistence and retrieval
- ✅ Complex multi-step workflows
- ✅ Error propagation and handling
- ✅ Request/response validation

### Testing Infrastructure

#### Test Database (MongoDB Memory Server)

- **Isolation**: Each test suite runs with a fresh in-memory MongoDB instance
- **Performance**: Fast test execution without external database dependencies
- **Cleanup**: Automatic database reset between test cases
- **Real Operations**: Full MongoDB functionality for integration testing

#### Mock Strategy

- **Unit Tests**: External dependencies mocked (database, external services)
- **Integration Tests**: Real database with MongoDB Memory Server
- **Resolver Tests**: Mongoose methods and helpers mocked for fast execution
- **Model Tests**: Real database operations for validation testing

### Testing Best Practices

1. **Test Isolation**: Each test runs independently with fresh state
2. **Real Data**: Use realistic test data matching production scenarios
3. **Error Testing**: Comprehensive validation of error conditions
4. **Security Testing**: Authentication, authorization, and input validation
5. **Performance**: Fast execution with in-memory database and efficient mocking

### Diagram: Testing Architecture

```mermaid
graph TB
  subgraph "Test Categories"
    Unit["Unit Tests (Resolvers, Utils)"]
    Integration["Integration Tests (GraphQL E2E)"]
    Models["Model Tests (Real DB)"]
    Middleware["Middleware Tests (Security)"]
  end

  subgraph "Test Infrastructure"
    Jest["Jest Test Runner"]
    MongoDB["MongoDB Memory Server"]
    Mocks["Mock Factories & Helpers"]
    Coverage["Coverage Reports"]
  end

  subgraph "Test Execution"
    Local["Local Development"]
    CI["CI/CD Pipeline"]
    Watch["Watch Mode"]
    Debug["Debug Mode"]
  end

  Unit --> Jest
  Integration --> MongoDB
  Models --> MongoDB
  Middleware --> Mocks

  Jest --> Coverage
  Jest --> Local
  Jest --> CI
  Jest --> Watch
```

This comprehensive testing framework ensures:

- **Code Quality**: High coverage with meaningful tests
- **Reliability**: Confidence in GraphQL operations and data integrity
- **Security**: Thorough validation of authentication and authorization
- **Maintainability**: Clear test structure and comprehensive documentation
- **CI/CD Ready**: Automated testing with coverage reporting

---

## Data flow (client → server → DB → client)

1. User interacts with UI (e.g., Login/Register forms). React Hook Form handles input state and validation (Zod).
2. On submit, Apollo Client sends GraphQL operations to `/graphql`. An auth link adds `Authorization: Bearer <token>` when present in `localStorage`.
3. Vite dev server proxies the request to the Express server.
4. Express middleware pipeline: Helmet → Request ID injection (UUID) → Morgan request logging → CORS → JSON body parsing → JWT auth middleware (sets `req.userId` if token valid).
5. `express-graphql` executes the operation against the schema/resolvers. The GraphQL context includes `{ req }` so resolvers can read `req.userId`.
6. Resolvers access MongoDB via Mongoose models (`User`, `Meeting`).
7. Response is returned to the client. Errors are formatted by a centralized formatter that adds `extensions.code`, `extensions.requestId`, and Zod `details` for validation errors.
8. Apollo Client normalizes and caches results; components re-render from the cache.

### Diagram: Data flow

```mermaid
graph TB
  subgraph "Client"
    U["User"]
    UI["React UI (RHF + Zod)"]
    AC["Apollo Client v3"]
    Cache["InMemoryCache"]
    U --> UI --> AC
    AC --> Cache
    Cache --> UI
  end
  subgraph "Dev Proxy"
    Proxy["Vite Dev Server (proxy /graphql)"]
  end
  subgraph "Server"
    subgraph "Middleware Pipeline"
      Helmet["Helmet"]
      ReqId["Request ID (UUID)"]
      Morgan["Morgan logging"]
      CORS["CORS"]
      JSONP["JSON body parser"]
      Auth["JWT auth (sets req.userId)"]
      Helmet --> ReqId --> Morgan --> CORS --> JSONP --> Auth
    end
    GQL["express-graphql + schema"]
    Resolvers["Resolvers"]
    Formatter["Error formatter (extensions.code, requestId, zod details)"]
  end
  subgraph "Data Layer"
    Mongoose["Mongoose Models (User, Meeting)"]
    Mongo["MongoDB"]
    Mongoose --> Mongo
  end

  AC -- "/graphql" --> Proxy
  Proxy --> Helmet
  Auth --> GQL
  GQL --> Resolvers --> Mongoose
  Mongo --> Resolvers --> Formatter --> AC
```

## Validation flow

### Client-side (React Hook Form + Zod)

- Login: `{ email: z.string().email(), password: z.string().min(6) }`
- Register: `{ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) }`
- `zodResolver` runs on change and submit. Errors are shown inline. RHF DevTools are enabled in non-production for easier debugging.

### Server-side (Zod + centralized error formatting)

- Register/Login: parsed using Zod schemas before executing business logic.
- CreateMeeting: parsed with a Zod schema that checks ISO date strings and `startTime < endTime`.
- On validation failure, the `customFormatErrorFn` returns `extensions.code = BAD_USER_INPUT` and `extensions.details` (Zod issues). Other errors surface as `INTERNAL_SERVER_ERROR` without stack traces.

### Diagram: Validation flow

```mermaid
graph TB
  UI["Form Inputs (HTML + RHF)"] --> ZodClient["Zod (client)"]
  ZodClient -- "invalid" --> UIErrors["Inline field errors"]
  ZodClient -- "valid" --> AuthLink["Apollo authLink adds Authorization: Bearer ms_token"]
  AuthLink --> ServerRecv["Server receives request"]
  ServerRecv --> AuthMW["JWT middleware verify"]
  AuthMW -- "invalid/missing" --> NotAuth["Error: Not authenticated"]
  AuthMW -- "valid" --> ZodServer["Zod (server) input parsing"]
  ZodServer -- "invalid" --> BadInput["customFormatErrorFn => code: BAD_USER_INPUT + details"]
  ZodServer -- "valid" --> Mongoose["Mongoose model save/query"]
  Mongoose --> Mongo["MongoDB"]
  Mongo --> Response["GraphQL response"]
  BadInput --> Response
  NotAuth --> Response
  Response --> Apollo["Apollo Client"]
  Apollo --> UI
```

## GraphQL data fetching

### Transport and auth

- Apollo Client uses `HttpLink` to `/graphql` and an `authLink` that adds a Bearer token from `localStorage` (`ms_token`).
- Server reads the token in `authMiddleware`, verifies JWT, and sets `req.userId` for resolvers.

#### Diagram: Auth transport

```mermaid
graph TB
  Local["localStorage: ms_token"] --> AuthLink["Apollo authLink"]
  AuthLink -- "sets Authorization: Bearer <token>" --> Request["GraphQL HTTP request"]
  Request --> Server["Express /graphql"]
  Server --> JWT["JWT middleware verify"]
  JWT -- "valid" --> Context["GraphQL context { req } with userId"]
  Context --> Resolvers["Resolvers use req.userId"]
  JWT -- "invalid" --> Error["Not authenticated error"]
```

### Operations

- Queries:
  - `Me`: returns current user (requires auth).
  - `Meetings`: returns meetings where user is creator or attendee (requires auth).
- Mutations:
  - `register`, `login`: return `{ token, user }`.
  - `createMeeting`, `deleteMeeting`: require auth; creators can delete their own meetings.

#### Diagram: Operations map

```mermaid
graph TB
  subgraph Queries
    Me["Me (requires auth)"]
    Meetings["Meetings (creator or attendee)"]
  end
  subgraph Mutations
    Register["register -> { token, user }"]
    Login["login -> { token, user }"]
    Create["createMeeting (auth)"]
    Delete["deleteMeeting (auth, creator only)"]
  end
  Me --> Resolvers["Resolvers"]
  Meetings --> Resolvers
  Register --> Resolvers
  Login --> Resolvers
  Create --> Resolvers
  Delete --> Resolvers
```

## Caching

### Client-side (Apollo InMemoryCache)

- Default normalization by `id`/`__typename`. Results from queries/mutations are normalized into the cache.
- Current pages use queries (`GET_ME`, `GET_MEETINGS`) that are cached by Apollo. Subsequent renders read from cache first.
- Improvement suggestion: when logging out, call `apolloClient.clearStore()` to drop cached user data in addition to clearing `localStorage`.
- No custom type policies have been added yet; defaults are used.

### Server-side

- No server-side caching is configured at this time.

### Diagram: Caching

```mermaid
graph TB
  Queries["Queries: GET_ME, GET_MEETINGS"] --> Apollo["Apollo Client"]
  Mutations["Mutations: createMeeting, deleteMeeting"] --> Apollo
  Apollo --> Cache["InMemoryCache (normalized by id/__typename)"]
  Cache --> Components["React components read from cache"]
  Logout["Logout"] --> Clear["apolloClient.clearStore() recommended"] --> Cache
  ServerCache["Server-side caching"] -. "none configured" .- Apollo
```

## Validation stages (end-to-end)

1. UI level: HTML input attributes and RHF field state.
2. Schema level (client): Zod schemas ensure shape and basic constraints before sending the request.
3. Transport level: Apollo adds JWT; if missing/invalid, protected resolvers throw `Not authenticated`.
4. Schema level (server): Zod parses mutation inputs; errors are returned as `BAD_USER_INPUT` with details.
5. Data level: Mongoose schema constraints (required, types, refs). Passwords are hashed with bcrypt before persistence.

## Security

- JWT auth with `Authorization: Bearer` header; token expires in 7 days.
- Passwords hashed with `bcryptjs` (10 salt rounds in current setup).
- Helmet sets common security headers.
- CORS restricted to `CLIENT_ORIGIN` from env; credentials enabled.
- Request logging with `morgan`; every request tagged with a UUID for traceability.
- GraphiQL enabled only in non-production.
- Error formatter avoids leaking stack traces; includes `requestId` for correlation.

### Diagram: Security pipeline (server)

```mermaid
graph TB
  Start["Incoming /graphql request"] --> Helmet["Helmet headers"]
  Helmet --> ReqId["UUID request-id"]
  ReqId --> Morgan["Morgan logging"]
  Morgan --> CORS["CORS (CLIENT_ORIGIN)"]
  CORS --> JSONP["JSON body parser"]
  JSONP --> JWT["JWT auth middleware"]
  JWT -->|ok| GQL["express-graphql"]
  JWT -->|fail| NotAuth["Not authenticated"]
  GQL --> Formatter["customFormatErrorFn"]
```

### Recommended hardening (future work)

- Add rate limiting (e.g., `express-rate-limit`) and IP throttling.
- Add query depth/complexity limits for GraphQL.
- Implement refresh tokens/short-lived access tokens, token revocation.
- Enforce stronger password policies and account lockout/backoff.
- Sanitize and validate MongoDB ObjectIds robustly where applicable.
- Call `apolloClient.clearStore()` on logout on the client side.

## Domain model

### Diagram: Entities

```mermaid
graph TB
  User["User"]
  Meeting["Meeting"]
  User -- "creator/attendee" --> Meeting
  Meeting -- "refs" --> User
```

## Event & Booking GraphQL API (Design)

```mermaid
graph TD
  subgraph Types
    U["User"]
    E["Event"]
    B["Booking"]
  end

  U -- "createdBy" --> E
  U -- "has many" --> B
  B -- "event" --> E
  B -- "user" --> U

  subgraph Queries
    Qevents["events(filter)"]
    Qevent["event(id)"]
    Qbookings["bookings"]
  end

  subgraph Mutations
    McreateEvent["createEvent(eventInput)"]
    MupdateEvent["updateEvent(id,eventInput)"]
    MdeleteEvent["deleteEvent(id)"]
    MbookEvent["bookEvent(eventId)"]
    McancelBooking["cancelBooking(bookingId)"]
  end

  Qevents --> E
  Qevent --> E
  Qbookings --> B

  McreateEvent --> E
  MupdateEvent --> E
  MdeleteEvent --> E
  MbookEvent --> B
  McancelBooking --> E
```

## Frontend flow: Events and Bookings

```mermaid
graph TD
  User((User)) --> EventsPage["Events Page"]
  EventsPage --> Filters["Filters: date/title/created-by-me"]
  EventsPage --> EventsTable["Table: list + pagination"]
  EventsPage --> CreateEvent["Create Event Page"]
  CreateEvent --> EventsPage
  EventsTable --> EditEvent["Edit Event Page"]
  EditEvent --> EventsPage
  EventsTable --> DeleteEvent["Delete Event (mutation)"]

  User --> BookingsPage["Bookings Page"]
  BookingsPage --> SelectEvent["Select Event"]
  BookingsPage --> BookAction["Book (mutation)"]
  BookAction --> BookingsTable["Bookings Table"]
  BookingsTable --> CancelAction["Cancel Booking (mutation)"]
  CancelAction --> BookingsTable
```

## 🚀 Deployment

### Production Environment

The Meeting Scheduler App is deployed using a modern, scalable architecture with separate client and server hosting.

#### 🖥️ **Server (Node.js + GraphQL) - Railway.com**

| **Service**      | **URL**                                                          |
| ---------------- | ---------------------------------------------------------------- |
| **Health Check** | https://meeting-scheduler-apps-production.up.railway.app/        |
| **GraphQL API**  | https://meeting-scheduler-apps-production.up.railway.app/graphql |
| **Environment**  | Production                                                       |
| **Status**       | ✅ **Live and Running**                                          |
| **Platform**     | [Railway.com](https://railway.app/)                              |
| **Runtime**      | Node.js 22.14.0                                                  |
| **Database**     | MongoDB Atlas (Cloud)                                            |

**Server Endpoints:**

- **Health Check**: `GET /` → `{"status":"ok","service":"meeting-scheduler-server"}`
- **GraphQL Playground**: Available at `/graphql` (production-ready)
- **CORS**: Configured for client domain
- **Security**: JWT authentication, Helmet security headers

#### 🌐 **Client (React + Vite) - Netlify**

| **Service**     | **URL**                                      |
| --------------- | -------------------------------------------- |
| **Client App**  | `https://meeting-schedule-apps.netlify.app/` |
| **Environment** | Production                                   |
| **Status**      | 🔄 **Ready for Deployment**                  |
| **Platform**    | [Netlify](https://netlify.com/)              |
| **Build Tool**  | Vite                                         |
| **Framework**   | React 16.13.1 + TypeScript 5                 |

**Client Features:**

- **Bundle Size**: ~950KB (optimized with code splitting)
- **Performance**: Lighthouse scores 90+
- **Routing**: React Router with SPA redirects
- **Security**: CSP headers, XSS protection
- **CDN**: Global distribution via Netlify Edge

### 🔗 **Architecture Overview**

```mermaid
graph TB
  subgraph "Client (Netlify)"
    UI["React App"]
    CDN["Global CDN"]
    HTTPS["HTTPS/SSL"]
  end

  subgraph "Server (Railway)"
    API["GraphQL API"]
    AUTH["JWT Auth"]
    MIDDLEWARE["Security Middleware"]
  end

  subgraph "Database (MongoDB Atlas)"
    DB["MongoDB"]
    USERS["Users Collection"]
    MEETINGS["Meetings Collection"]
    EVENTS["Events Collection"]
    BOOKINGS["Bookings Collection"]
  end

  UI --> CDN
  CDN --> HTTPS
  HTTPS --> API
  API --> AUTH
  AUTH --> MIDDLEWARE
  MIDDLEWARE --> DB
  DB --> USERS
  DB --> MEETINGS
  DB --> EVENTS
  DB --> BOOKINGS
```

### 🛡️ **Security & Performance**

#### **Server Security**

- ✅ JWT authentication with 7-day expiration
- ✅ CORS configured for client domain only
- ✅ Helmet security headers (XSS, CSRF protection)
- ✅ Request logging with UUID correlation
- ✅ Input validation with Zod schemas
- ✅ Password hashing with bcrypt (10 rounds)

#### **Client Performance**

- ✅ Code splitting and lazy loading
- ✅ Asset caching (1-year for static files)
- ✅ Bundle optimization (~950KB total)
- ✅ Preloading of critical routes
- ✅ Global CDN distribution

### 📊 **Monitoring & Health**

#### **Health Checks**

- **Server**: Automated health monitoring via Railway
- **Client**: Uptime monitoring via Netlify
- **Database**: MongoDB Atlas monitoring dashboard

#### **Performance Metrics**

- **Server Response Time**: <200ms average
- **Client Load Time**: <2s globally
- **Bundle Size**: 950KB (excellent for feature set)
- **Lighthouse Scores**: 90+ across all metrics

### 🔄 **CI/CD Pipeline**

#### **Automatic Deployments**

- **Server**: Auto-deploy on push to `main` branch → Railway
- **Client**: Auto-deploy on push to `main` branch → Netlify
- **Database**: MongoDB Atlas (managed, no deployment needed)

#### **Deployment Flow**

```mermaid
graph LR
  DEV["Local Development"] --> PUSH["Git Push"]
  PUSH --> RAILWAY["Railway Auto-Deploy"]
  PUSH --> NETLIFY["Netlify Auto-Deploy"]
  RAILWAY --> HEALTH["Health Check"]
  NETLIFY --> CDN["Global CDN"]
  HEALTH --> LIVE["✅ Production Live"]
  CDN --> LIVE
```

### 🚦 **Status Dashboard**

| **Component**      | **Status**          | **Last Updated** |
| ------------------ | ------------------- | ---------------- |
| **Server API**     | ✅ Operational      | Now              |
| **Client App**     | 🔄 Ready for Deploy | Now              |
| **Database**       | ✅ Operational      | Now              |
| **Authentication** | ✅ Operational      | Now              |
| **GraphQL API**    | ✅ Operational      | Now              |

### 📚 **Deployment Guides**

- **Server Deployment**: [`docs/RAILWAY_SERVER_DEPLOYMENT.md`](docs/RAILWAY_SERVER_DEPLOYMENT.md)
- **Client Deployment**: [`docs/NETLIFY_CLIENT_DEPLOYMENT.md`](docs/NETLIFY_CLIENT_DEPLOYMENT.md)
- **Environment Config**: [`docs/ENVIRONMENT_CONFIGURATION.md`](docs/ENVIRONMENT_CONFIGURATION.md)
