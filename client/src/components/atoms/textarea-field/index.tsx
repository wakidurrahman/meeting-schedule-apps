import React from 'react';

import { FormComponentProps } from '@/types/components-common';
import { createFormControlClasses } from '@/utils/components-helper';

/**
 * TextareaFieldProps
 * @param id - The id of the textarea field
 * @param label - The label of the textarea field
 * @param value - The value of the textarea field
 * @param error - The error message of the textarea field
 * @param helpText - The help text of the textarea field
 * @param required - Whether the textarea field is required
 * @param className - The class name of the textarea field
 * @param rows - The number of rows of the textarea field
 * @param rest - The rest of the props
 * @returns The textarea field component
 */
export type TextareaFieldProps = FormComponentProps & {
  id?: string;
  label?: string;
  value?: string;
  helpText?: string;
  rows?: number;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'value'>;

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ id, label, value, error, helpText, required, className, rows = 3, ...rest }, ref) => {
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
  },
);

TextareaField.displayName = 'TextareaField';

export default TextareaField;
