import React, { useState } from 'react';

import Button from '@/components/atoms/button';
import FilePondUploader, { FilePondAvatar } from '@/components/atoms/filepond-uploader';
import TextField from '@/components/atoms/text-field';
import BaseTemplate from '@/components/templates/base-templates';
import { useAuthContext, useAuthUser } from '@/context/AuthContext';
import type { ImageUploadResult } from '@/types/user';

export default function Profile(): JSX.Element {
  const authUser = useAuthUser();
  const { logout } = useAuthContext();
  const [name, setName] = useState(authUser.name);
  const [email] = useState(authUser.email);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState(authUser.imageUrl);

  const currentImage = uploadedImage || authUser.imageUrl;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // TODO: Wire to backend mutation when available
      // Include uploadedImage in the update payload
      const profileData = {
        name,
        imageUrl: uploadedImage,
      };

      console.log('Profile update payload:', profileData);
      await new Promise((r) => setTimeout(r, 600));
      setMessage('Profile updated successfully! (Development mode: saved locally)');
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUploadSuccess = (result: ImageUploadResult) => {
    if (result.success && result.imageUrl) {
      setUploadedImage(result.imageUrl);
      setMessage('Profile image uploaded successfully!');
    }
  };

  const handleImageUploadError = (error: string) => {
    setMessage(`Image upload failed: ${error}`);
  };

  const onDelete = async () => {
    // TODO: Wire delete account when available
    setMessage('Delete profile not yet implemented');
  };

  return (
    <BaseTemplate>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <h2 className="mb-4">Your Profile</h2>

            {/* Profile Header with Avatar */}
            <div className="d-flex align-items-center gap-4 mb-4 p-3 bg-light rounded">
              <FilePondAvatar
                imageUrl={currentImage}
                name={authUser.name}
                size="xl"
                className="border border-2 border-white shadow-sm"
              />
              <div className="flex-grow-1">
                <div className="small text-muted">Logged in as</div>
                <div className="fw-medium">{authUser.email}</div>
                <div className="small text-muted mt-1">
                  {currentImage ? 'Custom profile image' : 'Using default avatar'}
                </div>
              </div>
            </div>

            <form onSubmit={onSave} noValidate>
              <TextField
                label="Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField label="Email" value={email} readOnly disabled />

              {/* Image Upload Section */}
              <div className="mb-4">
                <div className="form-label mb-3">
                  Profile Picture
                  <small className="text-muted ms-2">
                    (Development mode: images saved locally)
                  </small>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <FilePondUploader
                      userId={authUser.id}
                      currentImage={currentImage}
                      onUploadSuccess={handleImageUploadSuccess}
                      onUploadError={handleImageUploadError}
                      className="mb-3"
                    />
                  </div>
                  <div className="col-md-6">
                    <div className="bg-light p-3 rounded h-100">
                      <h6 className="mb-2">Image Sizes</h6>
                      <div className="small text-muted mb-3">
                        Your image is automatically resized for different uses:
                      </div>
                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex align-items-center gap-2">
                          <FilePondAvatar imageUrl={currentImage} size="xs" />
                          <span className="small">Navigation (50×50)</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <FilePondAvatar imageUrl={currentImage} size="sm" />
                          <span className="small">Cards (150×150)</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <FilePondAvatar imageUrl={currentImage} size="lg" />
                          <span className="small">Profile (300×300)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {message && <div className="alert alert-info py-2 small">{message}</div>}

              <div className="d-flex gap-2">
                <Button type="submit" variant="primary" disabled={isSaving}>
                  Save changes
                </Button>
                <Button type="button" variant="danger" outline onClick={onDelete}>
                  Delete profile
                </Button>
                <Button type="button" variant="secondary" outline onClick={logout}>
                  Logout
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
}
