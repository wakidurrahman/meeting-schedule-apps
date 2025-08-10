/**
 * Footer component
 */

import React from 'react';

export default function Footer(): JSX.Element {
  return (
    <footer className="container py-4 bg-light py-3">
      <p className="text-center">
        &copy; {new Date().getFullYear()} Meeting Scheduler
      </p>
    </footer>
  );
}
