/**
 * Calendar Grid Component
 *
 * Displays the main calendar grid with:
 * - Monthly grid layout (6 weeks x 7 days)
 * - Meeting events within each day
 * - Day numbers and states (today, selected, other month)
 * - Click handlers for dates and meetings
 * - Responsive layout
 */

import React from 'react';

import CalendarEvent from './event';

import Spinner from '@/components/atoms/spinner';
import Text from '@/components/atoms/text';
import type { CalendarGridType, CalendarViewType } from '@/types/calendar';
import { BaseComponentProps } from '@/types/components-common';
import type { MeetingEvent } from '@/types/meeting';
import { formatCalendarDate, isSameDay } from '@/utils/calendar';
import { buildClassNames } from '@/utils/component';

export interface CalendarGridProps extends BaseComponentProps {
  calendarGrid: CalendarGridType;
  view: CalendarViewType;
  selectedDate?: Date | null;
  hoveredDate?: Date | null;
  showWeekends?: boolean;
  loading?: boolean;
  compactMode?: boolean;

  // Event handlers
  onDateClick?: (date: Date) => void;
  onDateDoubleClick?: (date: Date) => void;
  onMeetingClick?: (meeting: MeetingEvent, event: React.MouseEvent) => void;
  onDateHover?: (date: Date | null) => void;
}

const WEEKDAY_LABELS = [
  { full: 'Sunday', short: 'Sun', mini: 'S' },
  { full: 'Monday', short: 'Mon', mini: 'M' },
  { full: 'Tuesday', short: 'Tue', mini: 'T' },
  { full: 'Wednesday', short: 'Wed', mini: 'W' },
  { full: 'Thursday', short: 'Thu', mini: 'T' },
  { full: 'Friday', short: 'Fri', mini: 'F' },
  { full: 'Saturday', short: 'Sat', mini: 'S' },
];

// Calendar Grid Component

const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarGrid,
  view,
  selectedDate,
  hoveredDate,
  showWeekends = true,
  loading = false,
  compactMode = false,
  onDateClick,
  onDateDoubleClick,
  onMeetingClick,
  onDateHover,
  className,
  ...rest
}) => {
  const gridClasses = buildClassNames(
    'o-calendar-grid',
    `o-calendar-grid--${view}`,
    compactMode && 'o-calendar-grid--compact',
    loading && 'o-calendar-grid--loading',
    !showWeekends && 'o-calendar-grid--no-weekends',
    className,
  );

  const weekDay = (index: number) => {
    return index === 0 || index === 6;
  };

  const handleDateClick = (date: Date) => {
    onDateClick?.(date);
  };

  const handleDateDoubleClick = (date: Date) => {
    onDateDoubleClick?.(date);
  };

  const handleDateMouseEnter = (date: Date) => {
    onDateHover?.(date);
  };

  const handleDateMouseLeave = () => {
    onDateHover?.(null);
  };

  return (
    <div className={gridClasses} {...rest}>
      {/* Weekday Headers */}
      <div className="o-calendar-grid__header">
        {WEEKDAY_LABELS.map((weekday, index) => {
          if (!showWeekends && weekDay(index)) {
            return null;
          }

          return (
            <div
              key={index}
              className={buildClassNames(
                'o-calendar-grid__header-cell',
                weekDay(index) && 'o-calendar-grid__header-cell--weekend',
              )}
            >
              <span className="d-none d-md-inline">{weekday.short}</span>
              <span className="d-md-none">{weekday.mini}</span>
            </div>
          );
        })}
      </div>

      {/* Calendar Body */}
      <div className="o-calendar-grid__body">
        {calendarGrid.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="o-calendar-grid__week">
            {week.days.map((day, dayIndex) => {
              if (!showWeekends && weekDay(dayIndex)) {
                return null;
              }

              const isToday = day.isToday;
              const isSelected = selectedDate && isSameDay(day.date, selectedDate);
              const isHovered = hoveredDate && isSameDay(day.date, hoveredDate);
              const isWeekend = weekDay(dayIndex);
              const isOtherMonth = !day.isCurrentMonth;

              const dayClasses = buildClassNames(
                'o-calendar-grid__day',
                isToday && 'o-calendar-grid__day--today',
                isSelected && 'o-calendar-grid__day--selected',
                isHovered && 'o-calendar-grid__day--hovered',
                isWeekend && 'o-calendar-grid__day--weekend',
                isOtherMonth && 'o-calendar-grid__day--other-month',
                day.meetings.length > 0 && 'o-calendar-grid__day--has-meetings',
                onDateClick && 'o-calendar-grid__day--clickable',
              );

              return (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={dayClasses}
                  onClick={() => handleDateClick(day.date)}
                  onDoubleClick={() => handleDateDoubleClick(day.date)}
                  onMouseEnter={() => handleDateMouseEnter(day.date)}
                  onMouseLeave={handleDateMouseLeave}
                  role={onDateClick ? 'button' : undefined}
                  tabIndex={onDateClick ? 0 : undefined}
                  onKeyDown={
                    onDateClick
                      ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleDateClick(day.date);
                          }
                        }
                      : undefined
                  }
                  aria-label={formatCalendarDate(day.date, 'long')}
                  data-date={day.date.toISOString()}
                >
                  {/* Day Header */}
                  <div className="o-calendar-grid__day-header">
                    <span className="o-calendar-grid__day-number">{day.dayNumber}</span>

                    {/* Today indicator */}
                    {isToday && (
                      <span className="o-calendar-grid__today-indicator" aria-label="Today" />
                    )}

                    {/* Meeting count indicator */}
                    {day.meetings.length > 0 && (
                      <span className="o-calendar-grid__meeting-count">{day.meetings.length}</span>
                    )}
                  </div>

                  {/* Day Content - Meetings */}
                  <div className="o-calendar-grid__day-content">
                    {day.meetings.slice(0, compactMode ? 2 : 3).map((meeting) => (
                      <CalendarEvent
                        key={meeting.id}
                        meeting={meeting}
                        onClick={onMeetingClick}
                        compactMode={compactMode}
                        showTime={!compactMode}
                        showAttendees={false}
                        maxTitleLength={compactMode ? 15 : 25}
                        className="o-calendar-grid__meeting"
                      />
                    ))}

                    {/* Overflow indicator */}
                    {day.meetings.length > (compactMode ? 2 : 3) && (
                      <div className="o-calendar-grid__more-meetings">
                        <small className="text-danger d-flex align-items-center gap-1 justify-content-center">
                          <i className="bi bi-plus-lg" aria-hidden="true" />
                          {day.meetings.length - (compactMode ? 2 : 3)} more
                        </small>
                      </div>
                    )}
                  </div>

                  {/* Loading overlay for this day */}
                  {loading && <Spinner variant="grow" color="primary" size="sm" />}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Empty state */}
      {calendarGrid.weeks.every((week) => week.days.every((day) => day.meetings.length === 0)) &&
        !loading && (
          <div className="o-calendar-grid__empty">
            <div className="text-center text-muted p-5">
              <i className="bi bi-calendar-x fs-1 mb-3 d-block" aria-hidden="true" />
              <Text className="mb-0">No meetings scheduled</Text>
              <small>Double-click a date to create a meeting</small>
            </div>
          </div>
        )}

      {/* Grid loading overlay */}
      {loading && (
        <div className="o-calendar-grid__loading-overlay">
          <Spinner variant="grow" color="primary" size="lg" />
        </div>
      )}
    </div>
  );
};

export default CalendarGrid;
