import React from 'react';

type AlertVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

export type AlertProps = {
  variant?: AlertVariant;
  dismissible?: boolean;
  onClose?: () => void;
  className?: string;
  children?: React.ReactNode;
};

export default function Alert({
  variant = 'primary',
  dismissible,
  onClose,
  className,
  children,
}: AlertProps) {
  const classes = [
    'alert',
    `alert-${variant}`,
    dismissible ? 'alert-dismissible' : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="alert">
      {children}
      {dismissible && (
        <button
          type="button"
          className="btn-close"
          aria-label="Close"
          onClick={onClose}
        />
      )}
    </div>
  );
}
