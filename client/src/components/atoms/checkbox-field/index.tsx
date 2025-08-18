import React from 'react';

import { FormComponentProps } from '@/types/components-common';
import { buildClassNames, createValidationClass } from '@/utils/components-helper';

/**
 * CheckboxFieldProps
 * @param id - The id of the checkbox field
 * @param label - The label of the checkbox field
 * @param error - The error message of the checkbox field
 * @param helpText - The help text of the checkbox field
 * @param required - Whether the checkbox field is required
 * @param className - The class name of the checkbox field
 * @param rest - The rest of the props
 * @returns The checkbox field component
 */
export type CheckboxFieldProps = FormComponentProps & {
  id?: string;
  label?: string;
  helpText?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'type' | 'value'>;

/**
 * CheckboxField
 * - Works with React Hook Form via register/Controller
 * - Mirrors Bootstrap 5.3 validation styling: adds `is-invalid` and feedback block
 * - Keeps accessible label association with `htmlFor`
 */
const CheckboxField = React.forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ id, label, error, helpText, required, className, ...rest }, ref) => {
    const controlId = id || rest.name || undefined;
    const isInvalid = Boolean(error);
    const classes = buildClassNames(
      'form-check-input',
      createValidationClass(isInvalid),
      className,
    );

    return (
      <div className="form-check mb-3">
        <input id={controlId} ref={ref} type="checkbox" className={classes} {...rest} />
        {label && (
          <label htmlFor={controlId} className="form-check-label">
            {label}
            <span className="text-danger ms-1">{required ? ' *' : ''}</span>
          </label>
        )}
        {helpText && !isInvalid && <div className="form-text">{helpText}</div>}
        {isInvalid && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  },
);
CheckboxField.displayName = 'CheckboxField';
export default CheckboxField;
