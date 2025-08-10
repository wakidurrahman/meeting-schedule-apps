import React from 'react';

export type TextareaFieldProps = {
  id?: string;
  label?: string;
  value?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
  rows?: number;
} & Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className' | 'value'
>;

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      id,
      label,
      value,
      error,
      helpText,
      required,
      className,
      rows = 3,
      ...rest
    },
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
        <textarea
          id={controlId}
          ref={ref}
          className={classes}
          value={value}
          rows={rows}
          {...rest}
        />
        {helpText && !isInvalid && <div className="form-text">{helpText}</div>}
        {isInvalid && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  }
);

export default TextareaField;
