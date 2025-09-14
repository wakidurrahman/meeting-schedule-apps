// Image types for multi-size support
export type UserImageSizes = {
  thumb: string; // 50x50 for navigation
  small: string; // 150x150 for profile cards
  medium: string; // 300x300 for detail pages
};

export type UserImageUrl = UserImageSizes | string | null;

export type AttendeeUser = {
  id: string;
  name: string;
  email: string;
  imageUrl?: UserImageUrl;
};

export type AttendeesUser = {
  id: string;
  name: string;
  imageUrl?: UserImageUrl;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  imageUrl?: UserImageUrl;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  imageUrl?: UserImageUrl;
  address?: string | null;
  dob?: string | null; // ISO string
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
};

export type UserRegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type AuthenticatedUser = AuthUser;
export type AuthUserNullable = AuthenticatedUser | null;

export type AuthContextValue = {
  user: AuthUserNullable; // the authenticated user
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthenticatedUser) => void;
  logout: () => void;
};

export type UserLoginInput = {
  email: string;
  password: string;
};

export type UserRole = 'USER' | 'ADMIN' | 'ALL';

export type UserSortBy = 'NAME' | 'CREATED_AT' | 'UPDATED_AT';

export type UserSortDirection = 'ASC' | 'DESC';

export type UserSearch = {
  search: string;
};

// Image upload types
export type ImageUploadResult = {
  success: boolean;
  imageUrl?: UserImageSizes;
  error?: string;
};

export type ImageFile = {
  file: File;
  preview: string;
  size: number;
  type: string;
};

export type ImageUploadProgress = {
  uploading: boolean;
  progress: number;
  error?: string;
};
