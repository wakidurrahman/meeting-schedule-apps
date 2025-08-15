import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import { AuthUser, UserLoginInput, UserRegisterInput } from '@/types/user';

/**
 * Authentication-related mutations
 */

// Types for Register mutation
export interface RegisterMutationData {
  register: AuthUser;
}

export const REGISTER: TD<RegisterMutationData, { input: UserRegisterInput }> = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      id
      name
      email
      imageUrl
    }
  }
` as unknown as TD<RegisterMutationData, { input: UserRegisterInput }>;

// Types for Login mutation
export interface LoginMutationData {
  login: { token: string; user: AuthUser };
}

export const LOGIN: TD<LoginMutationData, { input: UserLoginInput }> = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        name
        email
        imageUrl
      }
    }
  }
` as unknown as TD<LoginMutationData, { input: UserLoginInput }>;
