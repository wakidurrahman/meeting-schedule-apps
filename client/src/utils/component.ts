/**
 * Helper functions for building component class names and handling common patterns
 */

/**
 * Builds a class name string from an array of class values
 * Filters out falsy values and joins with spaces
 * @param classes - Array of class names (strings, undefined, null, false, etc.)
 * @returns Combined class name string
 */
export function buildClassNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Creates a variant-based class name
 * @param baseClass - The base CSS class
 * @param variant - The variant to apply
 * @param prefix - Optional prefix for the variant (default: baseClass)
 * @returns Formatted class name
 */
export function createVariantClass(baseClass: string, variant?: string, prefix?: string): string {
  if (!variant) return baseClass;
  const variantPrefix = prefix || baseClass;
  return `${variantPrefix}-${variant}`;
}

/**
 * Creates a size-based class name
 * @param baseClass - The base CSS class
 * @param size - The size to apply
 * @returns Formatted class name or undefined if no size
 */
export function createSizeClass(baseClass: string, size?: string): string | undefined {
  return size ? `${baseClass}-${size}` : undefined;
}

/**
 * Creates Bootstrap form validation class
 * @param isInvalid - Whether the field is invalid
 * @returns Validation class name or undefined
 */
export function createValidationClass(isInvalid?: boolean): string | undefined {
  return isInvalid ? 'is-invalid' : undefined;
}

/**
 * Creates a complete button class name following Bootstrap patterns
 * @param variant - Button variant
 * @param outline - Whether it's an outline button
 * @param size - Button size
 * @param additionalClasses - Additional class names
 * @returns Complete button class name
 */
export function createButtonClasses(
  variant: string = 'primary',
  outline?: boolean,
  size?: string,
  ...additionalClasses: (string | undefined)[]
): string {
  const baseClass = outline ? `btn btn-outline-${variant}` : `btn btn-${variant}`;
  const sizeClass = createSizeClass('btn', size);

  return buildClassNames(baseClass, sizeClass, ...additionalClasses);
}

/**
 * Creates form control classes with validation state
 * @param isInvalid - Whether the field is invalid
 * @param additionalClasses - Additional class names
 * @returns Complete form control class name
 */
export function createFormControlClasses(
  isInvalid?: boolean,
  ...additionalClasses: (string | undefined)[]
): string {
  return buildClassNames('form-control', createValidationClass(isInvalid), ...additionalClasses);
}

/**
 * Creates alert classes
 * @param variant - Alert variant
 * @param dismissible - Whether the alert is dismissible
 * @param additionalClasses - Additional class names
 * @returns Complete alert class name
 */
export function createAlertClasses(
  variant: string = 'primary',
  dismissible?: boolean,
  ...additionalClasses: (string | undefined)[]
): string {
  return buildClassNames(
    'alert',
    `alert-${variant}`,
    dismissible ? 'alert-dismissible' : undefined,
    ...additionalClasses,
  );
}

/**
 * Creates badge classes
 * @param variant - Badge variant
 * @param pill - Whether the badge is pill-shaped
 * @param additionalClasses - Additional class names
 * @returns Complete badge class name
 */
export function createBadgeClasses(
  variant: string = 'secondary',
  pill?: boolean,
  ...additionalClasses: (string | undefined)[]
): string {
  return buildClassNames(
    'badge',
    `text-bg-${variant}`,
    pill ? 'rounded-pill' : undefined,
    ...additionalClasses,
  );
}

/**
 * Creates spinner classes
 * @param style - Spinner style ('border' or 'grow')
 * @param color - Text color for the spinner
 * @param size - Spinner size
 * @param additionalClasses - Additional class names
 * @returns Complete spinner class name
 */
export function createSpinnerClasses(
  style: string = 'border',
  color?: string,
  size?: string,
  ...additionalClasses: (string | undefined)[]
): string {
  const baseClass = style === 'grow' ? 'spinner-grow' : 'spinner-border';
  const sizeClass = createSizeClass(baseClass, size);
  const colorClass = color ? `text-${color}` : undefined;

  return buildClassNames(baseClass, sizeClass, colorClass, ...additionalClasses);
}

/**
 * Omits specified properties from an object (utility for prop spreading)
 * @param obj - The object to omit properties from
 * @param keys - The properties to omit
 * @returns Object with specified properties omitted
 */
export function omitProps<T extends Record<string, unknown>, K extends readonly (keyof T)[]>(
  obj: T,
  keys: K,
): Omit<T, K[number]> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!keys.includes(key as keyof T)) {
      result[key] = value;
    }
  }
  return result as Omit<T, K[number]>;
}
