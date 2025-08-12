module.exports = `
  # Scalar types of GraphQL
  scalar DateTime

  # Enums types of GraphQL
  enum Role {
    USER
    ADMIN
  }

  # Types

  # Object types of GraphQL
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

  # Meeting type
  type Meeting {
    id: ID!
    title: String!
    description: String
    meetingUrl: String
    startTime: String!
    endTime: String!
    attendees: [User!]! # This is a required field. An array of users.
    createdBy: User!
    createdAt: String!
    updatedAt: String!
  }

  # Event type
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

  type Booking {
    id: ID!
    event: Event!
    user: User!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: AuthUser!
    tokenExpiration: Int
  }

  # Inputs

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

  input EventInput {
    title: String!
    description: String
    date: DateTime!
    price: Float!
  }

  # Queries

  type Query {
    me: AuthUser
    myProfile: User
    user(id: ID!): User
    users: [User!]!
    
    meetings: [Meeting!]!
    meeting(id: ID!): Meeting
    
    events: [Event!]!
    bookings: [Booking!]!
  }

  # Mutations

  type Mutation {
    register(input: RegisterInput!): AuthUser!
    login(input: LoginInput!): AuthPayload!
    updateMyProfile(input: UpdateProfileInput!): User!
    
    createMeeting(input: MeetingInput!): Meeting!
    deleteMeeting(id: ID!): Boolean!

    createEvent(eventInput: EventInput): Event

    bookEvent(eventId: ID!): Booking!
    cancelBooking(bookingId: ID!): Event!
  }

  # Subscriptions

  type Subscription {
    meetingCreated: Meeting!
  }
`;
