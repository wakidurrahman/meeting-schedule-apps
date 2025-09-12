import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import Alert from '@/components/atoms/alert';
import Breadcrumb from '@/components/atoms/breadcrumb';
import Button from '@/components/atoms/button';
import FilePondUploader, { FilePondAvatar } from '@/components/atoms/filepond-uploader';
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
import type { ImageUploadResult, UserImageSizes } from '@/types/user';
import { CreateUserSchema } from '@/utils/validation';

export default function CreateUserPage(): JSX.Element {
  const navigate = useNavigate();
  const { addSuccess, addError } = useToast();

  // State for uploaded image
  const [uploadedImage, setUploadedImage] = useState<UserImageSizes | null>(null);

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

  // Handle image upload success
  const handleImageUploadSuccess = (result: ImageUploadResult) => {
    if (result.success && result.imageUrl) {
      setUploadedImage(result.imageUrl);
      addSuccess({
        title: 'Image Uploaded!',
        subtitle: 'just now',
        children: 'Profile image uploaded successfully!',
      });
    }
  };

  // Handle image upload error
  const handleImageUploadError = (error: string) => {
    addError({
      title: 'Upload Failed!',
      subtitle: 'just now',
      children: `Failed to upload image: ${error}`,
    });
  };

  // Form submission
  const onSubmit = async (data: CreateUserInput) => {
    try {
      const input = {
        ...data,
        imageUrl: uploadedImage || data.imageUrl || undefined, // Include uploaded image
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
              <Heading level={1}>Create User</Heading>
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

                    {/* Profile Image Upload */}
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label">Profile Image</label>
                        <div className="row align-items-start">
                          <div className="col-md-8">
                            <FilePondUploader
                              userId="new-user"
                              currentImage={uploadedImage}
                              onUploadSuccess={handleImageUploadSuccess}
                              onUploadError={handleImageUploadError}
                              disabled={loading || isSubmitting}
                            />
                            <small className="text-muted">
                              Upload a new profile image (JPG, PNG, WebP up to 5MB)
                            </small>
                          </div>
                          <div className="col-md-4">
                            <div className="text-center">
                              <FilePondAvatar
                                imageUrl={uploadedImage}
                                name="New User"
                                size="xl"
                                className="mb-2 border"
                              />
                              <div className="small text-muted">Preview</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hidden field to maintain form compatibility */}
                      <Controller
                        name="imageUrl"
                        control={control}
                        render={({ field }) => (
                          <input
                            type="hidden"
                            {...field}
                            value={(() => {
                              const imageValue = uploadedImage || field.value;
                              if (typeof imageValue === 'string') {
                                return imageValue || '';
                              }
                              return JSON.stringify(imageValue) || '';
                            })()}
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
                      aria-label="Save user"
                    >
                      {loading || isSubmitting ? 'Saving...' : 'Save'}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate(paths.users || '/users')}
                      disabled={loading || isSubmitting}
                      aria-label="Cancel"
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => reset()}
                      disabled={loading || isSubmitting}
                      aria-label="Reset"
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
