import React from 'react';

import { FormComponentProps } from '@/types/components-common';
import { createFormControlClasses } from '@/utils/components-helper';

/**
 * TextFieldProps
 * @param id - The id of the text field
 * @param label - The label of the text field
 * @param value - The value of the text field
 * @param error - The error message of the text field
 * @param helpText - The help text of the text field
 * @param required - Whether the text field is required
 * @param className - The class name of the text field
 * @param isDirty - Whether the text field is dirty
 * @param isValid - Whether the text field is valid
 * @param rest - The rest of the props
 * @returns The text field component
 */
export type TextFieldProps = FormComponentProps & {
  id?: string;
  label?: string;
  value?: string;
  helpText?: string;
  isDirty?: boolean;
  isValid?: boolean;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'value'>;

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ id, label, value, error, helpText, required, className, isDirty, isValid, ...rest }, ref) => {
    const controlId = id || rest.name || undefined;
    const isInvalid = Boolean(error);
    const classes = createFormControlClasses(isInvalid, className);

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
