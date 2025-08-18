import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import type { ToastData } from '@/components/molecules/toast/toast-container';
import { ErrorMessages } from '@/constants/messages';

export interface ToastContextValue {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  addSuccess: (toast: Omit<ToastData, 'id' | 'variant'>) => void;
  addError: (toast: Omit<ToastData, 'id' | 'variant'>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    const newToast: ToastData = { ...toast, id, show: true };
    setToasts((prev) => [...prev, newToast]);
  }, []);

  const addSuccess = useCallback(
    (toast: Omit<ToastData, 'id' | 'variant'>) => addToast({ ...toast, variant: 'success' }),
    [addToast],
  );

  const addError = useCallback(
    (toast: Omit<ToastData, 'id' | 'variant'>) => addToast({ ...toast, variant: 'danger' }),
    [addToast],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => setToasts([]), []);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, addToast, removeToast, clearToasts, addSuccess, addError }),
    [toasts, addToast, removeToast, clearToasts, addSuccess, addError],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToastContext(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error(ErrorMessages.useToastProvider);
  return ctx;
}
