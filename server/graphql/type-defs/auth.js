/**
 * Auth-related GraphQL type definitions
 * Includes Auth types, inputs, queries, and mutations
 */

module.exports = `
  # User Types
  type AuthUser {
    id: ID! # This is a required field. It is the unique identifier for the user.
    name: String!
    email: String!
    imageUrl: String # This is an optional field
  }

  type AuthPayload {
    token: String!
    user: AuthUser!
    tokenExpiration: Int
  }

  # User Inputs
  input RegisterInput {
    name: String!
    email: String!
    password: String!
  }


  input LoginInput {
    email: String!
    password: String!
  }
 
  # User Mutations
  extend type Mutation {
    register(input: RegisterInput!): AuthUser!
    login(input: LoginInput!): AuthPayload!
   
  }
`;
