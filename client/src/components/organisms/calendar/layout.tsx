/**
 * Calendar Layout Component
 * TODO : Remove this component and use the Calendar component instead
 * Higher-order component that wraps the Calendar organism
 * with proper styling and responsive layout
 */

import React from 'react';

import Calendar, { type CalendarProps } from './index';

import { buildClassNames } from '@/utils/component';
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
  const layoutClasses = buildClassNames(
    'o-calendar-layout',
    fullHeight && 'o-calendar-layout--full-height',
    bordered && 'o-calendar-layout--bordered',
    className,
  );

  return (
    <div className={layoutClasses}>
      <Calendar className="o-calendar-layout__calendar" {...calendarProps} />
    </div>
  );
};

export default CalendarLayout;
