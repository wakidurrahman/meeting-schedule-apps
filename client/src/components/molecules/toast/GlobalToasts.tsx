import React from 'react';

import { ToastContainer } from './toast-container';

import { useToast } from '@/hooks/use-toast';

export default function GlobalToasts(): JSX.Element {
  const { toasts, removeToast } = useToast();
  return <ToastContainer position="top-end" toasts={toasts} onRemove={removeToast} />;
}
