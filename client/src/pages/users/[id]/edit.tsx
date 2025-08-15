import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import Alert from '@/components/atoms/alert';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import SelectField from '@/components/atoms/select-field';
import Spinner from '@/components/atoms/spinner';
import TextField from '@/components/atoms/text-field';
import BaseTemplate from '@/components/templates/base-templates';
import { UPDATE_USER, type UpdateUserData, type UpdateUserInput } from '@/graphql/user/mutations';
import { GET_USER, GET_USERS, type UserQueryData } from '@/graphql/user/queries';
import { useToast } from '@/hooks/use-toast';
import { UpdateUserSchema } from '@/utils/validation';

export default function EditUserPage(): JSX.Element {
  const navigate = useNavigate();
  const params = useParams();
  const { showToast } = useToast();
  const userId = params.id!;

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      imageUrl: '',
      role: 'USER',
    },
  });

  // Fetch user data
  const {
    data,
    loading: loadingUser,
    error: userError,
  } = useQuery<UserQueryData, { id: string }>(GET_USER, {
    variables: { id: userId },
    skip: !userId,
  });

  // Update form when user data loads
  useEffect(() => {
    if (data?.user) {
      reset({
        name: data.user.name,
        email: data.user.email,
        imageUrl: data.user.imageUrl || '',
        role: data.user.role as 'ADMIN' | 'USER',
      });
    }
  }, [data?.user, reset]);

  // GraphQL mutation
  const [updateUser, { loading: updating, error: updateError }] = useMutation<
    UpdateUserData,
    { id: string; input: UpdateUserInput }
  >(UPDATE_USER, {
    refetchQueries: [{ query: GET_USERS }, { query: GET_USER, variables: { id: userId } }],
    onCompleted: (data) => {
      showToast({
        type: 'success',
        message: `User "${data.updateUser.name}" updated successfully!`,
      });
      navigate(`/users/${userId}`);
    },
    onError: (error) => {
      showToast({
        type: 'error',
        message: `Failed to update user: ${error.message}`,
      });
    },
  });

  // Form submission
  const onSubmit = async (input: UpdateUserInput) => {
    try {
      const updateData = {
        ...input,
        imageUrl: input.imageUrl || undefined, // Convert empty string to undefined
      };
      await updateUser({ variables: { id: userId, input: updateData } });
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  if (loadingUser) {
    return (
      <BaseTemplate>
        <div className="container-fluid">
          <div className="text-center py-5">
            <Spinner />
            <p className="mt-2">Loading user data...</p>
          </div>
        </div>
      </BaseTemplate>
    );
  }

  if (userError) {
    return (
      <BaseTemplate>
        <div className="container-fluid">
          <Alert type="error">Error loading user: {userError.message}</Alert>
        </div>
      </BaseTemplate>
    );
  }

  if (!data?.user) {
    return (
      <BaseTemplate>
        <div className="container-fluid">
          <Alert type="error">User not found</Alert>
        </div>
      </BaseTemplate>
    );
  }

  return (
    <BaseTemplate>
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="mb-4">
              <Heading level={1}>Edit User</Heading>
              <p className="text-muted">Update user information</p>
            </div>

            {updateError && (
              <Alert type="error" className="mb-4">
                {updateError.message}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="needs-validation" noValidate>
              <div className="row g-3">
                {/* Name Field */}
                <div className="col-12">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Full Name"
                        placeholder="Enter full name"
                        required
                        error={errors.name?.message}
                        disabled={updating || isSubmitting}
                      />
                    )}
                  />
                </div>

                {/* Email Field */}
                <div className="col-12">
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="email"
                        label="Email Address"
                        placeholder="Enter email address"
                        required
                        error={errors.email?.message}
                        disabled={updating || isSubmitting}
                      />
                    )}
                  />
                </div>

                {/* Role Field */}
                <div className="col-12">
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <SelectField
                        {...field}
                        label="Role"
                        required
                        error={errors.role?.message}
                        disabled={updating || isSubmitting}
                        options={[
                          { value: 'USER', label: 'User' },
                          { value: 'ADMIN', label: 'Administrator' },
                        ]}
                      />
                    )}
                  />
                </div>

                {/* Image URL Field */}
                <div className="col-12">
                  <Controller
                    name="imageUrl"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        type="url"
                        label="Profile Image URL"
                        placeholder="https://example.com/avatar.jpg (optional)"
                        error={errors.imageUrl?.message}
                        disabled={updating || isSubmitting}
                        helpText="Optional: Provide a URL for the user's profile image"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-3 mt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={updating || isSubmitting}
                  className="flex-grow-1"
                >
                  {updating || isSubmitting ? 'Updating...' : 'Update User'}
                </Button>

                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => navigate(`/users/${userId}`)}
                  disabled={updating || isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => {
                    if (data?.user) {
                      reset({
                        name: data.user.name,
                        email: data.user.email,
                        imageUrl: data.user.imageUrl || '',
                        role: data.user.role as 'ADMIN' | 'USER',
                      });
                    }
                  }}
                  disabled={updating || isSubmitting}
                >
                  Reset
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}
