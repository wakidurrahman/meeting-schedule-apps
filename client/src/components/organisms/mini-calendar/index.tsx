/**
 * Mini Calendar Component
 *
 * A compact monthly calendar for sidebar display:
 * - Shows one month at a time
 * - Highlights today and selected dates
 * - Click to select dates
 * - Navigable between months
 * - Compact design optimized for sidebar use
 */

import React, { useCallback, useMemo, useState } from 'react';

import Button from '@/components/atoms/button';
import Text from '@/components/atoms/text';
import { WEEKDAY_LABELS } from '@/constants/const';
import { BaseComponentProps } from '@/types/components-common';
import {
  formatCalendarDate,
  generateCalendarGrid,
  isSameDay,
  navigateMonth,
} from '@/utils/calendar';
import { buildClassNames } from '@/utils/component';
import { now } from '@/utils/date';
import './index.scss';

export interface MiniCalendarProps extends BaseComponentProps {
  /**
   * Currently selected date
   */
  selectedDate?: Date;
  /**
   * Current display date (month/year being shown)
   */
  currentDate?: Date;
  /**
   * Callback when a date is clicked
   */
  onDateClick?: (date: Date) => void;
  /**
   * Callback when the month changes
   */
  onMonthChange?: (date: Date) => void;
  /**
   * Show navigation controls
   */
  showNavigation?: boolean;
  /**
   * Compact mode (even smaller)
   */
  compact?: boolean;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({
  selectedDate,
  currentDate: propCurrentDate,
  onDateClick,
  onMonthChange,
  showNavigation = true,
  compact = false,
  className,
  ...rest
}) => {
  // Internal state for current month display
  const [internalCurrentDate, setInternalCurrentDate] = useState<Date>(
    propCurrentDate || selectedDate || now(),
  );

  // Use prop or internal state for current date
  const currentDate = propCurrentDate || internalCurrentDate;
  const today = useMemo(() => now(), []);

  // Generate calendar grid for current month
  const calendarGrid = useMemo(() => {
    return generateCalendarGrid(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Navigation handlers
  const handleNavigatePrevious = useCallback(() => {
    const newDate = navigateMonth(currentDate, 'previous');
    if (!propCurrentDate) {
      setInternalCurrentDate(newDate);
    }
    onMonthChange?.(newDate);
  }, [currentDate, propCurrentDate, onMonthChange]);

  const handleNavigateNext = useCallback(() => {
    const newDate = navigateMonth(currentDate, 'next');
    if (!propCurrentDate) {
      setInternalCurrentDate(newDate);
    }
    onMonthChange?.(newDate);
  }, [currentDate, propCurrentDate, onMonthChange]);

  // Date click handler
  const handleDateClick = useCallback(
    (date: Date) => {
      onDateClick?.(date);
    },
    [onDateClick],
  );

  // CSS classes
  const miniCalendarClasses = buildClassNames(
    'o-mini-calendar',
    compact && 'o-mini-calendar--compact',
    className,
  );

  return (
    <div className={miniCalendarClasses} {...rest}>
      {/* Header with navigation */}
      {showNavigation && (
        <div className="o-mini-calendar__header">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleNavigatePrevious}
              className="o-mini-calendar__nav-btn d-flex align-items-center justify-content-center"
              aria-label="Previous month"
            >
              <i className="bi bi-chevron-left" />
            </Button>

            <Text weight="semibold" className="o-mini-calendar__title mb-0">
              {formatCalendarDate(currentDate, 'header')}
            </Text>

            <Button
              variant="outline-primary"
              size="sm"
              onClick={handleNavigateNext}
              className="o-mini-calendar__nav-btn d-flex align-items-center justify-content-center"
              aria-label="Next month"
            >
              <i className="bi bi-chevron-right" />
            </Button>
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="o-mini-calendar__grid">
        {/* Weekday headers */}
        <div className="o-mini-calendar__weekdays">
          {WEEKDAY_LABELS.map((day) => (
            <div key={day.weekday} className="o-mini-calendar__weekday">
              <Text as="span" weight="medium" className="o-mini-calendar__weekday-text">
                {compact ? day.mini : day.extraShort}
              </Text>
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="o-mini-calendar__days">
          {calendarGrid.weeks.map((week, weekIndex) =>
            week.days.map((day, dayIndex) => {
              const isToday = isSameDay(day.date, today);
              const isSelected = selectedDate && isSameDay(day.date, selectedDate);
              const isCurrentMonth = day.isCurrentMonth;
              const hasMeetings = day.meetings.length > 0;

              const dayClasses = buildClassNames(
                'o-mini-calendar__day',
                isToday && 'o-mini-calendar__day--today',
                isSelected && 'o-mini-calendar__day--selected',
                !isCurrentMonth && 'o-mini-calendar__day--other-month',
                hasMeetings && 'o-mini-calendar__day--has-meetings',
                onDateClick && 'o-mini-calendar__day--clickable',
              );

              return (
                <button
                  key={`${weekIndex}-${dayIndex}`}
                  type="button"
                  className={dayClasses}
                  onClick={() => handleDateClick(day.date)}
                  disabled={!onDateClick}
                  aria-label={formatCalendarDate(day.date, 'long')}
                  title={formatCalendarDate(day.date, 'long')}
                >
                  <span className="o-mini-calendar__day-number">{day.dayNumber}</span>

                  {/* Meeting indicator dot */}
                  {hasMeetings && (
                    <span
                      className="o-mini-calendar__meeting-dot"
                      aria-label={`${day.meetings.length} meeting${day.meetings.length !== 1 ? 's' : ''}`}
                    />
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniCalendar;
