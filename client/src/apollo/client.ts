/**
 * Apollo Client Configuration - Optimized for Meeting Scheduler
 *
 * This module sets up the Apollo Client instance with advanced caching, authentication,
 * and performance optimizations for the Meeting Scheduler application.
 *
 * Features:
 * - HTTP connection to the GraphQL endpoint with authentication
 * - Advanced caching with type policies for all entities
 * - Pagination support for lists (users, events, meetings, bookings)
 * - Performance optimizations (batching, persisted queries)
 * - Development tools integration
 */

import {
  ApolloClient,
  DefaultOptions,
  HttpLink,
  InMemoryCache,
  TypePolicies,
  from,
} from '@apollo/client';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import { setContext } from '@apollo/client/link/context';
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries';
import { sha256 } from 'crypto-hash';

import { TOKEN_KEY } from '@/context/AuthContext';

// Global type declaration for debugging
declare global {
  interface Window {
    apolloClient: ApolloClient<unknown>;
  }
}

/**
 * Advanced Cache Configuration with Type Policies
 *
 * Implements comprehensive caching strategy for all entities:
 * - User, Event, Meeting, Booking entities with proper key fields
 * - Pagination support with offset-based merging
 * - Optimized cache-first policies for read-heavy operations
 */
const typePolicies: TypePolicies = {
  Query: {
    fields: {
      // Users list with pagination support
      users: {
        keyArgs: ['where', 'orderBy'], // Cache by filter and sort
        merge(
          existing = { usersList: [], total: 0, hasMore: false },
          incoming: {
            usersList: any[];
            total: number;
            hasMore: boolean;
            pagination?: { offset?: number };
          },
        ) {
          const existingItems = existing.usersList || [];
          const incomingItems = incoming.usersList || [];
          const offset = incoming.pagination?.offset || 0;

          // Handle pagination merging
          if (offset === 0) {
            // Fresh load - replace existing
            return incoming;
          }

          // Append new items for pagination
          const merged = [...existingItems];
          incomingItems.forEach((item: any, index: number) => {
            merged[offset + index] = item;
          });

          return {
            ...incoming,
            usersList: merged,
            total: incoming.total,
            hasMore: incoming.hasMore,
          };
        },
      },

      // Events list with filtering and pagination
      events: {
        keyArgs: ['filter'], // Cache by filter (createdById, dateFrom, dateTo)
        merge(_existing = [], incoming: any[]) {
          // For events, we typically replace the entire list when filters change
          // since they're often date-based or user-specific
          return incoming || [];
        },
      },

      // Meetings with advanced caching
      meetings: {
        keyArgs: false, // Cache all meetings together
        merge(_existing = { meetingsList: [], totalCount: 0, hasMore: false }, incoming: any) {
          // Always replace for meetings as they're time-sensitive
          return incoming;
        },
      },

      // Date range meetings (calendar view)
      meetingsByDateRange: {
        keyArgs: ['dateRange', ['startDate', 'endDate']], // Cache by date range
        merge(_existing = [], incoming: any[]) {
          // Replace existing for date range queries
          return incoming || [];
        },
      },

      // My meetings (user-specific)
      myMeetings: {
        keyArgs: ['userId'], // Cache per user
        merge(_existing = [], incoming: any[]) {
          return incoming || [];
        },
      },

      // Upcoming meetings
      upcomingMeetings: {
        keyArgs: ['limit'], // Cache by limit
        merge(_existing = [], incoming: any[]) {
          return incoming || [];
        },
      },

      // Bookings list
      bookings: {
        keyArgs: false, // Global bookings list
        merge(_existing = [], incoming: any[]) {
          return incoming || [];
        },
      },

      // Single user query
      user: {
        keyArgs: ['id'],
        merge(_existing: any, incoming: any) {
          return incoming;
        },
      },

      // Single event query
      event: {
        keyArgs: ['id'],
        merge(_existing: any, incoming: any) {
          return incoming;
        },
      },

      // My profile (current user)
      myProfile: {
        merge(_existing: any, incoming: any) {
          return incoming;
        },
      },

      // Meeting conflicts check
      checkMeetingConflicts: {
        keyArgs: ['input'], // Cache by conflict check parameters
        merge(_existing: any, incoming: any) {
          return incoming;
        },
      },
    },
  },

  // Entity type policies with proper key fields
  User: {
    keyFields: ['id'],
    fields: {
      // User-specific field policies can be added here
    },
  },

  Event: {
    keyFields: ['id'],
    fields: {
      createdBy: {
        merge(_existing: any, incoming: any) {
          return incoming;
        },
      },
    },
  },

  Meeting: {
    keyFields: ['id'],
    fields: {
      attendees: {
        merge(_existing = [], incoming: any[]) {
          return incoming || [];
        },
      },
      createdBy: {
        merge(_existing: any, incoming: any) {
          return incoming;
        },
      },
    },
  },

  Booking: {
    keyFields: ['id'],
    fields: {
      event: {
        merge(_existing: any, incoming: any) {
          return incoming;
        },
      },
      user: {
        merge(_existing: any, incoming: any) {
          return incoming;
        },
      },
    },
  },
};

/**
 * Apollo Cache Instance with Advanced Configuration
 */
const cache = new InMemoryCache({
  typePolicies,
  addTypename: true, // Add __typename to all objects for better caching
  resultCaching: true, // Enable result caching for performance
});

/**
 * Authentication Link Middleware
 *
 * Intercepts all GraphQL requests and adds the JWT authentication token
 * from localStorage to the Authorization header if available.
 */
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(TOKEN_KEY);

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

/**
 * HTTP Link Configuration
 *
 * Creates the HTTP connection to the GraphQL server endpoint.
 * Uses environment variable for production deployment or falls back to relative path for development.
 */
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URI || '/graphql',
  useGETForQueries: true, // Use GET for queries (CDN-friendly)
});

/**
 * Batch HTTP Link for Performance
 *
 * Batches multiple GraphQL operations into a single HTTP request
 * to reduce network overhead and improve performance.
 */
const batchLink = new BatchHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URI || '/graphql',
  batchInterval: 20, // Batch requests within 20ms window
  batchMax: 10, // Maximum 10 operations per batch
});

/**
 * Persisted Queries Link for Performance
 *
 * Enables automatic persisted queries (APQ) to reduce bandwidth
 * by sending query hashes instead of full query strings.
 */
const persistedQueriesLink = createPersistedQueryLink({
  sha256,
  useGETForHashedQueries: true, // Use GET for hashed queries (CDN-friendly)
});

/**
 * Default Query Options
 *
 * Optimized fetch policies for different use cases:
 * - cache-first: For read-mostly data (user profiles, events)
 * - cache-and-network: For real-time data (meetings, bookings)
 */
const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-first', // Prioritize cache for better performance
    errorPolicy: 'all', // Return partial data even with errors
  },
  query: {
    fetchPolicy: 'cache-first', // Default to cache-first for queries
    errorPolicy: 'all',
  },
  mutate: {
    errorPolicy: 'all', // Allow partial success for mutations
    fetchPolicy: 'no-cache', // Always execute mutations
  },
};

/**
 * Apollo Client Instance
 *
 * The main Apollo Client instance with complete configuration:
 * - Authentication middleware
 * - Performance optimizations (batching, persisted queries)
 * - Advanced caching with type policies
 * - Development tools integration
 */
export const apolloClient = new ApolloClient({
  // Link chain: auth -> persisted queries -> batch/http
  link: from([
    authLink,
    persistedQueriesLink,
    // Use batching in production, regular HTTP in development for easier debugging
    import.meta.env.PROD ? batchLink : httpLink,
  ]),

  cache,
  defaultOptions,

  // Enable Apollo DevTools in development
  connectToDevTools: import.meta.env.DEV,

  // Additional options
  assumeImmutableResults: true, // Optimize for immutable data
  queryDeduplication: true, // Deduplicate identical queries
});

/**
 * Development Debugging and Global Access
 */
if (import.meta.env.DEV) {
  console.log('🚀 Apollo Client Config:', {
    graphqlUri: import.meta.env.VITE_GRAPHQL_URI,
    environment: import.meta.env.VITE_ENVIRONMENT,
    isDev: import.meta.env.DEV,
    cacheConfig: {
      typePolicies: Object.keys(typePolicies),
      entities: ['User', 'Event', 'Meeting', 'Booking'],
    },
    features: {
      authentication: '✅ JWT Bearer tokens',
      caching: '✅ Advanced type policies',
      pagination: '✅ Offset-based merging',
      batching: import.meta.env.PROD ? '✅ Enabled' : '❌ Disabled (dev)',
      persistedQueries: '✅ Enabled',
      devtools: '✅ Enabled',
    },
  });

  // Make apolloClient available globally for debugging
  window.apolloClient = apolloClient;
}

/**
 * Cache Utilities for Manual Cache Operations
 */
export const cacheUtils = {
  /**
   * Clear specific entity from cache
   */
  evictEntity: (typename: string, id: string) => {
    apolloClient.cache.evict({ id: apolloClient.cache.identify({ __typename: typename, id }) });
    apolloClient.cache.gc(); // Garbage collect unreferenced objects
  },

  /**
   * Clear all cache data
   */
  clearAll: () => {
    apolloClient.cache.reset();
  },

  /**
   * Refetch all active queries
   */
  refetchAll: () => {
    return apolloClient.reFetchObservableQueries();
  },
};

export default apolloClient;
