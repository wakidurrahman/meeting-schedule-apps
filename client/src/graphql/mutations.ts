import { Meeting, MeetingInput } from '@/types/meeting';
import {
  AuthUser,
  UserLoginInput,
  UserProfile,
  UserRegisterInput,
} from '@/types/user';
import { gql } from '@apollo/client';
import { TypedDocumentNode as TD } from '@graphql-typed-document-node/core';

// Types for Register mutation
export interface RegisterMutationData {
  register: AuthUser;
}

export const REGISTER: TD<RegisterMutationData, { input: UserRegisterInput }> =
  gql`
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

// Update profile
export interface UpdateMyProfileData {
  updateMyProfile: UserProfile;
}
export interface UpdateMyProfileVars {
  input: Partial<UserProfile>;
}
export const UPDATE_MY_PROFILE: TD<UpdateMyProfileData, UpdateMyProfileVars> =
  gql`
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

// Types for CreateMeeting mutation
export interface CreateMeetingMutationData {
  createMeeting: Meeting;
}

export interface CreateMeetingMutationVariables {
  input: MeetingInput;
}

export const CREATE_MEETING: TD<
  CreateMeetingMutationData,
  CreateMeetingMutationVariables
> = gql`
  mutation CreateMeeting($input: MeetingInput!) {
    createMeeting(input: $input) {
      id
      title
      description
      startTime
      endTime
    }
  }
` as unknown as TD<CreateMeetingMutationData, CreateMeetingMutationVariables>;
