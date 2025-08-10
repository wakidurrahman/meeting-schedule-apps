import React from 'react';

export type SelectFieldOption = { value: string; label: string };

export type SelectFieldProps = {
  id?: string;
  label?: string;
  value?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
  options: SelectFieldOption[];
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'value'>;

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      id,
      label,
      value,
      error,
      helpText,
      required,
      className,
      options,
      ...rest
    },
    ref
  ) => {
    const controlId = id || rest.name || undefined;
    const isInvalid = Boolean(error);
    const classes = [
      'form-select',
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
        <select
          id={controlId}
          ref={ref}
          className={classes}
          value={value}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {helpText && !isInvalid && <div className="form-text">{helpText}</div>}
        {isInvalid && <div className="invalid-feedback">{error}</div>}
      </div>
    );
  }
);

export default SelectField;
