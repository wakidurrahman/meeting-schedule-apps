/**
 * Meeting-related GraphQL type definitions
 * Includes Meeting type, inputs, queries, mutations, and subscriptions
 */

module.exports = `
  # Meeting Type
  type Meeting {
    id: ID!
    title: String!
    description: String
    meetingUrl: String
    startTime: String!
    endTime: String!
    attendees: [User!]! 
    createdBy: User!
    createdAt: String!
    updatedAt: String!
  }

  # Meeting Inputs
  input MeetingInput {
    title: String!
    description: String
    startTime: String!
    endTime: String!
    attendeeIds: [ID!]!
  }

  # Meeting Queries
  extend type Query {
    meetings: [Meeting!]!
    meeting(id: ID!): Meeting
  }

  # Meeting Mutations
  extend type Mutation {
    createMeeting(input: MeetingInput!): Meeting!
    deleteMeeting(id: ID!): Boolean!
  }

  # Meeting Subscriptions
  extend type Subscription {
    meetingCreated: Meeting!
  }
`;
