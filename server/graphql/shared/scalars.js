/**
 * Shared scalar types and common type definitions used across the GraphQL schema
 */

module.exports = `
  # Scalar types of GraphQL
  scalar DateTime

  # Enums types of GraphQL
  enum Role {
    USER
    ADMIN
  }

  enum SortOrder {
    ASC
    DESC
  }

  enum LiftStatus {
    OPEN
    CLOSED
    HOLD
  }
    
  enum TrailStatus {
    OPEN
    CLOSED
  }
`;
