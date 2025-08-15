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

  # User Management Inputs
  input CreateUserInput {
    name: String!
    email: String!
    imageUrl: String
    role: Role = USER
  }

  input UpdateUserInput {
    name: String
    email: String
    imageUrl: String
    role: Role
  }

  input UsersWhere {
    search: String        # matches name OR email
    role: Role
  }

  enum UserOrderField { NAME CREATED_AT UPDATED_AT }
  
  input UsersOrderBy {
    field: UserOrderField = NAME
    direction: SortOrder = ASC
  }

  input Pagination {
    limit: Int = 10
    offset: Int = 0
  }

  type UsersResult {
    nodes: [User!]!
    total: Int!
    hasMore: Boolean!
  }

  # User Queries
  extend type Query {
    me: AuthUser
    myProfile: User
    user(id: ID!): User
    users(where: UsersWhere, orderBy: UsersOrderBy, pagination: Pagination): UsersResult!
  }

  # User Mutations
  extend type Mutation {
    register(input: RegisterInput!): AuthUser!
    login(input: LoginInput!): AuthPayload!
    updateMyProfile(input: UpdateProfileInput!): User!
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
  }
`;
