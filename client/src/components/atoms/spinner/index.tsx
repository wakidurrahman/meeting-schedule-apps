import React from 'react';

type SpinnerStyle = 'border' | 'grow';
type SpinnerColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

type SpinnerSize = 'sm'; // Bootstrap exposes only `-sm` size utility

export type SpinnerProps = {
  variant?: SpinnerStyle;
  color?: SpinnerColor;
  size?: SpinnerSize;
  className?: string;
  label?: string; // screen reader label
  showLabel?: boolean; // render visible label instead of visually-hidden
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'className'>;

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      variant = 'border',
      color,
      size,
      className,
      label = 'Loading...',
      showLabel = false,
      ...rest
    },
    ref
  ) => {
    const base = variant === 'grow' ? 'spinner-grow' : 'spinner-border';
    const classes = [
      base,
      size ? `${base}-${size}` : undefined,
      color ? `text-${color}` : undefined,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={classes} role="status" {...rest}>
        {showLabel ? (
          <span role="status">{label}</span>
        ) : (
          <span className="visually-hidden">{label}</span>
        )}
      </div>
    );
  }
);

export default Spinner;
