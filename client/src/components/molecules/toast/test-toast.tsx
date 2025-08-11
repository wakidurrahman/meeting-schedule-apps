import React from 'react';

import { ToastContainer } from './toast-container';

import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import Text from '@/components/atoms/text';
import { useToast } from '@/hooks/use-toast';

export const TestToast = () => {
  const { toasts, addToast, removeToast } = useToast();

  const showTestToast = () => {
    addToast({
      variant: 'success',
      title: 'Test Toast',
      subtitle: 'just now',
      children: 'This is a test toast to verify functionality.',
      autohide: true,
      delay: 5000,
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Heading level={5}>Toast Test</Heading>
      <Button onClick={showTestToast}>Show Test Toast</Button>
      <Text>Active toasts: {toasts.length}</Text>

      <ToastContainer position="top-end" toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default TestToast;
