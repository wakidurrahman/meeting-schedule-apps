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
    skiIn: Boolean!
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

  # Hotel Queries
  extend type Query {
    allHotels: [Hotel!]!
    getHotelById(id: ID!): Hotel!
  }

  # Hotel Mutations
  extend type Mutation {
    createHotel(input: HotelInput!): Hotel!
    updateHotel(id: ID!, input: HotelInput!): Hotel!
    deleteHotel(id: ID!) : Boolean!
  }
`;
