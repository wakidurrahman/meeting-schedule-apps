import React from 'react';

export type CheckboxFieldProps = {
  id?: string;
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
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
    const classes = ['form-check-input', isInvalid ? 'is-invalid' : undefined, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="form-check mb-3">
        <input id={controlId} ref={ref} type="checkbox" className={classes} {...rest} />
        {label && (
          <label htmlFor={controlId} className="form-check-label">
            {label}
            {required ? ' *' : ''}
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
