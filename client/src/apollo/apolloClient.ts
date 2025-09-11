import {
  ApolloClient,
  InMemoryCache,
  from,
  HttpLink,
  DefaultOptions,
} from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import { createPersistedQueryLink } from "@apollo/client/link/persisted-queries";
import { sha256 } from "crypto-hash";

// ---- Cache & Type Policies ----
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        users: {
          keyArgs: ["filter", "sort"],
          merge(existing = { items: [], total: 0 }, incoming: any) {
            const merged = existing.items ? existing.items.slice(0) : [];
            const start = incoming.offset ?? 0;
            for (let i = 0; i < incoming.items.length; ++i) {
              merged[start + i] = incoming.items[i];
            }
            return { items: merged, total: incoming.total };
          },
        },
        events: {
          keyArgs: ["filter", "sort", "range"],
          merge(existing = { items: [], total: 0 }, incoming: any) {
            const merged = existing.items ? existing.items.slice(0) : [];
            const start = incoming.offset ?? 0;
            for (let i = 0; i < incoming.items.length; ++i) {
              merged[start + i] = incoming.items[i];
            }
            return { items: merged, total: incoming.total };
          },
        },
      },
    },
    User: { keyFields: ["id"] },
    Event: { keyFields: ["id"] },
    Booking: { keyFields: ["id"] },
  },
});

// ---- Links: APQ + Batching + GET for queries ----
const persistedQueries = createPersistedQueryLink({
  sha256,
  useGETForHashedQueries: true,
});

// Batch requests within a small time window to cut round trips
const batchLink = new BatchHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT ?? "/graphql",
  batchInterval: 20, // ms
  batchMax: 10,
});

// Fallback plain HttpLink (not used if batching stays on)
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT ?? "/graphql",
  useGETForQueries: true, // CDN-friendly for cacheable queries
});

const link = from([persistedQueries, batchLink || httpLink]);

const defaultOptions: DefaultOptions = {
  watchQuery: { fetchPolicy: "cache-first" },
  query: { fetchPolicy: "cache-first" },
  mutate: { errorPolicy: "all" },
};

export const apolloClient = new ApolloClient({
  cache,
  link,
  defaultOptions,
});
