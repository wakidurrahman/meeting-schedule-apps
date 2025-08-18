/**
 * Calendar Header Component
 *
 * Provides navigation controls and calendar title:
 * - Previous/Next navigation buttons
 * - Today button to jump to current date
 * - Calendar title (e.g., "January 2025")
 * - Optional create meeting button
 */

import React from 'react';

import Button from '@/components/atoms/button';
import { BaseComponentProps } from '@/types/components-common';
import { buildClassNames } from '@/utils/component';

export interface CalendarHeaderProps extends BaseComponentProps {
  title: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday?: () => void;
  onCreateMeeting?: () => void;
  loading?: boolean;
  showCreateButton?: boolean;
  compactMode?: boolean;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  title,
  onPrevious,
  onNext,
  onToday,
  onCreateMeeting,
  loading = false,
  showCreateButton = true,
  compactMode = false,
  className,
  ...rest
}) => {
  const headerClasses = buildClassNames(
    'calendar-header',
    compactMode && 'calendar-header--compact',
    loading && 'calendar-header--loading',
    className,
  );

  return (
    <div className={headerClasses} {...rest}>
      <div className="calendar-header__content">
        {/* Left section - Navigation */}
        <div className="calendar-header__navigation">
          <div className="btn-group" role="group" aria-label="Calendar navigation">
            {/* Previous button */}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onPrevious}
              disabled={loading}
              aria-label="Previous period"
              title="Previous"
            >
              <i className="bi bi-chevron-left" aria-hidden="true" />
            </Button>

            {/* Today button */}
            {onToday && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={onToday}
                disabled={loading}
                className="calendar-header__today-btn"
              >
                Today
              </Button>
            )}

            {/* Next button */}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onNext}
              disabled={loading}
              aria-label="Next period"
              title="Next"
            >
              <i className="bi bi-chevron-right" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Center section - Title */}
        <div className="calendar-header__title">
          <h2 className="h4 mb-0 text-primary fw-semibold">{title}</h2>
        </div>

        {/* Right section - Actions */}
        <div className="calendar-header__actions">
          {showCreateButton && onCreateMeeting && (
            <Button
              variant="primary"
              size="sm"
              onClick={onCreateMeeting}
              disabled={loading}
              className="calendar-header__create-btn"
            >
              <i className="bi bi-plus-lg me-1" aria-hidden="true" />
              {compactMode ? 'Create' : 'Create Meeting'}
            </Button>
          )}
        </div>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="calendar-header__loading">
          <div className="progress" style={{ height: '2px' }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated"
              role="progressbar"
              aria-label="Loading"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

CalendarHeader.displayName = 'CalendarHeader';

export default CalendarHeader;
