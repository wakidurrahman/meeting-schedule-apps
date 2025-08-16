import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import Alert from '@/components/atoms/alert';
import Breadcrumb from '@/components/atoms/breadcrumb';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import SelectField from '@/components/atoms/select-field';
import Text from '@/components/atoms/text';
import TextField from '@/components/atoms/text-field';
import Card from '@/components/molecules/card';
import { FormSkeleton } from '@/components/molecules/skeleton';
import BaseTemplate from '@/components/templates/base-templates';
import { paths } from '@/constants/paths';
import { UPDATE_USER, type UpdateUserData, type UpdateUserInput } from '@/graphql/user/mutations';
import { GET_USER, GET_USERS, type UserQueryData } from '@/graphql/user/queries';
import { useToast } from '@/hooks/use-toast';
import { UpdateUserSchema } from '@/utils/validation';

export default function EditUserPage(): JSX.Element {
  const navigate = useNavigate();
  const params = useParams();
  const { addSuccess, addError } = useToast();
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
      addSuccess({
        title: 'User Updated!',
        subtitle: 'just now',
        children: `User "${data.updateUser.name}" updated successfully!`,
      });
      navigate(`/users/${userId}`);
    },
    onError: (error) => {
      addError({
        title: 'Update Failed!',
        subtitle: 'just now',
        children: `Failed to update user: ${error.message}`,
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

  // Prepare data for rendering
  const user = data?.user;
  const breadcrumbItems = user
    ? [
        { label: 'Users', href: paths.users || '/users' },
        { label: user.name, active: true },
      ]
    : [
        { label: 'Users', href: paths.users || '/users' },
        { label: 'User Details', active: true },
      ];
  return (
    <BaseTemplate>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            {/* Page Header */}
            <div className="mb-4">
              <Heading level={1}>Update Information</Heading>
              <Text className="text-muted">Update user information</Text>
            </div>

            <Card shadow="sm" className="mb-4">
              <Card.Body>
                <Card.Title className="mb-3" level={5}>
                  {user?.name}
                </Card.Title>
                {/* Loading State */}
                {loadingUser && (
                  <div className="mb-4">
                    <FormSkeleton fields={4} />
                  </div>
                )}

                {/* Error State */}
                {userError && (
                  <div className="mb-4">
                    <Alert variant="danger">
                      <strong>Error loading user:</strong> {userError.message}
                    </Alert>
                  </div>
                )}

                {/* User Not Found */}
                {!loadingUser && !userError && !user && (
                  <div className="mb-4">
                    <Alert variant="warning">
                      <strong>User not found</strong>
                      <br />
                      The user you&apos;re trying to edit doesn&apos;t exist or may have been
                      deleted.
                    </Alert>
                  </div>
                )}

                {/* Update Error */}
                {updateError && (
                  <Alert variant="danger" className="mb-4">
                    <strong>Update failed:</strong> {updateError.message}
                  </Alert>
                )}

                {/* Edit Form */}
                {!loadingUser && !userError && user && (
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
                        variant="secondary"
                        onClick={() => navigate(`/users/${userId}`)}
                        disabled={updating || isSubmitting}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                          if (user) {
                            reset({
                              name: user.name,
                              email: user.email,
                              imageUrl: user.imageUrl || '',
                              role: user.role as 'ADMIN' | 'USER',
                            });
                          }
                        }}
                        disabled={updating || isSubmitting}
                      >
                        Reset
                      </Button>
                    </div>
                  </form>
                )}
              </Card.Body>
            </Card>

            <Breadcrumb items={breadcrumbItems} className="mb-3 mt-5" />
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}
