module.exports = `
  scalar Date

  enum Role {
    USER
    ADMIN
  }

  type AuthUser {
    id: ID!
    name: String!
    email: String!
    imageUrl: String
  }

  type User {
    id: ID!
    name: String!
    email: String!
    imageUrl: String
    address: String
    dob: String
    role: Role!
    createdAt: String!
    updatedAt: String!
  }

  type Meeting {
    id: ID!
    title: String!
    description: String
    startTime: String!
    endTime: String!
    attendees: [User!]!
    createdBy: User!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: AuthUser!
  }

  input MeetingInput {
    title: String!
    description: String
    startTime: String!
    endTime: String!
    attendeeIds: [ID!]!
  }

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

  type Query {
    me: AuthUser
    myProfile: User
    user(id: ID!): User
    meetings: [Meeting!]!
    meeting(id: ID!): Meeting
    users: [User!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthUser!
    login(input: LoginInput!): AuthPayload!
    updateMyProfile(input: UpdateProfileInput!): User!
    createMeeting(input: MeetingInput!): Meeting!
    deleteMeeting(id: ID!): Boolean!
  }
`;
