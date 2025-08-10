/**
 * Base Template
 */

import React from 'react';

import Footer from '@/components/organisms/footer';
import Header from '@/components/organisms/header';

export default function BaseTemplate({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <React.Fragment>
      <Header />
      <main>{children}</main>
      <Footer />
    </React.Fragment>
  );
}
