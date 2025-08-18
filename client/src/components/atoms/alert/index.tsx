import React from 'react';

import { AlertVariant, VariantComponentProps } from '@/types/components-common';
import { createAlertClasses } from '@/utils/components-helper';

export type AlertProps = VariantComponentProps<AlertVariant> & {
  dismissible?: boolean;
  onClose?: () => void;
};

const Alert: React.FC<AlertProps> = ({
  variant = 'primary',
  dismissible,
  onClose,
  className,
  children,
}) => {
  const classes = createAlertClasses(variant, dismissible, className);

  return (
    <div className={classes} role="alert">
      {children}
      {dismissible && (
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
      )}
    </div>
  );
};

export default Alert;
