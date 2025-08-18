import React from 'react';

import {
  BaseComponentProps,
  ComponentSize,
  SpinnerStyle,
  TextColor,
} from '@/types/components-common';
import { createSpinnerClasses } from '@/utils/components-helper';

/**
 * SpinnerProps
 * @param variant - The variant of the spinner
 * @param color - The color of the spinner
 * @param size - The size of the spinner
 * @param className - The class name of the spinner
 * @param label - The label of the spinner
 * @param showLabel - Whether to show the label
 * @param rest - The rest of the props
 * @returns The spinner component
 */
export type SpinnerProps = BaseComponentProps & {
  variant?: SpinnerStyle;
  color?: TextColor;
  size?: Exclude<ComponentSize, 'md'>; // Bootstrap only supports sm and lg for spinners
  label?: string; // screen reader label
  showLabel?: boolean; // render visible label instead of visually-hidden
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>;

const Spinner: React.FC<SpinnerProps> = ({
  variant = 'border',
  color,
  size,
  className,
  label = 'Loading...',
  showLabel = false,
  ...rest
}) => {
  const classes = createSpinnerClasses(variant, color, size, className);

  return (
    <div className={classes} role="status" {...rest}>
      {showLabel ? (
        <span role="status">{label}</span>
      ) : (
        <span className="visually-hidden">{label}</span>
      )}
    </div>
  );
};

export default Spinner;
