import React from 'react';

import { FormComponentProps } from '@/types/components-common';
import { buildClassNames, createValidationClass } from '@/utils/component';

export type SelectFieldOption = { value: string; label: string };

/**
 * SelectFieldProps
 * @param id - The id of the select field
 * @param label - The label of the select field
 * @param value - The value of the select field
 * @param error - The error message of the select field
 * @param helpText - The help text of the select field
 * @param required - Whether the select field is required
 * @param className - The class name of the select field
 * @param options - The options of the select field
 * @param rest - The rest of the props
 * @returns The select field component
 */
export type SelectFieldProps = FormComponentProps & {
  id?: string;
  label?: string;
  value?: string;
  helpText?: string;
  options: SelectFieldOption[];
} & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'value'>;

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ id, label, value, error, helpText, required, className, options, ...rest }, ref) => {
    const controlId = id || rest.name || undefined;
    const isInvalid = Boolean(error);
    const classes = buildClassNames('form-select', createValidationClass(isInvalid), className);

    return (
      <div className="mb-3">
        {label && (
          <label htmlFor={controlId} className="form-label">
            {label}
            <span className="text-danger ms-1">{required ? ' *' : ''}</span>
          </label>
        )}
        <select id={controlId} ref={ref} className={classes} value={value} {...rest}>
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
  },
);

SelectField.displayName = 'SelectField';

export default SelectField;
