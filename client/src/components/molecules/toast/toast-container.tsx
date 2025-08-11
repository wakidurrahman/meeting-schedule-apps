import React from 'react';

import { Toast, type ToastProps } from './toast';

/**
 * ToastContainer component for stacking multiple toasts
 * @param {Object} props - The props for the toast container
 * @param {string} props.position - The position of the toast container
 * @param {ToastData[]} props.toasts - Array of toast data
 * @param {Function} props.onRemove - Function to remove a toast
 * @param {string} props.className - Additional CSS classes
 */

export interface ToastData extends Omit<ToastProps, 'onClose'> {
  id: string;
}

export interface ToastContainerProps {
  position?:
    | 'top-start'
    | 'top-center'
    | 'top-end'
    | 'middle-start'
    | 'middle-center'
    | 'middle-end'
    | 'bottom-start'
    | 'bottom-center'
    | 'bottom-end';
  toasts: ToastData[];
  onRemove: (id: string) => void;
  className?: string;
}

export const ToastContainer = ({
  position = 'top-end',
  toasts,
  onRemove,
  className = '',
}: ToastContainerProps) => {
  const positionClasses = {
    'top-start': 'position-fixed top-0 start-0',
    'top-center': 'position-fixed top-0 start-50 translate-middle-x',
    'top-end': 'position-fixed top-0 end-0',
    'middle-start': 'position-fixed top-50 start-0 translate-middle-y',
    'middle-center': 'position-fixed top-50 start-50 translate-middle',
    'middle-end': 'position-fixed top-50 end-0 translate-middle-y',
    'bottom-start': 'position-fixed bottom-0 start-0',
    'bottom-center': 'position-fixed bottom-0 start-50 translate-middle-x',
    'bottom-end': 'position-fixed bottom-0 end-0',
  };

  const containerClasses = ['toast-container', positionClasses[position], 'p-3', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} style={{ zIndex: 1055 }}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
};

export default ToastContainer;
