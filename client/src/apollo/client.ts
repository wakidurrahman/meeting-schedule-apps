/**
 * Apollo Client Configuration
 *
 * This module sets up the Apollo Client instance for the Meeting Scheduler application.
 * It configures:
 * - HTTP connection to the GraphQL endpoint
 * - Authentication middleware for JWT token injection
 * - In-memory caching
 * - Development tools integration
 */

import { TOKEN_KEY } from '@/context/AuthContext';
import { ApolloClient, HttpLink, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

/**
 * HTTP Link Configuration
 *
 * Creates the HTTP connection to the GraphQL server endpoint.
 * The URI is relative to the current domain, expecting a proxy setup
 * in development or same-origin deployment in production.
 */
const httpLink = new HttpLink({
  uri: '/graphql',
});

/**
 * Authentication Link Middleware
 *
 * Intercepts all GraphQL requests and adds the JWT authentication token
 * from localStorage to the Authorization header if available.
 *
 * Token format: Bearer <token>
 * Storage key: Imported from AuthContext (TOKEN_KEY constant)
 *
 * @param _ - Apollo operation context (unused)
 * @param headers - Existing HTTP headers
 * @returns Modified headers object with Authorization header
 */
const authLink = setContext((_, { headers }) => {
  // Retrieve the authentication token from local storage
  const token = localStorage.getItem(TOKEN_KEY);

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      // Add the authorization header only if token exists
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

/**
 * Apollo Client Instance
 *
 * The main Apollo Client instance used throughout the application.
 *
 * Configuration:
 * - Link chain: authLink -> httpLink (authentication before HTTP request)
 * - Cache: InMemoryCache for normalized caching of GraphQL responses
 * - DevTools: Enabled for Apollo Client DevTools browser extension
 *
 * @example
 * // Usage in React components
 * import { apolloClient } from './apollo/client';
 * import { ApolloProvider } from '@apollo/client';
 *
 * <ApolloProvider client={apolloClient}>
 *   <App />
 * </ApolloProvider>
 */
export const apolloClient = new ApolloClient({
  // Chain the auth link with the http link
  link: from([authLink, httpLink]),

  // Initialize a new in-memory cache
  cache: new InMemoryCache(),

  // Enable Apollo DevTools in development
  connectToDevTools: true,
});

// Debug: Log Apollo Client to console in development
if (process.env.NODE_ENV === 'development') {
  console.log('Apollo Client initialized:', apolloClient);

  // Make apolloClient available globally for debugging
  (window as any).apolloClient = apolloClient;
}
