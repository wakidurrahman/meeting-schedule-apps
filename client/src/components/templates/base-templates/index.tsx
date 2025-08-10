/**
 * Base Template
 */

import Footer from '@/components/organisms/footer';
import Header from '@/components/organisms/header';
import React from 'react';

export default function BaseTemplate({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <React.Fragment>
      <Header />
      <main>{children}</main>
      <Footer />
    </React.Fragment>
  );
}
