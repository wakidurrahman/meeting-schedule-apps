import React from 'react';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

export interface BadgeProps {
  variant?: BadgeVariant;
  pill?: boolean;
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'secondary',
  pill = false,
  children,
  className = '',
}) => {
  const baseClasses = 'badge';
  const variantClass = `text-bg-${variant}`;
  const pillClass = pill ? 'rounded-pill' : '';

  const classes = [baseClasses, variantClass, pillClass, className].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
};

export default Badge;
