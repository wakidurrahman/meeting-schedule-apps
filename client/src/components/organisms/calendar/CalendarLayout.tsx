/**
 * Calendar Layout Component
 *
 * Higher-order component that wraps the Calendar organism
 * with proper styling and responsive layout
 */

import React from 'react';

import Calendar, { type CalendarProps } from './index';
import './index.scss';

export interface CalendarLayoutProps extends CalendarProps {
  fullHeight?: boolean;
  bordered?: boolean;
}

const CalendarLayout: React.FC<CalendarLayoutProps> = ({
  fullHeight = false,
  bordered = true,
  className,
  ...calendarProps
}) => {
  const layoutClasses = [
    'calendar-layout',
    fullHeight && 'calendar-layout--full-height',
    bordered && 'calendar-layout--bordered',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={layoutClasses}>
      <Calendar className="calendar-layout__calendar" {...calendarProps} />
    </div>
  );
};

export default CalendarLayout;
