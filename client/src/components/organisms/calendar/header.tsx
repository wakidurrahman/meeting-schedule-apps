/**
 * Calendar Header Component
 *
 * Provides navigation controls and calendar title:
 * - Previous/Next navigation buttons
 * - Today button to jump to current date
 * - Calendar title (e.g., "January 2025")
 * - Add Event and Add Task buttons
 */

import React from 'react';

import Button from '@/components/atoms/button';
import Text from '@/components/atoms/text';
import { CALENDAR_VIEW_LABELS } from '@/constants/const';
import type { CalendarTitleData, CalendarViewType } from '@/types/calendar';
import { BaseComponentProps } from '@/types/components-common';
import { buildClassNames } from '@/utils/component';

const DEFAULT_VIEWS: CalendarViewType[] = ['year', 'month', 'week', 'day'];

/**
 * Renders structured calendar title with enhanced layout for month view
 * @param titleData - Structured title data
 * @returns JSX element with structured title layout
 */
const StructuredTitle: React.FC<CalendarTitleData> = ({
  monthAbbr,
  dayNumber,
  mainTitle,
  subtitle,
  metadata,
}) => {
  // Enhanced layout for month view (matching expected design)
  if (metadata?.viewType === 'month' && monthAbbr && dayNumber) {
    return (
      <div className="d-flex align-items-center gap-3">
        {/* Month abbreviation and day number card */}
        <div className="bg-light rounded p-0 border" style={{ minWidth: '80px' }}>
          <Text color="muted" className="text-center mb-0 " weight="medium">
            {monthAbbr}
          </Text>
          <Text color="primary" className="text-center mb-0 bg-white rounded" weight="semibold">
            {dayNumber}
          </Text>
        </div>

        {/* Main title and subtitle */}
        <div className="flex-grow-1">
          <Text color="primary" className="h4 mb-0" weight="semibold">
            {mainTitle}
          </Text>
          {subtitle && (
            <Text color="muted" className="text-muted small mb-0">
              {subtitle}
            </Text>
          )}
        </div>
      </div>
    );
  }

  // Standard layout for other views
  return (
    <>
      <Text color="primary" className="h5 mb-0" weight="semibold">
        {mainTitle}
      </Text>
      {subtitle && (
        <Text color="muted" className="text-muted small mb-0">
          {subtitle}
        </Text>
      )}
    </>
  );
};

export interface CalendarHeaderProps extends BaseComponentProps {
  title: CalendarTitleData;
  view: CalendarViewType;
  availableViews?: CalendarViewType[];
  compactMode?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onViewChange: (view: CalendarViewType) => void;
  onNext: () => void;
  onPrevious: () => void;
  onToday?: () => void;
  onCreateMeeting?: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  title,
  loading = false,
  compactMode = false,
  className,
  availableViews = DEFAULT_VIEWS,
  disabled = false,
  view,
  onViewChange,
  onNext,
  onPrevious,
  onToday,
  onCreateMeeting,
  ...rest
}) => {
  // Manage classes
  const headerClasses = buildClassNames(
    'o-calendar-header',
    compactMode && 'o-calendar-header--compact',
    loading && 'o-calendar-header--loading',
    className,
  );

  /**
   * Event handlers
   *
   * HandleViewClick: Handles view change
   */

  // Handle view change
  const handleViewClick = (newView: CalendarViewType) => {
    if (!disabled && newView !== view) {
      onViewChange(newView);
    }
  };

  return (
    <div className={headerClasses} {...rest}>
      <div className="d-flex flex-column flex-lg-row  gap-3">
        {/* Center section - Title */}
        <div className="flex-grow-1">
          <StructuredTitle {...title} />
        </div>

        {/* Right section - Actions */}
        <div className="d-flex align-items-center gap-2">
          <div className="btn-group" role="group" aria-label="Calendar navigation">
            {/* Previous button */}
            <Button
              variant="outline-primary"
              size="sm"
              onClick={onPrevious}
              disabled={loading || disabled}
              aria-label="Previous period"
              title="Previous"
            >
              <i className="bi bi-arrow-left" aria-hidden="true" />
            </Button>

            {/* Today button */}
            {onToday && (
              <Button
                variant="outline-primary"
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
              variant="outline-primary"
              size="sm"
              onClick={onNext}
              disabled={loading || disabled}
              aria-label="Next period"
              title="Next"
            >
              <i className="bi bi-arrow-right" aria-hidden="true" />
            </Button>
          </div>
          <div className="dropdown">
            <button
              className="btn btn-outline-primary dropdown-toggle btn-sm"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              {CALENDAR_VIEW_LABELS[view].full} View
            </button>
            <ul className="dropdown-menu">
              {availableViews.map((viewType) => {
                const isActive = view === viewType;
                const viewConfig = CALENDAR_VIEW_LABELS[viewType];

                return (
                  <li key={viewType}>
                    <button
                      className={buildClassNames('dropdown-item', isActive && 'active')}
                      onClick={() => handleViewClick(viewType)}
                      disabled={disabled}
                      aria-pressed={isActive}
                      aria-label={`Switch to ${viewConfig.full}`}
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
          <Button variant="primary" size="sm" onClick={onCreateMeeting}>
            <i className="bi bi-plus-lg me-1" />
            Add Event
          </Button>
          {/* todo: add task button */}
          <Button variant="primary" size="sm" onClick={onCreateMeeting}>
            <i className="bi bi-plus-lg me-1" />
            Add Task
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
