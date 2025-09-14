/**
 * Mock API endpoint for profile image upload
 * This simulates the server response for development
 */

// Simulate upload delay
const uploadDelay = () => new Promise((resolve) => setTimeout(resolve, 1500));

// Mock successful upload response
const mockUploadResponse = (userId) => {
  const timestamp = Date.now();
  const filename = `${userId}-${timestamp}`;

  return {
    success: true,
    imageUrl: {
      thumb: `/src/assets/images/users/${filename}-thumb.jpg`,
      small: `/src/assets/images/users/${filename}-small.jpg`,
      medium: `/src/assets/images/users/${filename}-medium.jpg`,
    },
    message: 'Image uploaded successfully',
  };
};

// Mock error response
const mockErrorResponse = (message) => ({
  success: false,
  error: message || 'Upload failed',
});

// This would be handled by your actual server
// For now, it's just a reference for the expected response format
export { mockUploadResponse, mockErrorResponse, uploadDelay };
