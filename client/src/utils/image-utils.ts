/**
 * Image Utility Functions
 *
 * Minimal utilities for handling user image URLs with multi-size support
 */

import type { UserImageSizes } from '@/types/user';

/**
 * Gets the appropriate image URL based on the size needed
 */
export function getImageUrl(
  imageUrl: UserImageSizes | string | null,
  size: keyof UserImageSizes = 'small',
): string | null {
  if (!imageUrl) return null;

  if (typeof imageUrl === 'string') {
    // Legacy single URL support
    return imageUrl;
  }

  return imageUrl[size] || imageUrl.small || imageUrl.medium || imageUrl.thumb || null;
}
