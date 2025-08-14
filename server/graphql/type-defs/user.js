/**
 * User-related GraphQL type definitions
 * Includes User types, inputs, queries, and mutations
 */

module.exports = `
  # User Types
  type AuthUser {
    id: ID! # This is a required field. It is the unique identifier for the user.
    name: String!
    email: String!
    imageUrl: String # This is an optional field
  }

  type User {
    id: ID!
    name: String! 
    email: String! 
    imageUrl: String 
    address: String 
    dob: String 
    role: Role! 
    createdEvents: [Event!]
    createdAt: String! 
    updatedAt: String! 
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

  input UpdateProfileInput {
    name: String
    address: String
    dob: String
    imageUrl: String
  }

  # User Queries
  extend type Query {
    me: AuthUser
    myProfile: User
    user(id: ID!): User
    users: [User!]!
  }

  # User Mutations
  extend type Mutation {
    register(input: RegisterInput!): AuthUser!
    login(input: LoginInput!): AuthPayload!
    updateMyProfile(input: UpdateProfileInput!): User!
  }
`;
