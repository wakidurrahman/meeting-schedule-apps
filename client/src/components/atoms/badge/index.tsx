import React from 'react';

import { BadgeVariant, VariantComponentProps } from '@/types/components-common';
import { createBadgeClasses } from '@/utils/components-helper';

export interface BadgeProps extends VariantComponentProps<BadgeVariant> {
  pill?: boolean;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'secondary',
  pill = false,
  children,
  className,
}) => {
  const classes = createBadgeClasses(variant, pill, className);

  return <span className={classes}>{children}</span>;
};

export default Badge;
