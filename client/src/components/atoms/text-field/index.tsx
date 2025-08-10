import React from 'react';

export type TextFieldProps = {
  id?: string;
  label?: string;
  value?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'value'>;

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    { id, label, value, error, helpText, required, className, ...rest },
    ref
  ) => {
    const controlId = id || rest.name || undefined;
    const isInvalid = Boolean(error);
    const classes = [
      'form-control',
      isInvalid ? 'is-invalid' : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="mb-3">
        {label && (
          <label htmlFor={controlId} className="form-label">
            {label}
            {required ? ' *' : ''}
          </label>
        )}
        <input
          id={controlId}
          ref={ref}
          className={classes}
          value={value}
          {...rest}
        />
        {helpText && !isInvalid && <div className="form-text">{helpText}</div>}
        {isInvalid && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  }
);

export default TextField;
