/**
 * Calendar Navigation Component
 * TODO : Remove this component and use the header component instead
 * Provides view type switching controls:
 * - Day view button
 * - Week view button
 * - Month view button
 * - Year view button
 */

import React from 'react';

import Button from '@/components/atoms/button';
import type { CalendarViewType } from '@/types/calendar';
import { BaseComponentProps } from '@/types/components-common';
import { buildClassNames } from '@/utils/component';

export interface CalendarNavigationProps extends BaseComponentProps {
  view: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
  availableViews?: CalendarViewType[];
  compactMode?: boolean;
  disabled?: boolean;
}

const DEFAULT_VIEWS: CalendarViewType[] = ['year', 'month', 'week', 'day'];

const VIEW_LABELS: Record<CalendarViewType, { full: string; short: string; icon: string }> = {
  day: { full: 'Day', short: 'D', icon: 'bi-calendar-day' },
  week: { full: 'Week', short: 'W', icon: 'bi-calendar-week' },
  month: { full: 'Month', short: 'M', icon: 'bi-calendar-month' },
  year: { full: 'Year', short: 'Y', icon: 'bi-calendar' },
};

const CalendarNavigation: React.FC<CalendarNavigationProps> = ({
  view,
  onViewChange,
  availableViews = DEFAULT_VIEWS,
  compactMode = false,
  disabled = false,
  className,
  ...rest
}) => {
  const navigationClasses = buildClassNames(
    'o-calendar-navigation',
    compactMode && 'o-calendar-navigation--compact',
    disabled && 'o-calendar-navigation--disabled',
    className,
  );

  const handleViewClick = (newView: CalendarViewType) => {
    if (!disabled && newView !== view) {
      onViewChange(newView);
    }
  };

  return (
    <div className={navigationClasses} {...rest}>
      <div className="o-calendar-navigation__content">
        <div className="btn-group" role="group" aria-label="Calendar view options">
          {availableViews.map((viewType) => {
            const isActive = view === viewType;
            const viewConfig = VIEW_LABELS[viewType];

            return (
              <Button
                key={viewType}
                variant={isActive ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => handleViewClick(viewType)}
                disabled={disabled}
                aria-pressed={isActive}
                aria-label={`Switch to ${viewConfig.full} view`}
                className={buildClassNames(
                  'o-calendar-navigation__view-btn',
                  `o-calendar-navigation__view-btn--${viewType}`,
                  isActive && 'active',
                )}
              >
                {compactMode ? (
                  <>
                    <i className={`${viewConfig.icon} me-1`} aria-hidden="true" />
                    {viewConfig.short}
                  </>
                ) : (
                  viewConfig.full
                )}
              </Button>
            );
          })}
        </div>

        {/* View description for accessibility */}
        <span className="visually-hidden" aria-live="polite">
          Current view: {VIEW_LABELS[view].full}
        </span>
      </div>
    </div>
  );
};

CalendarNavigation.displayName = 'CalendarNavigation';

export default CalendarNavigation;
