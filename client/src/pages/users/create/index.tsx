import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import Alert from '@/components/atoms/alert';
import Breadcrumb from '@/components/atoms/breadcrumb';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import SelectField from '@/components/atoms/select-field';
import Text from '@/components/atoms/text';
import TextField from '@/components/atoms/text-field';
import Card from '@/components/molecules/card';
import BaseTemplate from '@/components/templates/base-templates';
import { paths } from '@/constants/paths';
import { CREATE_USER, type CreateUserData, type CreateUserInput } from '@/graphql/user/mutations';
import { GET_USERS } from '@/graphql/user/queries';
import { useToast } from '@/hooks/use-toast';
import { CreateUserSchema } from '@/utils/validation';

export default function CreateUserPage(): JSX.Element {
  const navigate = useNavigate();
  const { addSuccess, addError } = useToast();

  // Form setup
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      imageUrl: '',
      role: 'USER',
    },
  });

  // GraphQL mutation
  const [createUser, { loading, error }] = useMutation<CreateUserData, { input: CreateUserInput }>(
    CREATE_USER,
    {
      refetchQueries: [{ query: GET_USERS }],
      onCompleted: (data) => {
        addSuccess({
          title: 'User Created!',
          subtitle: 'just now',
          children: `User "${data.createUser.name}" created successfully!`,
        });
        navigate(`/users/${data.createUser.id}`);
      },
      onError: (error) => {
        addError({
          title: 'Creation Failed!',
          subtitle: 'just now',
          children: `Failed to create user: ${error.message}`,
        });
      },
    },
  );

  // Form submission
  const onSubmit = async (data: CreateUserInput) => {
    try {
      const input = {
        ...data,
        imageUrl: data.imageUrl || undefined, // Convert empty string to undefined
      };
      await createUser({ variables: { input } });
    } catch (err) {
      console.error('Error creating user:', err);
    }
  };

  const breadcrumbItems = [
    { label: 'Users', href: paths.users || '/users' },
    { label: 'Create User', active: true },
  ];

  return (
    <BaseTemplate>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            {/* Page Header */}
            <div className="mb-4">
              <Heading level={1}>Create New User</Heading>
              <Text className="text-muted">Add a new user to the system</Text>
            </div>

            <Card shadow="sm" className="mb-4">
              <Card.Body>
                {/* Error State */}
                {error && (
                  <Alert variant="danger" className="mb-4">
                    <strong>Creation failed:</strong> {error.message}
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
                            disabled={loading || isSubmitting}
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
                            disabled={loading || isSubmitting}
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
                            disabled={loading || isSubmitting}
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
                            disabled={loading || isSubmitting}
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
                      disabled={loading || isSubmitting}
                      className="flex-grow-1"
                    >
                      {loading || isSubmitting ? 'Creating...' : 'Create User'}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate(paths.users || '/users')}
                      disabled={loading || isSubmitting}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => reset()}
                      disabled={loading || isSubmitting}
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </Card.Body>
            </Card>

            <Breadcrumb items={breadcrumbItems} className="mb-3 mt-5" />
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}
