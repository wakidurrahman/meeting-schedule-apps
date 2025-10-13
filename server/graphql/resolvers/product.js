const { GraphQLError } = require('graphql');

const { MESSAGES, ERROR_CODES } = require('../../constants/messages');
const { handleUnexpectedError } = require('../shared/helpers');

// DummyJSON API base URL
const DUMMYJSON_API_BASE = 'https://dummyjson.com';

/**
 * Fetch data from DummyJSON API
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} - Response data
 */
async function fetchFromDummyJSON(endpoint) {
  try {
    const response = await fetch(`${DUMMYJSON_API_BASE}${endpoint}`);

    if (!response.ok) {
      throw new Error(`DummyJSON API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('DummyJSON API fetch error:', error);
    throw new GraphQLError('Failed to fetch products from external API', {
      extensions: {
        code: ERROR_CODES.EXTERNAL_API_ERROR,
        originalError: error.message,
      },
    });
  }
}

/**
 * Product-related GraphQL resolvers
 * Fetches data from DummyJSON API (https://dummyjson.com)
 * Note: This is independent from MongoDB - data comes from external API
 */
const productResolvers = {
  /**
   * Get all products with pagination
   */
  products: async (_parent, args) => {
    try {
      const { input = {} } = args;
      const { limit = 30, skip = 0, select = '' } = input;

      // Build query parameters
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('skip', skip.toString());

      if (select) {
        params.append('select', select);
      }

      const endpoint = `/products?${params.toString()}`;
      const data = await fetchFromDummyJSON(endpoint);

      return {
        products: data.products || [],
        total: data.total || 0,
        skip: data.skip || 0,
        limit: data.limit || limit,
      };
    } catch (error) {
      return handleUnexpectedError(error);
    }
  },

  /**
   * Get single product by ID
   */
  product: async (_parent, args) => {
    try {
      const { id } = args;

      const endpoint = `/products/${id}`;
      const data = await fetchFromDummyJSON(endpoint);

      return data;
    } catch (error) {
      if (error.extensions && error.extensions.code === ERROR_CODES.EXTERNAL_API_ERROR) {
        throw new GraphQLError(MESSAGES.PRODUCT_NOT_FOUND, {
          extensions: { code: ERROR_CODES.NOT_FOUND },
        });
      }
      return handleUnexpectedError(error);
    }
  },

  /**
   * Search products by query
   */
  searchProducts: async (_parent, args) => {
    try {
      const { query, limit = 30, skip = 0 } = args;

      if (!query || query.trim().length === 0) {
        throw new GraphQLError('Search query is required', {
          extensions: { code: ERROR_CODES.VALIDATION_ERROR },
        });
      }

      const params = new URLSearchParams();
      params.append('q', query);
      params.append('limit', limit.toString());
      params.append('skip', skip.toString());

      const endpoint = `/products/search?${params.toString()}`;
      const data = await fetchFromDummyJSON(endpoint);

      return {
        products: data.products || [],
        total: data.total || 0,
        skip: data.skip || 0,
        limit: data.limit || limit,
      };
    } catch (error) {
      return handleUnexpectedError(error);
    }
  },

  /**
   * Get products by category
   */
  productsByCategory: async (_parent, args) => {
    try {
      const { category, limit = 30, skip = 0 } = args;

      if (!category || category.trim().length === 0) {
        throw new GraphQLError('Category is required', {
          extensions: { code: ERROR_CODES.VALIDATION_ERROR },
        });
      }

      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('skip', skip.toString());

      const endpoint = `/products/category/${category}?${params.toString()}`;
      const data = await fetchFromDummyJSON(endpoint);

      return {
        products: data.products || [],
        total: data.total || 0,
        skip: data.skip || 0,
        limit: data.limit || limit,
      };
    } catch (error) {
      return handleUnexpectedError(error);
    }
  },
};

module.exports = productResolvers;
