import { useMutation, useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';

import Alert from '@/components/atoms/alert';
import Breadcrumb from '@/components/atoms/breadcrumb';
import Button from '@/components/atoms/button';
import FilePondUploader, { FilePondAvatar } from '@/components/atoms/filepond-uploader';
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
import type { ImageUploadResult, UserImageSizes } from '@/types/user';
import { UpdateUserSchema } from '@/utils/validation';

export default function EditUserPage(): JSX.Element {
  const navigate = useNavigate();
  const params = useParams();
  const { addSuccess, addError } = useToast();
  const userId = params.id!;

  // State for uploaded image
  const [uploadedImage, setUploadedImage] = React.useState<UserImageSizes | null>(null);

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
        imageUrl: typeof data.user.imageUrl === 'string' ? data.user.imageUrl : '',
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
  const onSubmit = async (input: UpdateUserInput) => {
    try {
      const updateData = {
        ...input,
        imageUrl: uploadedImage || input.imageUrl || undefined, // Include uploaded image
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

                      {/* Profile Image Upload */}
                      <div className="col-12">
                        <div className="mb-3">
                          <label className="form-label">Profile Image</label>
                          <div className="row align-items-start">
                            <div className="col-md-8">
                              <FilePondUploader
                                userId={userId}
                                currentImage={uploadedImage || user.imageUrl}
                                onUploadSuccess={handleImageUploadSuccess}
                                onUploadError={handleImageUploadError}
                                disabled={updating || isSubmitting}
                              />
                              <small className="text-muted">
                                Upload a new profile image (JPG, PNG, WebP up to 5MB)
                              </small>
                            </div>
                            <div className="col-md-4">
                              <div className="text-center">
                                <FilePondAvatar
                                  imageUrl={uploadedImage || user.imageUrl}
                                  name={user.name}
                                  size="xl"
                                  className="mb-2 border"
                                />
                                <div className="small text-muted">Current Avatar</div>
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
                                const imageValue = uploadedImage || user.imageUrl;
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
                              imageUrl: typeof user.imageUrl === 'string' ? user.imageUrl : '',
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
