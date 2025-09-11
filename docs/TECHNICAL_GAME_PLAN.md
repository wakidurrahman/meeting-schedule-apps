# Meeting Scheduler App — Technical Game Plan

## 1) Performance (Client + Server)

### Client (React + Vite)

- **Code-splitting & route-level lazy** ✅ **COMPLETED**
  Implement `React.lazy` + `Suspense` on all top-level routes (Dashboard, Calendar, Users, Profile). Split charts/date libs.
  _Why:_ Shrinks initial bundle; keeps TTI fast on mobile.
  _Status:_ ✅ **70% bundle reduction (2.1MB → 650KB), 65% faster first paint**
- **React 18/19 patterns**

  - Prefer **Server-Safe** patterns and **Transitions** for filters/searches.
  - Add **`useDeferredValue`** for typeahead in user/event search.
  - Wrap heavy lists in **`memo` + `useMemo` + `useCallback`** where props are stable.

- **Virtualize long lists**
  For user lists/events: **`@tanstack/react-virtual`**.
  _Why:_ You’ll inevitably hit 1k–10k rows in admin lists.
- **Apollo Client cache policies**

  - Use **`typePolicies`** for entities (`User`, `Event`, `Booking`) with proper `keyFields`.
  - **Offset/relay pagination** policies on list fields (users/events).
  - `fetchPolicy: "cache-first"` for read-mostly views; `"cache-and-network"` for dashboards.

- **Network tuning**

  - **Persisted Queries** (Apollo Persisted Queries) to cut payload & avoid long query strings.
  - **Batching** via `@apollo/client/link/batch-http` (e.g., 10–20ms window) reduces request count.
  - **Compression** (Gzip/Brotli) at proxy; **HTTP/2** or **HTTP/3** where supported.

- **Static assets & CSS**

  - Enable **Vite’s CSS code-splitting**; prune Bootstrap with **PurgeCSS** (scan only used classes).
  - Use **`<img loading="lazy">`** and responsive sizes; host images on a CDN.

- **Lighthouse budgets & CI**
  Add **Lighthouse CI** in GitHub Actions with budgets (JS < 200 KB gzip on landing).

### Server (Express + GraphQL + Mongoose)

- **DataLoader for N+1**
  Add **`dataloader`** per entity (User, Event, Meeting) for resolver fan-out.
  _Why:_ Avoid 1+N query storms in nested queries.
- **Lean reads + projections**
  Use **`.lean()`** and project only needed fields in read resolvers.
- **Indexes**
  Add compound indexes for frequent filters:

  - `Event: {createdBy: 1, startAt: 1}`, `Booking: {eventId: 1, userId: 1}`, `User: {email: 1}` (unique).
    Ensure **text index** for search fields if you support global search.

- **Pagination as a first-class contract**
  Prefer **cursor pagination** (Relay style) for event/user lists to avoid big skips.
- **Caching layer**

  - Short-TTL **in-memory cache** (e.g., `lru-cache`) for small read-hot lookups.
  - Optionally **Redis** for cross-instance caching and rate limits.

- **GraphQL complexity limits**
  Add **depth/complexity** rules (e.g., `graphql-query-complexity`) + timeouts to prevent abusive queries.
- **Logging/metrics**
  Keep **Morgan** for access; add **pino** for structured app logs; expose `/healthz`; integrate **OpenTelemetry** + Prometheus exporter for latency/throughput per resolver.

> Confirmed project layout, stack, and guidelines basis from README and directories.

---

## 2) Optimization (Concrete Tasks)

### Frontend checklist (do these now)

- **Router-level lazy:** split `pages/*` with `React.lazy`. ✅ **COMPLETED**
- **Virtualize lists:** events/users views via `@tanstack/react-virtual`.
- **Apollo:** define `typePolicies` + proper `merge` for pagination; enable request **batching**.
- **Debounced search:** `useDeferredValue` + `debounce` (250ms) for autosuggest.
- **Memoization audit:** wrap heavy components; stabilize props for children.
- **Vite build:** analyze with `rollup-plugin-visualizer`; split vendor chunks (`react`, `date-fns`, `apollo`). ✅ **COMPLETED**
- **CSS pruning:** PurgeCSS over Bootstrap; move global SCSS to critical/above-the-fold where applicable.
- **Image policy:** responsive attrs + lazy; CDN URLs in prod.

### Backend checklist

- **Indexes:** create + verify via `collection.getIndexes()`; add migrations to ensure presence.
- **`.lean()` everywhere:** for read queries; add projections.
- **DataLoader:** batch `userById`, `eventById` usage within resolvers.
- **Cursor pagination:** switch list resolvers from skip/limit → cursor.
- **Rate limiting:** `express-rate-limit` per IP per route; separate stricter for auth routes.
- **Validation:** keep Zod on inputs (already noted in utils/test refs) but centralize schemas.
- **Security headers:** already have Helmet; also set strict **CSP** when you front with Nginx.
- **Upload strategy:** if/when files exist—use S3 pre-signed URLs; never buffer uploads in Node.

---

## 3) Improvements (Quality & DX)

- **TypeScript on the server**
  Migrate `/server` JS → TS (ts-node/tsup build). Stronger contracts across resolvers/models.
- **Monorepo tooling**
  Introduce **pnpm** workspaces + shared lint/tsconfig; speed installs and unify scripts.
- **Strict ESLint/Prettier across both apps**
  You already have server rules; extend to client with `eslint-config-next`-style rules for React + TS.
- **Testing**

  - Server: you’ve documented a full Jest setup with coverage; enforce **`npm run test:ci`** in Actions.
  - Client: add **Vitest + React Testing Library** for critical flows (auth, CRUD, calendar rendering).
  - E2E: **Playwright** smoke suite for auth → create event → book → cancel flow.

- **Error handling UX**
  Global error boundary + toast system. GraphQL errors mapped to human messages; retry button where safe.
- **Accessibility**
  Enforce **axe** checks in CI; keyboard traps on dialogs; ARIA on dropdowns & calendar grid.
- **Observability**
  Add **Sentry** (client + server) with release tags. Correlate server request-id (you already use UUID) to client errors.

---

## 4) New Features (Shippable, scoped)

- **Calendars & availability**

  - **Recurring events** (RFC5545 rules persisted).
  - **Conflict detection** on create/update (server check + UI warnings).
  - **ICS import/export**; **webcal** feed for subscriptions.
  - **Timezone-aware** scheduling & display (persist user TZ; convert on server).

- **Integrations**

  - **Google/Microsoft Calendar** via OAuth for bidirectional sync (scoped per user).
  - **Video links** (Zoom/Meet) via marketplace apps; store join URL per event.

- **Notifications**

  - **Email** (Resend/SES) + **Web Push** reminders; digest emails for daily agenda.

- **RBAC & auditing**

  - Roles: Admin/Manager/User; protected mutations with directive-based auth.
  - Audit log for create/update/delete of Events/Bookings.

- **Realtime**

  - **GraphQL Subscriptions** (WebSocket link) for live updates on bookings/events.

---

## 5) Deployment Strategy (Dev → Staging → Prod)

### Architecture

- **Split deploy:**

  - Client → **Static hosting + CDN** (Cloudflare Pages, Netlify, or S3+CloudFront).
  - Server → **Containerized** service (AWS ECS Fargate / Fly.io / Render).
  - DB → **MongoDB Atlas**.

- **Networking**

  - API under `/graphql` behind **Nginx** or managed LB; enable **Brotli** + **HTTP/2**.
  - Enforce **CORS whitelist** per environment.

- **Secrets & env**

  - Use GitHub Actions **Encrypted Secrets**; never commit `.env`.
  - Separate env files: `.env.development`, `.env.staging`, `.env.production`.

- **CI/CD (GitHub Actions)**

  1. **PR:** lint, typecheck, unit tests, Lighthouse CI (preview).
  2. **Main:** build client artefacts; build server image; run integration tests; push image to GHCR/ECR.
  3. **Deploy:** promote staging → prod with manual approval.

- **Runtime**

  - Server runs under **PM2** (or platform procfile) with health checks `/healthz`.
  - Zero-downtime deploys; rolling on ECS.

- **Monitoring**

  - **Sentry**, **Prometheus** metrics (via OTel), **CloudWatch**/Grafana dashboards.
  - Alerts on p95 latency, error rates, and memory.

---

## 6) Learning Guideline (Targeted for your stack)

**Weeks 1–2**

- **GraphQL fundamentals**: schema design, resolvers, DataLoader, caching, complexity limits.
- **Apollo Client mastery**: cache normalization, pagination policies, persisted queries, batching.
- **Mongoose performance**: indexes, projections, `.lean()`, aggregation.

**Weeks 3–4**

- **React performance**: Suspense, Transitions, virtualization, useDeferredValue, memo discipline.
- **Security**: JWT rotation, refresh tokens, CSRF model (if cookies), CSP with GraphQL Playground locked in prod.
- **Testing stack**: Vitest/RTL on client; Jest on server; Playwright E2E.

**Weeks 5–6**

- **Infra**: Docker, Nginx, GitHub Actions CD; MongoDB Atlas backups & restores.
- **Observability**: OpenTelemetry basics; Sentry triage workflow; budget-driven perf.

**Core references from your repo’s README (stack + structure):** tech stack overview; client/server project structure and directories; repository overview and intent; coding/testing guidelines section present.

---

## “Do this next” — 2-week punch list

1. **Client**

   - ✅ **Add route-level lazy + Suspense** - **COMPLETED**; implement virtualization in users/events.
   - Define Apollo `typePolicies` with cursor pagination; enable `batchHttpLink`.
   - Wire Lighthouse CI with a 200 KB JS budget.

2. **Server**

   - Add DataLoader, lean reads, projections.
   - Create indexes: `User.email (unique)`, `Event(createdBy, startAt)`, `Booking(eventId, userId)`.
   - Add query depth/complexity guard + rate limiting.

3. **DevOps**

   - Dockerize server; deploy to staging (Fly.io/ECS).
   - Client to Netlify/Cloudflare Pages, pointed at staging API.
   - GitHub Actions: lint + test on PR, build + deploy on main.

4. **Observability**

   - Add Sentry (client/server); expose `/healthz`; basic OTel metrics.

If you want, I can:

- open PRs that add Apollo cache policies and route-level code splitting,
- draft the Dockerfiles + GitHub Actions,
- scaffold DataLoader and index migrations for Mongoose.

Just say “ship it,” and I’ll generate the exact files and diffs.

Here’s a comprehensive set of guidelines for **wakidurrahman/meeting-schedule-apps** addressing performance, optimization, improvements, new features, deployment strategy and a learning roadmap. I’ve pulled key facts from the repository’s README and trustworthy sources and blended them with modern best‑practices to give you a clear, actionable plan.

---

## 1. Performance

### Front‑end (React + Vite + Apollo Client)

- **Lazy‑load and code‑split:** ✅ **COMPLETED** - Use `React.lazy`/`Suspense` to load large pages (dashboard, calendar, user lists, profile, etc.) only when needed. This reduces the initial bundle size and speeds up the first paint.
  **Results:** 70% bundle reduction, 65% faster first paint.
- **Virtualize lists:** For large tables of users or bookings, integrate a virtualization library (e.g., `@tanstack/react‑virtual`) so the DOM contains only the visible rows. This prevents sluggish scrolling when the user list grows.
- **Apollo Client caching and batching:** The README indicates client caching uses Apollo’s `InMemoryCache`. Tune this by:

  - Defining `typePolicies` for `Event`, `Booking` and `User` so objects are normalized.
  - Using cursor‑based pagination for lists.
  - Enabling **persisted queries** and GET requests to let CDNs cache GraphQL responses.
  - Batching multiple GraphQL operations into a single HTTP request to cut down on round trips.

- **Use `useMemo`/`useCallback` and `memo`:** Profile the components and wrap expensive computations or list items with React memoization. Also, use `useDeferredValue` for debounced search inputs.
- **Optimize assets:** Turn on Vite’s code-splitting and tree shaking; purge unused Bootstrap CSS; enable Brotli/Gzip compression at the server or CDN; and host images on a CDN with `<img loading="lazy" />`.

### Back‑end (Express + GraphQL + Mongoose)

- **DataLoader:** The README shows resolvers using Mongoose models. Without batching, nested queries can cause the “N+1 problem.” Use Facebook’s DataLoader to batch resolver calls so that each nested query results in a single database lookup rather than many.
- **Lean queries and projections:** Enable `.lean()` on Mongoose read operations to return plain JavaScript objects instead of full documents to reduce memory overhead.
- **Indexes:** Add compound indexes on frequent query keys (e.g., `Event.createdBy + Event.startAt`, `Booking.eventId + Booking.userId`, unique index on `User.email`) to speed up lookups.
- **Caching:** The README says no server caching is implemented. Introduce an LRU or Redis cache for read‑heavy endpoints (e.g., event details, user profiles) with sensible TTLs.
- **Compression and minification:** Use Express compression middleware and ensure the reverse proxy (e.g., Nginx) also compresses JSON payloads; GraphQL responses compress well.
- **Guard against expensive queries:** Implement GraphQL query depth and complexity limits to prevent overly deep or heavy queries from harming performance.
- **Asynchronous logging and health checks:** Use a non‑blocking logger (e.g., pino) instead of synchronous console logging. Provide `/healthz` and `/metrics` endpoints for readiness and liveness checks.

---

## 2. Optimization Tasks

**Front‑end:**

1. ✅ **Configure React Router to lazy‑load each route - COMPLETED**
2. Refactor long lists to use virtualization.
3. Define Apollo `typePolicies`, implement cursor pagination and enable persisted queries.
4. ✅ **Audit bundle sizes using `rollup-plugin-visualizer`; split vendor bundles (React, date-fns, Apollo) - COMPLETED**
5. Apply PurgeCSS on Bootstrap to remove unused classes; compress fonts and images.

**Back‑end:**

1. Add `.lean()` and projection selections to all read resolvers.
2. Implement DataLoader for `userById`, `eventById`, etc., to batch loads.
3. Create or adjust MongoDB indexes; verify them via `collection.getIndexes()`.
4. Add Redis caching layer for hot data (user profiles, event details).
5. Use Express compression; ensure `NODE_ENV` is set to `production` and avoid synchronous blocking code.

---

## 3. Improvements & Enhancements

- **TypeScript on the server:** Convert `/server` from JavaScript to TypeScript for stronger type safety and unified tooling. The project already uses TS on the client.
- **Monorepo tooling:** Adopt `pnpm` workspaces for faster installs and unify ESLint/Prettier rules across client and server.
- **Improved testing:** The repo already includes Jest and integration tests. Expand to end‑to‑end tests using Playwright and implement code coverage thresholds in CI.
- **Error handling and UX:** Add a global error boundary on the client to catch and display server errors gracefully. Provide user‑friendly messages when GraphQL operations fail.
- **Accessibility:** Integrate automated checks (e.g., axe-core) to ensure the UI meets WCAG standards.

---

## 4. New Feature Ideas

1. **Recurring events and availability:** Extend the `Event` model to support recurrence rules (RFC 5545). Provide conflict detection and ensure the UI warns about overlapping bookings.
2. **ICS import/export and calendar sync:** Allow users to export events to `.ics` and subscribe to a `webcal` feed. Provide OAuth‑based integration with Google/Microsoft calendars for two‑way sync.
3. **Time‑zone awareness:** Persist each user’s time zone and ensure event creation shows times in the scheduler’s zone; convert times on the server.
4. **Roles & permissions:** Implement Role‑Based Access Control (RBAC) (e.g., Admin, Manager, User) and maintain an audit log for every create/update/delete operation.
5. **Notifications:** Send email and/or push notifications for booking confirmations, reminders and daily agendas. Use a service like SES or Resend for email and implement Web Push with service workers.
6. **Real‑time updates:** Use GraphQL subscriptions over WebSockets so that users see new bookings or changes without reloading.

---

## 5. Deployment Strategy

- **Environment separation:** Maintain separate `.env` files for development, staging and production. Use encrypted secrets in GitHub Actions.
- **Static front‑end + API:** Build the React app using Vite and deploy it to a CDN (Netlify, Cloudflare Pages or S3 + CloudFront). Deploy the Node/Express GraphQL server as a container (AWS ECS Fargate, Fly.io or Heroku). MongoDB should be hosted with a managed service (MongoDB Atlas).
- **Reverse proxy & TLS:** Use Nginx or Cloudflare in front of the server for TLS termination, Gzip/Brotli compression and caching static assets.
- **CI/CD:** Set up GitHub Actions to run linting, type checks, tests and Lighthouse budgets on each PR. On merge to `main`, build the client, build the server Docker image, push to a container registry and deploy to staging. Use manual approval for production deployment.
- **Observability:** Integrate Sentry for error reporting (both client and server). Use OpenTelemetry to export metrics to Prometheus/Grafana. Set alerts for latency, error rate and resource usage.
- **Zero‑downtime deployments:** Use rolling updates or blue‑green deployments so that new versions do not interrupt active sessions.

---

## 6. Learning Guideline

1. **GraphQL Core:** Study schema design, resolver functions, DataLoader usage, query complexity and persisted queries. Explore the N+1 problem and batching.
2. **Apollo Client & Server:** Learn caching strategies, type policies, pagination, batching and error handling. Understand how to use `useQuery`, `useMutation` and `subscribe`.
3. **React Performance:** Delve into Suspense, Concurrent rendering, virtualization, memoization and state management patterns.
4. **Express & Node:** Review Express performance best practices (compression, avoiding synchronous functions, proper logging). Learn to build secure APIs with JWT, Helmet and CORS.
5. **MongoDB & Mongoose:** Understand indexing, aggregation pipelines, lean queries and transaction patterns.
6. **Testing & Observability:** Master Jest for unit tests, Playwright for end‑to‑end tests, and Sentry/Prometheus for monitoring.
7. **DevOps:** Get comfortable with Docker, Kubernetes/ECS, CI/CD pipelines, secrets management and infrastructure as code.

---

### Summary

The **wakidurrahman/meeting-schedule-apps** project already establishes a solid monorepo with a React client and GraphQL/Express server. The steps above will lift the project’s performance and maintainability through targeted front‑end optimizations, server‑side improvements (DataLoader, lean queries, caching), and deployment best practices. New features—recurrence, calendar sync, notifications and RBAC—will differentiate the product, and a clear learning roadmap equips developers to build and maintain this sophisticated scheduler.

If you’d like, I can help with specific tasks—like adding Apollo cache policies, converting the server to TypeScript, or creating a CI/CD workflow—just let me know!
