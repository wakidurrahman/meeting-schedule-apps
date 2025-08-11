import React from 'react';

export type TextFieldProps = {
  id?: string;
  label?: string;
  value?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
  isDirty?: boolean;
  isValid?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'value'>;

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ id, label, value, error, helpText, required, className, isDirty, isValid, ...rest }, ref) => {
    const controlId = id || rest.name || undefined;
    const isInvalid = Boolean(error);
    const classes = ['form-control', isInvalid ? 'is-invalid' : undefined, className]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="mb-3">
        {label && (
          <label htmlFor={controlId} className="form-label">
            {label}
            <span className="text-danger">{required ? ' *' : ''}</span>
          </label>
        )}
        <input
          id={controlId}
          ref={ref}
          className={classes}
          value={value}
          aria-required={isDirty && isValid}
          {...rest}
        />
        {helpText && !isInvalid && <div className="form-text">{helpText}</div>}
        {isInvalid && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;
