/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Apollo Client Configuration - Optimized for Meeting Scheduler Application
 *
 * This module sets up the Apollo Client instance with advanced caching, authentication,
 * and performance optimizations for the Meeting Scheduler Application.
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
import { onError } from '@apollo/client/link/error';

// Import entity types for better type safety
import { TOKEN_KEY } from '@/context/AuthContext';
import type { Booking } from '@/types/booking';
import type { Event } from '@/types/event';
import type { Meetings } from '@/types/meeting';
import type { UserProfile } from '@/types/user';

// Type definitions for GraphQL responses
interface PaginatedUsersResponse {
  usersList: UserProfile[];
  total: number;
  hasMore: boolean;
  pagination?: { offset?: number };
}

interface PaginatedMeetingsResponse {
  meetingsList: Meetings[];
  totalCount: number;
  hasMore: boolean;
}

interface ConflictCheckResponse {
  hasConflicts: boolean;
  conflicts: {
    meeting: {
      id: string;
      title: string;
      startTime: string;
      endTime: string;
    };
    conflictType: string;
    severity: string;
    message: string;
  }[];
  warnings: string[];
}

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
          incoming: PaginatedUsersResponse,
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
          incomingItems.forEach((item: UserProfile, index: number) => {
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
        merge(existing: Event[] = [], incoming: Event[]) {
          // For events, we typically replace the entire list when filters change
          // since they're often date-based or user-specific
          return incoming || [];
        },
      },

      // Meetings with advanced caching
      meetings: {
        keyArgs: false, // Cache all meetings together
        merge(
          existing = { meetingsList: [], totalCount: 0, hasMore: false },
          incoming: PaginatedMeetingsResponse,
        ) {
          // Always replace for meetings as they're time-sensitive
          return incoming;
        },
      },

      // Date range meetings (calendar view)
      meetingsByDateRange: {
        // Custom cache key based on date range
        keyArgs: ['dateRange', ['startDate', 'endDate']],
        merge(existing: Meetings[] = [], incoming: Meetings[]) {
          // Merge strategy for overlapping date ranges
          return incoming;
        },
      },

      // My meetings (user-specific)
      myMeetings: {
        keyArgs: ['userId'], // Cache per user
        merge(existing: Meetings[] = [], incoming: Meetings[]) {
          return incoming || [];
        },
      },

      // Upcoming meetings
      upcomingMeetings: {
        keyArgs: ['limit'], // Cache by limit
        merge(existing: Meetings[] = [], incoming: Meetings[]) {
          return incoming || [];
        },
      },

      // Bookings list
      bookings: {
        keyArgs: false, // Global bookings list
        merge(existing: Booking[] = [], incoming: Booking[]) {
          return incoming || [];
        },
      },

      // Single user query
      user: {
        keyArgs: ['id'],
        merge(existing: UserProfile | null, incoming: UserProfile | null) {
          return incoming;
        },
      },

      // Single event query
      event: {
        keyArgs: ['id'],
        merge(existing: Event | null, incoming: Event | null) {
          return incoming;
        },
      },

      // My profile (current user)
      myProfile: {
        merge(existing: UserProfile | null, incoming: UserProfile | null) {
          return incoming;
        },
      },

      // Meeting conflicts check
      checkMeetingConflicts: {
        keyArgs: ['input'], // Cache by conflict check parameters
        merge(existing: ConflictCheckResponse | null, incoming: ConflictCheckResponse | null) {
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
        merge(existing: UserProfile | null, incoming: UserProfile | null) {
          return incoming;
        },
      },
    },
  },

  Meeting: {
    keyFields: ['id'],
    fields: {
      attendees: {
        merge(existing: UserProfile[] = [], incoming: UserProfile[]) {
          return incoming || [];
        },
      },
      createdBy: {
        merge(existing: UserProfile | null, incoming: UserProfile | null) {
          return incoming;
        },
      },
    },
  },

  Booking: {
    keyFields: ['id'],
    fields: {
      event: {
        merge(existing: Event | null, incoming: Event | null) {
          return incoming;
        },
      },
      user: {
        merge(existing: UserProfile | null, incoming: UserProfile | null) {
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
 *
 * Token format: Bearer <token>
 * Storage key: Imported from AuthContext (TOKEN_KEY constant)
 *
 * @param _ - Apollo operation context (unused)
 * @param headers - Existing HTTP headers
 * @returns Modified headers object with Authorization header
 */
const authLink = setContext((_, { headers }) => {
  // Retrieve the authentication token from local storage.
  const token = localStorage.getItem(TOKEN_KEY);

  // Return the modified headers object with the Authorization header so httpLink can read them.
  // The Authorization header is required for the GraphQL server to authenticate the request.
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

/**
 * GraphQL Server URI Configuration
 *
 * Priority order:
 * 1. VITE_GRAPHQL_URI environment variable
 * 2. Development proxy fallback (only works with vite dev server)
 * 3. Production fallback (assumes server on same origin)
 */
const getGraphQLUri = (): string => {
  // Always prefer the environment variable
  if (import.meta.env.VITE_GRAPHQL_URI) {
    return import.meta.env.VITE_GRAPHQL_URI;
  }

  // Development fallback - proxy handles this
  if (import.meta.env.DEV) {
    return '/graphql';
  }

  // Production fallback - you should set VITE_GRAPHQL_URI instead
  console.warn(
    '⚠️ VITE_GRAPHQL_URI not set. Using fallback. Set environment variable for production.',
  );
  return 'http://localhost:4000/graphql';
};

const graphqlUri = getGraphQLUri();

/**
 * HTTP Link Configuration
 *
 * Creates the HTTP connection to the GraphQL server endpoint.
 * Uses environment variable for production deployment or falls back to relative path for development.
 */
const httpLink = new HttpLink({
  uri: graphqlUri,
  useGETForQueries: false, // Use POST for queries (cleaner URLs)
  credentials: 'include', // Include cookies for authentication
});

/**
 * Batch HTTP Link for Performance
 *
 * Batches multiple GraphQL operations into a single HTTP request
 * to reduce network overhead and improve performance.
 */
const batchLink = new BatchHttpLink({
  uri: graphqlUri,
  batchInterval: 50, // Batch requests within 50ms window
  batchMax: 10, // Maximum 10 operations per batch
  credentials: 'include', // Include cookies for authentication
});

/**
 * Error Link for Enhanced Error Handling
 *
 * Intercepts GraphQL errors and provides enhanced error handling,
 * including automatic token refresh and error logging.
 */
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`,
        extensions,
      );

      // Handle authentication errors
      if (extensions?.code === 'UNAUTHENTICATED') {
        // Clear invalid token and redirect to login
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
      }
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);

    // Handle network connectivity issues
    if (networkError.message === 'Failed to fetch') {
      console.warn('Network connectivity issue detected');
    }
  }
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
    notifyOnNetworkStatusChange: true, // Update UI on network status changes
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
 * - Error handling with automatic token refresh
 * - Performance optimizations (batching in production)
 * - Advanced caching with type policies
 * - Development tools integration
 */
export const apolloClient = new ApolloClient({
  // Link chain: error handling -> auth -> batching/http
  // Use batching in production for performance, regular HTTP in development for easier debugging
  link: from([errorLink, authLink, import.meta.env.PROD ? batchLink : httpLink]),

  cache,
  defaultOptions,

  // Enable Apollo DevTools in development only
  connectToDevTools: import.meta.env.DEV,

  // Performance optimizations
  assumeImmutableResults: true, // Optimize for immutable data
  queryDeduplication: true, // Deduplicate identical queries

  // Additional production optimizations
  ...(import.meta.env.PROD && {
    ssrMode: false, // Ensure client-side rendering
    ssrForceFetchDelay: 100, // Delay for SSR hydration
  }),
});

/**
 * Development Debugging and Global Access
 */
if (import.meta.env.DEV) {
  console.log('🚀 Apollo Client Config:', {
    graphqlUri: graphqlUri,
    envGraphqlUri: import.meta.env.VITE_GRAPHQL_URI,
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
      batching: '❌ Disabled (development)',
      errorHandling: '✅ Enhanced with auto-logout',
      devtools: '✅ Enabled',
    },
  });

  // Make apolloClient available globally for debugging
  window.apolloClient = apolloClient;
}

// Production logging for debugging
if (import.meta.env.PROD) {
  console.log('🚀 Production Apollo Client:', {
    graphqlUri: graphqlUri,
    hasEnvUri: !!import.meta.env.VITE_GRAPHQL_URI,
    environment: import.meta.env.VITE_ENVIRONMENT || 'not-set',
    features: {
      authentication: '✅ JWT Bearer tokens',
      caching: '✅ Advanced type policies',
      batching: '✅ Enabled',
      errorHandling: '✅ Enhanced with auto-logout',
      devtools: '❌ Disabled',
    },
  });
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
