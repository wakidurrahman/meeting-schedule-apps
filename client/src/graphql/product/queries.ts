import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import { Product, ProductsResult } from '@/types/product';

/**
 * Product-related queries
 * Fetches data from DummyJSON API via GraphQL
 */

// Get all products with pagination
export interface ProductsQueryData {
  products: ProductsResult;
}

export interface ProductsQueryVars {
  input?: {
    limit?: number;
    skip?: number;
    select?: string;
  };
}

export const GET_PRODUCTS: TD<ProductsQueryData, ProductsQueryVars> = gql`
  query Products($input: ProductsQueryInput) {
    products(input: $input) {
      products {
        id
        title
        description
        category
        price
        discountPercentage
        rating
        stock
        tags
        brand
        sku
        weight
        dimensions {
          width
          height
          depth
        }
        warrantyInformation
        shippingInformation
        availabilityStatus
        reviews {
          rating
          comment
          date
          reviewerName
          reviewerEmail
        }
        returnPolicy
        minimumOrderQuantity
        meta {
          createdAt
          updatedAt
          barcode
          qrCode
        }
        images
        thumbnail
      }
      total
      skip
      limit
    }
  }
` as unknown as TD<ProductsQueryData, ProductsQueryVars>;

// Get single product by ID
export interface ProductQueryData {
  product: Product | null;
}

export const GET_PRODUCT: TD<ProductQueryData, { id: string }> = gql`
  query Product($id: ID!) {
    product(id: $id) {
      id
      title
      description
      category
      price
      discountPercentage
      rating
      stock
      tags
      brand
      sku
      weight
      dimensions {
        width
        height
        depth
      }
      warrantyInformation
      shippingInformation
      availabilityStatus
      reviews {
        rating
        comment
        date
        reviewerName
        reviewerEmail
      }
      returnPolicy
      minimumOrderQuantity
      meta {
        createdAt
        updatedAt
        barcode
        qrCode
      }
      images
      thumbnail
    }
  }
` as unknown as TD<ProductQueryData, { id: string }>;

// Search products
export interface SearchProductsQueryData {
  searchProducts: ProductsResult;
}

export interface SearchProductsQueryVars {
  query: string;
  limit?: number;
  skip?: number;
}

export const SEARCH_PRODUCTS: TD<SearchProductsQueryData, SearchProductsQueryVars> = gql`
  query SearchProducts($query: String!, $limit: Int, $skip: Int) {
    searchProducts(query: $query, limit: $limit, skip: $skip) {
      products {
        id
        title
        description
        category
        price
        discountPercentage
        rating
        stock
        brand
        thumbnail
      }
      total
      skip
      limit
    }
  }
` as unknown as TD<SearchProductsQueryData, SearchProductsQueryVars>;

// Get products by category
export interface ProductsByCategoryQueryData {
  productsByCategory: ProductsResult;
}

export interface ProductsByCategoryQueryVars {
  category: string;
  limit?: number;
  skip?: number;
}

export const GET_PRODUCTS_BY_CATEGORY: TD<
  ProductsByCategoryQueryData,
  ProductsByCategoryQueryVars
> = gql`
  query ProductsByCategory($category: String!, $limit: Int, $skip: Int) {
    productsByCategory(category: $category, limit: $limit, skip: $skip) {
      products {
        id
        title
        description
        category
        price
        discountPercentage
        rating
        stock
        brand
        thumbnail
      }
      total
      skip
      limit
    }
  }
` as unknown as TD<ProductsByCategoryQueryData, ProductsByCategoryQueryVars>;
