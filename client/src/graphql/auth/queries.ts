import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import { AuthUser } from '@/types/user';

/**
 * Authentication-related queries
 */

// Types for Me query
export interface MeQueryData {
  me: AuthUser | null;
}

export const GET_ME: TD<MeQueryData, Record<string, never>> = gql`
  query Me {
    me {
      id
      name
      email
      imageUrl
    }
  }
` as unknown as TD<MeQueryData, Record<string, never>>;
