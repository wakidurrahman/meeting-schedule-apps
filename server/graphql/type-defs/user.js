/**
 * User-related GraphQL type definitions
 * Includes User types, inputs, queries, and mutations
 */

module.exports = `
  # User Types
  type User {
    id: ID!
    name: String! 
    email: String! 
    imageUrl: String 
    address: String 
    dob: DateTime 
    role: Role! 
    createdEvents: [Event!]
    createdAt: String! 
    updatedAt: String! 
  }

  type UsersResult {
    usersList: [User!]!
    total: Int!
    hasMore: Boolean!
  }

  # User Inputs

  input UpdateProfileInput {
    name: String
    address: String
    dob: DateTime
    imageUrl: String
  }

  # User Management Inputs
  input CreateUserInput {
    name: String!
    email: String!
    imageUrl: String
    address: String
    dob: DateTime
    role: Role = USER
  }

  input UpdateUserInput {
    name: String
    email: String
    imageUrl: String
    address: String
    dob: DateTime
    role: Role
  }

  input UsersWhere {
    search: String        # matches name OR email
    role: Role
  }
  
  input UsersOrderBy {
    field: UserOrderField = NAME
    direction: SortOrder = ASC
  }

  input Pagination {
    limit: Int = 10
    offset: Int = 0
  }



  # User Queries
  extend type Query {
    # Auth user.
    me: AuthUser
    # My profile.
    myProfile: User
    # Single user by ID.
    user(id: ID!): User
    # Enhanced users query with search, sort, pagination.
    users(where: UsersWhere, orderBy: UsersOrderBy, pagination: Pagination): UsersResult!
  }

  # User Mutations
  extend type Mutation {
    updateMyProfile(input: UpdateProfileInput!): User!
    createUser(input: CreateUserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
  }
`;
