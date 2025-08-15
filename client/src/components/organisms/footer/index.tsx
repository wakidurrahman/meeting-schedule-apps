/**
 * Footer component
 */

import React from 'react';

export default function Footer(): JSX.Element {
  return (
    <footer className=" bg-light py-3">
      <p className="container text-muted text-center mb-0">
        &copy; {new Date().getFullYear()} Meeting Scheduler
      </p>
    </footer>
  );
}
