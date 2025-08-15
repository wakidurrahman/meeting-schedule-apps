import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

import { UserProfile } from '@/types/user';

/**
 * User management mutations
 */

// Create user
export interface CreateUserData {
  createUser: UserProfile;
}

export interface CreateUserInput {
  name: string;
  email: string;
  imageUrl?: string;
  role: 'ADMIN' | 'USER';
}

export const CREATE_USER: TD<CreateUserData, { input: CreateUserInput }> = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      imageUrl
      role
      createdAt
      updatedAt
    }
  }
` as unknown as TD<CreateUserData, { input: CreateUserInput }>;

// Update user
export interface UpdateUserData {
  updateUser: UserProfile;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
  imageUrl?: string;
  role?: 'ADMIN' | 'USER';
}

export const UPDATE_USER: TD<UpdateUserData, { id: string; input: UpdateUserInput }> = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      imageUrl
      role
      createdAt
      updatedAt
    }
  }
` as unknown as TD<UpdateUserData, { id: string; input: UpdateUserInput }>;

// Delete user
export interface DeleteUserData {
  deleteUser: boolean;
}

export const DELETE_USER: TD<DeleteUserData, { id: string }> = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
` as unknown as TD<DeleteUserData, { id: string }>;

// Update my profile
export interface UpdateMyProfileData {
  updateMyProfile: UserProfile;
}

export interface UpdateMyProfileVars {
  input: Partial<UserProfile>;
}

export const UPDATE_MY_PROFILE: TD<UpdateMyProfileData, UpdateMyProfileVars> = gql`
  mutation UpdateMyProfile($input: UpdateProfileInput!) {
    updateMyProfile(input: $input) {
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
` as unknown as TD<UpdateMyProfileData, UpdateMyProfileVars>;
