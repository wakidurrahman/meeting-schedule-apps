/**
 * Product-related GraphQL type definitions
 * Fetches data from DummyJSON API (not MongoDB)
 */

module.exports = `
  # Product Types (from DummyJSON API)
  
  type ProductDimensions {
    width: Float!
    height: Float!
    depth: Float!
  }

  type ProductReview {
    rating: Int!
    comment: String!
    date: String!
    reviewerName: String!
    reviewerEmail: String!
  }

  type ProductMeta {
    createdAt: String!
    updatedAt: String!
    barcode: String!
    qrCode: String!
  }

  type Product {
    id: ID!
    title: String!
    description: String!
    category: String!
    price: Float!
    discountPercentage: Float!
    rating: Float!
    stock: Int!
    tags: [String!]!
    brand: String
    sku: String!
    weight: Int!
    dimensions: ProductDimensions!
    warrantyInformation: String!
    shippingInformation: String!
    availabilityStatus: String!
    reviews: [ProductReview!]!
    returnPolicy: String!
    minimumOrderQuantity: Int!
    meta: ProductMeta!
    images: [String!]!
    thumbnail: String!
  }

  type ProductsResult {
    products: [Product!]!
    total: Int!
    skip: Int!
    limit: Int!
  }

  # Product Query Inputs
  input ProductsQueryInput {
    limit: Int
    skip: Int
    select: String
  }

  # Product Queries
  extend type Query {
    # Get all products from DummyJSON API
    products(input: ProductsQueryInput): ProductsResult!
    # Get single product by ID from DummyJSON API
    product(id: ID!): Product
    # Search products by query
    searchProducts(query: String!, limit: Int, skip: Int): ProductsResult!
    # Get products by category
    productsByCategory(category: String!, limit: Int, skip: Int): ProductsResult!
  }
`;
