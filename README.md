# Meeting Scheduler App

Monorepo containing a React (Vite + TS) client and an Express + GraphQL + Mongoose server.

## Tech stack

- Client:
  - React 16.13
  - TypeScript
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

## Project structure

```text
/client
├── public/
├── src/
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── scss/
│   │       └── _variables.scss
│   │       └── main.scss
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   ├── graphql/
│   │   ├── mutations.ts
│   │   └── queries.ts
│   ├── pages/
│   │   ├── create-meeting
│   │   ├── dashboard
│   │   ├── login
│   │   └── register
│   ├── hooks/
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── utils/
│   ├── apollo/
│   │   └── client.ts
│   ├── App.tsx
│   └── index.tsx
├── index.html
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env
├── .env.example
├── .prettierrc
├── .prettierignore
├── .eslintrc.json

/server
├── config/
│   └── db.js
├── models/
│   ├── User.js
│   └── Meeting.js
├── graphql/
│   ├── typeDefs.js
│   └── resolvers.js
├── middleware/
│   └── auth.js
├── utils/
│   ├── validators.js
│   └── dateUtils.js
├── server.js
└── package.json
├── .env
├── .env.example
├── .prettierrc
├── .prettierignore
├── .eslintrc.json

/README.md

```

## Run locally

1. Create `server/.env` (example values)

```bash
PORT=4000
MONGO_URI=mongodb://localhost:27017/meeting_scheduler
JWT_SECRET=replace_me
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

1. Install dependencies

```bash
cd client && npm install
cd server && npm install
```

1. Start apps

```bash
cd server && npm run dev
cd client && npm run dev
```

The client proxies `/graphql` to `http://localhost:4000` during development.

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
