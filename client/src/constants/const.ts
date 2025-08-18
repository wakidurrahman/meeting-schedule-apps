export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
export const SORT_FIELD_ENUM = ['NAME', 'CREATED_AT', 'UPDATED_AT'] as const;
export const SORT_DIRECTION_ENUM = ['ASC', 'DESC'] as const;
export const USER_ROLE_ENUM = ['ADMIN', 'USER'] as const;
export const USER_SEARCH_ROLE_ENUM = ['ALL', 'ADMIN', 'USER'] as const;
