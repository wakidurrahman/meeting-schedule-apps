import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Toast component based on Bootstrap 5.3 Toasts documentation
 * @param {Object} props - The props for the toast component
 * @param {string} props.variant - The color variant of the toast
 * @param {boolean} props.show - Whether the toast is visible
 * @param {boolean} props.autohide - Whether to auto-hide the toast
 * @param {number} props.delay - Delay in milliseconds before hiding
 * @param {string} props.title - Toast title
 * @param {string} props.subtitle - Toast subtitle (timestamp)
 * @param {React.ReactNode} props.children - Toast body content
 * @param {Function} props.onClose - Close handler
 * @param {string} props.className - Additional CSS classes
 * @returns {React.ReactNode} The toast component
 */

export interface ToastProps {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  show?: boolean;
  autohide?: boolean;
  delay?: number;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  headerIcon?: React.ReactNode;
}

export const Toast = ({
  variant,
  show = true,
  autohide = true,
  delay = 5000,
  title,
  subtitle,
  children,
  onClose,
  className = '',
  headerIcon,
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(show);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  // Handle auto-hide
  useEffect(() => {
    if (isVisible && autohide && delay > 0) {
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, autohide, delay, handleClose]);

  // Handle show prop changes
  useEffect(() => {
    setIsVisible(show);
  }, [show]);

  if (!isVisible) {
    return null;
  }

  const variantClass = variant ? `text-bg-${variant}` : '';

  const toastClasses = ['toast', 'show', variantClass, className].filter(Boolean).join(' ');

  return (
    <div className={toastClasses} role="alert" aria-live="assertive" aria-atomic="true">
      {(title || subtitle || headerIcon) && (
        <div className="toast-header">
          {headerIcon && <span className="rounded me-2">{headerIcon}</span>}
          {title && <strong className="me-auto">{title}</strong>}
          {subtitle && <small className="text-body-secondary">{subtitle}</small>}
          <button type="button" className="btn-close" onClick={handleClose} aria-label="Close" />
        </div>
      )}
      <div className="toast-body">{children}</div>
    </div>
  );
};

export default Toast;
