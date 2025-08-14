/**
 * Hotel type definitions
 *
 * Hotel: A hotel
 *
 * Hotel Inputs
 *
 * Hotel Mutations
 *
 * CRUD operations for Hotels
 */

module.exports = `
  # Hotel Type
  type Hotel {
    id: ID!
    name: String!
    capacity: Int!
    pool: Boolean!
    spa: Boolean!
    avgCost: Int!
    skiIn: Boolean
    createdAt: String!
    updatedAt: String!
  }

  # Hotel Lift
  type Lift {
    id: ID!
    name: String!
    status: LiftStatus!
    capacity: Int!
    night: Boolean!
    elevationGain: Int!
    trailAccess: [Trail!]!
    createdAt: String!
    updatedAt: String!
  }

  # Hotel Trail
  type Trail {
    id: ID
    name: String!
    status: TrailStatus
    difficulty: String!
    groomed: Boolean!
    trees: Boolean!
    night: Boolean!
    accessedByLifts: [Lift!]!
    createdAt: String!
    updatedAt: String!
  }

  # Hotel Inputs
  input HotelInput {
    name: String!
    capacity: Int!
    pool: Boolean!
    spa: Boolean!
    avgCost: Int!
    skiIn: Boolean!
  }

  # 

  # Hotel Queries
  extend type Query {
    allHotels: [Hotel!]!
    getHotelById(id: ID!): Hotel!

    allLifts(status: LiftStatus): [Lift!]!
    findLiftById(id: ID!): Lift!
    countLifts(status: LiftStatus): Int!

    allTrails(status: TrailStatus): [Trail!]!
    findTrailByName(name: String!): Trail!
    countTrails(status: TrailStatus): Int!
  }

  # Hotel Mutations
  extend type Mutation {
    createHotel(input: HotelInput!): Hotel!
    updateHotel(id: ID!, input: HotelInput!): Hotel!
    deleteHotel(id: ID!) : Boolean!

    setLiftStatus(id: ID!, status: LiftStatus!): Lift!
    setTrailStatus(id: ID!, status: TrailStatus!): Trail!
  }

  # Hotel Subscriptions
  extend type Subscription {
    liftStatusChange: Lift!
    trailStatusChange: Trail!
  }
`;
