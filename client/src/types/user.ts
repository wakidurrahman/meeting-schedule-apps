export type AuthUser = {
  id: string;
  name: string;
  email: string;
  imageUrl?: string | null;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  imageUrl?: string | null;
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
