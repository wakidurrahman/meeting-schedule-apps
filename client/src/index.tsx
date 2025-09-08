/**
 * Application entry point (client)
 *
 * This file mounts the React application and composes the global provider stack
 * that every page/component runs under. Think of it as the boot sequence where
 * we wire together cross‑cutting concerns (error handling, networking, auth,
 * routing, and global UI like toasts).
 *
 * Provider stack (outer → inner):
 * 1) React.StrictMode
 *    - Highlights potential problems in development (double‑invokes certain
 *      lifecycle methods and effects). No impact in production builds.
 * 2) ErrorBoundary
 *    - Catches render/runtime errors in the React tree and renders a fallback
 *      UI instead of unmounting the whole app.
 * 3) ApolloProvider
 *    - Supplies a configured Apollo Client instance for GraphQL operations.
 *      - Adds Authorization header from localStorage when present
 *      - Normalizes/caches query results via InMemoryCache
 * 4) AuthProvider
 *    - Manages authentication state (token, current user) and exposes helpers
 *      like `login`, `logout`, and `isAuthenticated` to consumers via context.
 * 5) ToastProvider
 *    - Centralized toast/notification queue. Any component can enqueue success
 *      or error toasts; the global renderer lives beside the router.
 * 6) BrowserRouter
 *    - Client‑side routing. Navigates between pages without full page reloads.
 * 7) App
 *    - The route definitions and page composition live here.
 * 8) GlobalToasts
 *    - The single place where queued toasts are rendered.
 *
 * Static assets & side effects:
 * - SCSS bundle is imported once here (Bootstrap 5 + custom variables).
 * - Bootstrap JS bundle is imported for interactive components (collapse, etc.).
 */

import { ApolloProvider } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './App';

import { apolloClient } from '@/apollo/client';
import '@/assets/scss/main.scss';
import ErrorBoundary from '@/components/molecules/error-boundary';
import GlobalToasts from '@/components/molecules/toast/GlobalToasts';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

// Import Bootstrap JavaScript - this ensures Bootstrap is loaded and available globally
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

ReactDOM.render(
  <React.StrictMode>
    {/* 1) Global error safety net */}
    <ErrorBoundary>
      {/* 2) GraphQL client and cache */}
      <ApolloProvider client={apolloClient}>
        {/* 3) Authentication session and helpers */}
        <AuthProvider>
          {/* 4) Toast notifications context */}
          <ToastProvider>
            {/* 5) Client‑side routing */}
            <BrowserRouter>
              {/* 6) Application routes */}
              <App />
              {/* 7) Toast renderer (lives outside routes) */}
              <GlobalToasts />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </ApolloProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById('root'),
);
