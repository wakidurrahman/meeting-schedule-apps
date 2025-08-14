/**
 * Event-related GraphQL type definitions
 * Includes Event type, inputs, queries, and mutations
 */

module.exports = `
  # Event Type
  type Event {
    id: ID!
    title: String!
    description: String
    date: DateTime!
    price: Float!
    createdBy: User!
    createdAt: String!
    updatedAt: String!
  }

  # Event Inputs
  input EventInput {
    title: String!
    description: String
    date: DateTime!
    price: Float!
  }

  input EventFilterInput {
    createdById: ID
    dateFrom: DateTime
    dateTo: DateTime
  }

  # Event Queries
  extend type Query {
    events(filter: EventFilterInput): [Event!]!
    event(id: ID!): Event
  }

  # Event Mutations
  extend type Mutation {
    createEvent(eventInput: EventInput): Event
    updateEvent(id: ID!, eventInput: EventInput): Event
    deleteEvent(id: ID!): Boolean!
  }
`;
