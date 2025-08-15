import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import { UserProfile } from '@/types/user';

/**
 * User profile-related queries
 */

// Enhanced Users query with search, sort, pagination, and role filtering
export interface UsersQueryData {
  users: {
    nodes: Array<UserProfile>;
    total: number;
    hasMore: boolean;
  };
}

export interface UsersQueryVars {
  where?: {
    search?: string;
    role?: 'ADMIN' | 'USER';
  };
  orderBy?: {
    field?: 'NAME' | 'CREATED_AT' | 'UPDATED_AT';
    direction?: 'ASC' | 'DESC';
  };
  pagination?: {
    limit?: number;
    offset?: number;
  };
}

export const GET_USERS: TD<UsersQueryData, UsersQueryVars> = gql`
  query Users($where: UsersWhere, $orderBy: UsersOrderBy, $pagination: Pagination) {
    users(where: $where, orderBy: $orderBy, pagination: $pagination) {
      nodes {
        id
        name
        email
        imageUrl
        role
        createdAt
        updatedAt
      }
      total
      hasMore
    }
  }
` as unknown as TD<UsersQueryData, UsersQueryVars>;

// Single user by ID
export interface UserQueryData {
  user: UserProfile | null;
}

export const GET_USER: TD<UserQueryData, { id: string }> = gql`
  query User($id: ID!) {
    user(id: $id) {
      id
      name
      email
      imageUrl
      address
      dob
      role
      createdAt
      updatedAt
    }
  }
` as unknown as TD<UserQueryData, { id: string }>;

// My profile
export interface MyProfileQueryData {
  myProfile: UserProfile | null;
}

export const GET_MY_PROFILE: TD<MyProfileQueryData, Record<string, never>> = gql`
  query MyProfile {
    myProfile {
      id
      name
      email
      imageUrl
      address
      dob
      role
      createdAt
      updatedAt
    }
  }
` as unknown as TD<MyProfileQueryData, Record<string, never>>;
