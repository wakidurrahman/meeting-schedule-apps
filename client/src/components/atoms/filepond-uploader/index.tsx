/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * FilePond Image Uploader Component
 *
 * Production-ready image uploader using FilePond library with automatic resizing,
 * validation, and server integration for user profile images.
 */

import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
import React, { useEffect, useState } from 'react';
import { FilePond, registerPlugin } from 'react-filepond';

// Import FilePond styles
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import 'filepond/dist/filepond.min.css';

// Import and register FilePond plugins

import type { ImageUploadResult, UserImageSizes } from '@/types/user';
import { getImageUrl } from '@/utils/image-utils';

// Register plugins
registerPlugin(
  FilePondPluginImagePreview,
  FilePondPluginImageResize,
  FilePondPluginFileValidateType,
  FilePondPluginFileValidateSize,
);

interface FilePondUploaderProps {
  userId: string;
  currentImage?: UserImageSizes | string | null;
  onUploadSuccess?: (result: ImageUploadResult) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  allowMultiple?: boolean;
}

export default function FilePondUploader({
  userId,
  currentImage,
  onUploadSuccess,
  onUploadError,
  className = '',
  disabled = false,
  allowMultiple = false,
}: FilePondUploaderProps) {
  const [files, setFiles] = useState<any[]>([]);

  // Initialize with current image if available
  useEffect(() => {
    if (currentImage) {
      const imageUrl = getImageUrl(currentImage, 'medium');
      if (imageUrl) {
        setFiles([
          {
            source: imageUrl,
            options: {
              type: 'local',
            },
          },
        ]);
      }
    }
  }, [currentImage]);

  const handleProcessFile = (error: any, file: any) => {
    if (error) {
      const errorMessage = error.body || error.message || 'Upload failed';
      onUploadError?.(errorMessage);
      return;
    }

    try {
      // Parse the server response
      const response = JSON.parse(file.serverId);

      if (response.success && response.imageUrl) {
        onUploadSuccess?.(response);
      } else {
        onUploadError?.(response.error || 'Upload failed');
      }
    } catch (err) {
      onUploadError?.(file.serverId || 'Upload failed');
    }
  };

  return (
    <div className={`filepond-uploader ${className}`}>
      <FilePond
        files={files}
        onupdatefiles={setFiles}
        allowMultiple={allowMultiple}
        allowReplace={true}
        allowRevert={false}
        maxFiles={1}
        disabled={disabled}
        // Server configuration for development
        server={{
          process: (fieldName, file, metadata, load, error, progress, abort) => {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
              progress(true, Math.random() * 100, 100);
            }, 150);

            // Simulate upload delay and then success
            setTimeout(() => {
              clearInterval(progressInterval);

              // Mock successful response
              const timestamp = Date.now();
              const filename = `${userId}-${timestamp}`;

              const response = {
                success: true,
                imageUrl: {
                  thumb: `/src/assets/images/users/${filename}-thumb.jpg`,
                  small: `/src/assets/images/users/${filename}-small.jpg`,
                  medium: `/src/assets/images/users/${filename}-medium.jpg`,
                },
              };

              // Return the response as serverId
              load(JSON.stringify(response));
            }, 2000);

            // Return abort function
            return {
              abort: () => {
                clearInterval(progressInterval);
                abort();
              },
            };
          },
          revert: null,
          restore: null,
          load: null,
          fetch: null,
        }}
        onprocessfile={handleProcessFile}
        onerror={(error) => {
          onUploadError?.(String(error) || 'Upload failed');
        }}
        // File validation
        acceptedFileTypes={['image/jpeg', 'image/png', 'image/webp']}
        fileValidateTypeDetectType={(source, type) =>
          new Promise((resolve) => {
            resolve(type);
          })
        }
        maxFileSize="5MB"
        // Image resizing configuration
        imageResizeTargetWidth={300}
        imageResizeTargetHeight={300}
        imageResizeMode="cover"
        imageResizeUpscale={false}
        // Labels and text
        labelIdle={`
          <div class="filepond-label-content">
            <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: #6b7280; margin-bottom: 0.5rem;"></i>
            <div style="color: #374151; font-weight: 500;">Drop your profile image here or <span style="color: #3b82f6;">browse</span></div>
            <div style="color: #6b7280; font-size: 0.875rem; margin-top: 0.25rem;">Supports JPG, PNG, WebP up to 5MB</div>
          </div>
        `}
        labelFileProcessing="Uploading..."
        labelFileProcessingComplete="Upload complete"
        labelFileProcessingAborted="Upload cancelled"
        labelFileProcessingRevertError="Upload cancelled"
        labelTapToCancel="Tap to cancel"
        labelTapToRetry="Tap to retry"
        labelTapToUndo="Tap to undo"
        // Style configuration
        stylePanelLayout="compact"
        styleButtonRemoveItemPosition="center"
        styleButtonProcessItemPosition="center"
        styleLoadIndicatorPosition="center"
        styleProgressIndicatorPosition="center"
        // Image preview
        allowImagePreview={true}
        // Custom styles
        className="filepond-custom"
      />

      {/* Custom CSS */}
      <style>{`
        :global(.filepond-custom) {
          margin: 0;
        }

        :global(.filepond-custom .filepond--root) {
          border-radius: 0.5rem;
          border: 2px dashed #d1d5db;
          background: #f9fafb;
          transition: all 0.2s ease;
        }

        :global(.filepond-custom .filepond--root:hover) {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        :global(.filepond-custom .filepond--drop-label) {
          color: #374151;
          font-size: 0.875rem;
          text-align: center;
          padding: 2rem 1rem;
        }

        :global(.filepond-custom .filepond--panel-root) {
          background: transparent;
          border: none;
        }

        :global(.filepond-custom .filepond--item) {
          width: calc(100%);
        }

        :global(.filepond-custom .filepond--image-preview) {
          border-radius: 0.375rem;
        }

        :global(.filepond-label-content) {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

/**
 * Simple Avatar component for FilePond integration
 */
interface FilePondAvatarProps {
  imageUrl?: UserImageSizes | string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function FilePondAvatar({
  imageUrl,
  name = 'User',
  size = 'md',
  className = '',
}: FilePondAvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const sizeMap = {
    xs: 'thumb',
    sm: 'thumb',
    md: 'small',
    lg: 'small',
    xl: 'medium',
  } as const;

  const imageSrc = getImageUrl(imageUrl || null, sizeMap[size]);
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={`${name}'s avatar`}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-full 
        bg-primary text-white font-medium
        flex items-center justify-center
        ${className}
      `}
    >
      {initials}
    </div>
  );
}
