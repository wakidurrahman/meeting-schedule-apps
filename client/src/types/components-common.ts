/**
 * Common types and interfaces used across atomic components
 */

// Base variant types used across components
export type BaseVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

// Extended variant for buttons (includes 'link')
export type ButtonVariant = BaseVariant | 'link';

// Button outline variant (excludes 'link')
export type ButtonOutlineVariant = Exclude<ButtonVariant, 'link'>;

// Common size variants
export type ComponentSize = 'sm' | 'md' | 'lg';

// Bootstrap form validation states
export type ValidationState = 'valid' | 'invalid';

// Common spinner styles
export type SpinnerStyle = 'border' | 'grow';

// Text color variants (for spinners, text elements)
export type TextColor = BaseVariant;

// Badge variants (same as base variants)
export type BadgeVariant = BaseVariant;

// Alert variants (same as base variants)
export type AlertVariant = BaseVariant;

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Props for components that support variants
export interface VariantComponentProps<T = BaseVariant> extends BaseComponentProps {
  variant?: T;
}

// Props for components that support sizing
export interface SizeComponentProps extends BaseComponentProps {
  size?: ComponentSize;
}

// Props for form components
export interface FormComponentProps extends BaseComponentProps {
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

// Heading levels
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

// Heading tag types
export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
