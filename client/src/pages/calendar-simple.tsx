/**
 * Simple Calendar Page - For testing router issues
 */

import React from 'react';

const SimpleCalendarPage: React.FC = () => {
  return (
    <div className="container py-4">
      <h1>Simple Calendar Test</h1>
      <p>This is a simplified calendar page to test if the basic routing works.</p>
      <div className="alert alert-info">
        If you can see this page, the routing is working properly.
      </div>
    </div>
  );
};

export default SimpleCalendarPage;
