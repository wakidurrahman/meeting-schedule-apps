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

  # Meeting-related Types
  type MeetingConflict {
    meeting: Meeting!
    conflictType: String!
    severity: String!
    message: String!
  }

  type ConflictCheckResult {
    hasConflicts: Boolean!
    conflicts: [MeetingConflict!]!
    warnings: [String!]!
  }

  type MeetingsResult {
    meetingsList: [Meeting!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  # Meeting Inputs
  input MeetingInput {
    title: String!
    description: String
    startTime: String!
    endTime: String!
    attendeeIds: [ID!]!
  }

  input CreateMeetingInput {
    title: String!
    description: String
    startTime: String!
    endTime: String!
    attendeeIds: [ID!]!
  }

  input UpdateMeetingInput {
    title: String
    description: String
    startTime: String
    endTime: String
    attendeeIds: [ID!]
  }

  input DateRangeInput {
    startDate: String!
    endDate: String!
  }

  input ConflictCheckInput {
    startTime: String!
    endTime: String!
    attendeeIds: [ID!]!
    excludeMeetingId: ID
  }

  # Meeting Queries
  extend type Query {
    meetings: MeetingsResult!
    findMeetingById(id: ID!): Meeting
    meetingsByDateRange(dateRange: DateRangeInput!): [Meeting!]!
    myMeetings(userId: ID!): [Meeting!]!
    upcomingMeetings(limit: Int = 10): [Meeting!]!
    checkMeetingConflicts(input: ConflictCheckInput!): ConflictCheckResult!
    countMeetings: Int!
  }

  # Meeting Mutations
  extend type Mutation {
    createMeeting(input: CreateMeetingInput!): Meeting!
    updateMeeting(id: ID!, input: UpdateMeetingInput!): Meeting!
    deleteMeeting(id: ID!): Boolean!
  }

  # Meeting Subscriptions
  extend type Subscription {
    meetingCreated: Meeting!
    meetingUpdated: Meeting!
    meetingDeleted: ID!
  }
`;
