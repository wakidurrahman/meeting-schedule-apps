/**
 * Base Template
 */

import React from 'react';

import Footer from '@/components/organisms/footer';
import Header from '@/components/organisms/header';

import './index.scss';

export default function BaseTemplate({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="t-base-template">
      <Header />
      <main className="t-base-template__main py-4">{children}</main>
      <Footer />
    </div>
  );
}
