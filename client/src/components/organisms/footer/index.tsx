/**
 * Footer component
 */

import Text from '@/components/atoms/text';
import React from 'react';

export default function Footer(): JSX.Element {
  return (
    <footer className=" bg-light py-3">
      <Text className="container text-muted text-center mb-0">
        &copy; {new Date().getFullYear()}, X-Scheduler Apps | All rights reserved.
      </Text>
    </footer>
  );
}
