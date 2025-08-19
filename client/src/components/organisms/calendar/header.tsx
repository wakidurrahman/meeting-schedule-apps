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
import Heading from '@/components/atoms/heading';
import Spinner from '@/components/atoms/spinner';
import type { CalendarViewType } from '@/types/calendar';
import { BaseComponentProps } from '@/types/components-common';
import { buildClassNames } from '@/utils/component';

const DEFAULT_VIEWS: CalendarViewType[] = ['year', 'month', 'week', 'day'];

const VIEW_LABELS: Record<CalendarViewType, { full: string; short: string; icon: string }> = {
  day: { full: 'Day', short: 'D', icon: 'bi bi-calendar-day' },
  week: { full: 'Week', short: 'W', icon: 'bi bi-calendar-week' },
  month: { full: 'Month', short: 'M', icon: 'bi bi-calendar-month' },
  year: { full: 'Year', short: 'Y', icon: 'bi bi-calendar' },
};

export interface CalendarHeaderProps extends BaseComponentProps {
  title: string;
  onPrevious: () => void;
  onNext: () => void;
  onToday?: () => void;
  onCreateMeeting?: () => void;
  loading?: boolean;
  compactMode?: boolean;
  availableViews?: CalendarViewType[];
  disabled?: boolean;
  onViewChange: (view: CalendarViewType) => void;
  view: CalendarViewType;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  title,
  onPrevious,
  onNext,
  onToday,
  loading = false,
  compactMode = false,
  className,
  availableViews = DEFAULT_VIEWS,
  disabled = false,
  view,
  onViewChange,

  ...rest
}) => {
  const headerClasses = buildClassNames(
    'o-calendar-header',
    compactMode && 'o-calendar-header--compact',
    loading && 'o-calendar-header--loading',
    className,
  );

  const handleViewClick = (newView: CalendarViewType) => {
    if (!disabled && newView !== view) {
      onViewChange(newView);
    }
  };

  return (
    <div className={headerClasses} {...rest}>
      <div className="d-flex justify-content-between align-items-center gap-1">
        {/* Left section - Navigation */}
        <div className="d-flex align-items-center">
          <div className="btn-group shadow" role="group" aria-label="Calendar navigation">
            {/* Previous button */}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onPrevious}
              disabled={loading || disabled}
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
                disabled={loading || disabled}
                className="o-calendar-header__today-btn"
              >
                Today
              </Button>
            )}

            {/* Next button */}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={onNext}
              disabled={loading || disabled}
              aria-label="Next period"
              title="Next"
            >
              <i className="bi bi-chevron-right" aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Center section - Title */}
        <Heading level={2} color="primary" className="text-center mb-0">
          {title}
        </Heading>

        {/* Right section - Actions */}
        <div className="dropdown">
          <button
            className="btn btn-outline-primary dropdown-toggle btn-sm shadow"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {VIEW_LABELS[view].full}
          </button>
          <ul className="dropdown-menu">
            {availableViews.map((viewType) => {
              const isActive = view === viewType;
              const viewConfig = VIEW_LABELS[viewType];

              return (
                <li key={viewType}>
                  <button
                    className={buildClassNames('dropdown-item', isActive && 'active')}
                    onClick={() => handleViewClick(viewType)}
                    disabled={disabled}
                    aria-pressed={isActive}
                    aria-label={`Switch to ${viewConfig.full} view`}
                  >
                    {compactMode ? (
                      <>
                        <i className={`${viewConfig.icon} me-1`} aria-hidden="true" />
                        {viewConfig.short}
                      </>
                    ) : (
                      <span className="d-flex align-items-center gap-1">
                        <i className={`${viewConfig.icon} me-1`} aria-hidden="true" />
                        {viewConfig.full}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Loading indicator */}
        {loading && <Spinner variant="grow" color="primary" size="lg" />}
      </div>
    </div>
  );
};

export default CalendarHeader;
