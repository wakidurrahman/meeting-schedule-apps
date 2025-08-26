/**
 * Calendar Grid Component
 *
 * Displays the main calendar grid with:
 * - Monthly grid layout (5 weeks x 7 days) = 35 days
 * - Meeting events within each day
 * - Day numbers and states (today, selected, other month)
 * - Click handlers for dates and meetings
 * - Responsive layout
 */

import React, { useCallback } from 'react';

import CalendarEvent from './event';

import Spinner from '@/components/atoms/spinner';
import Text from '@/components/atoms/text';
import { WEEKDAY_LABELS } from '@/constants/const';
import type {
  CalendarGridType,
  CalendarViewType,
  DayGridType,
  WeekGridType,
} from '@/types/calendar';
import { BaseComponentProps } from '@/types/components-common';
import type { MeetingEvent } from '@/types/meeting';
import { formatCalendarDate, isSameDay } from '@/utils/calendar';
import { buildClassNames } from '@/utils/component';

export interface CalendarGridProps extends BaseComponentProps {
  calendarGrid: CalendarGridType | WeekGridType | DayGridType;
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

// Type guards
const isMonthGrid = (
  grid: CalendarGridType | WeekGridType | DayGridType,
): grid is CalendarGridType => {
  return 'weeks' in grid;
};

const isWeekGrid = (grid: CalendarGridType | WeekGridType | DayGridType): grid is WeekGridType => {
  return 'days' in grid && 'timeSlots' in grid && Array.isArray((grid as WeekGridType).days);
};

const isDayGrid = (grid: CalendarGridType | WeekGridType | DayGridType): grid is DayGridType => {
  return 'date' in grid && 'timeSlots' in grid && !('days' in grid);
};

// Calendar Grid Component

const CalendarGrid: React.FC<CalendarGridProps> = ({
  calendarGrid,
  view,
  selectedDate,
  hoveredDate,
  showWeekends = false,
  loading = false,
  compactMode = false,
  className,
  onDateClick,
  onDateDoubleClick,
  onMeetingClick,
  onDateHover,
  ...rest
}) => {
  // 1. CSS classes
  const gridClasses = buildClassNames(
    'o-calendar-grid',
    `o-calendar-grid--${view}`,
    compactMode && 'o-calendar-grid--compact',
    loading && 'o-calendar-grid--loading',
    !showWeekends && 'o-calendar-grid--no-weekends',
    className,
  );

  // 2. Weekday helper function
  const weekDay = (index: number) => {
    // In Monday-first week: Saturday is index 5, Sunday is index 6
    return index === 5 || index === 6;
  };

  // 3. Date click handler
  const handleDateClick = useCallback(
    (date: Date) => {
      onDateClick?.(date);
    },
    [onDateClick],
  );

  // 4. Date double click handler
  const handleDateDoubleClick = useCallback(
    (date: Date) => {
      onDateDoubleClick?.(date);
    },
    [onDateDoubleClick],
  );

  // 5. Date mouse enter handler
  const handleDateMouseEnter = useCallback(
    (date: Date) => {
      onDateHover?.(date);
    },
    [onDateHover],
  );

  // 6. Date mouse leave handler
  const handleDateMouseLeave = useCallback(() => {
    onDateHover?.(null);
  }, [onDateHover]);

  // Render different layouts based on view type
  if (isMonthGrid(calendarGrid)) {
    return renderMonthView(calendarGrid);
  } else if (isWeekGrid(calendarGrid)) {
    return renderWeekView(calendarGrid);
  } else if (isDayGrid(calendarGrid)) {
    return renderDayView(calendarGrid);
  }

  return <div>Unsupported view type</div>;

  // Month view renderer
  function renderMonthView(grid: CalendarGridType) {
    return (
      <div className={gridClasses} {...rest}>
        {/* Weekday Headers */}
        <div className="o-calendar-grid__header">
          {WEEKDAY_LABELS.map((day) => {
            // Skip weekends if not shown
            if (!showWeekends && (day.weekday === 5 || day.weekday === 6)) {
              return null;
            }

            return (
              <div
                key={day.weekday}
                className={buildClassNames(
                  'o-calendar-grid__header-cell',
                  (day.weekday === 5 || day.weekday === 6) &&
                    'o-calendar-grid__header-cell--weekend',
                  'text-center',
                )}
              >
                <Text as="span" weight="medium" className="d-none d-md-inline">
                  {day.short}
                </Text>
                <Text as="span" weight="medium" className=" d-md-none">
                  {day.mini}
                </Text>
              </div>
            );
          })}
        </div>

        {/* Calendar Body */}
        <div className="o-calendar-grid__body">
          {grid.weeks.map((week, weekIndex) => (
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
                        <span className="o-calendar-grid__meeting-count">
                          {day.meetings.length}
                        </span>
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
                          showAttendees={true}
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
        {grid.weeks.every((week) => week.days.every((day) => day.meetings.length === 0)) &&
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
  }

  // Week view renderer
  function renderWeekView(grid: WeekGridType) {
    return (
      <div className={gridClasses} {...rest}>
        {/* Week Header - Days */}
        <div className="o-calendar-grid__header o-calendar-grid__header--week">
          {/* Time column header */}
          <div className="o-calendar-grid__time-header">
            <Text as="small" weight="medium" color="muted">
              Time
            </Text>
          </div>

          {/* Day headers */}
          {grid.days.map((day) => {
            if (!showWeekends && (day.date.getDay() === 0 || day.date.getDay() === 6)) {
              return null;
            }

            const isToday = day.isToday;
            const isSelected = selectedDate && isSameDay(day.date, selectedDate);

            return (
              <div
                key={day.date.toISOString()}
                className={buildClassNames(
                  'o-calendar-grid__week-day-header',
                  isToday && 'o-calendar-grid__week-day-header--today',
                  isSelected && 'o-calendar-grid__week-day-header--selected',
                )}
                onClick={() => handleDateClick(day.date)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDateClick(day.date);
                  }
                }}
              >
                <Text as="small" weight="medium" className="o-calendar-grid__day-name">
                  {day.dayName}
                </Text>
                <Text as="span" weight="semibold" className="o-calendar-grid__day-number">
                  {day.dayNumber}
                </Text>
              </div>
            );
          })}
        </div>

        {/* Week Body - Time Slots */}
        <div className="o-calendar-grid__week-body">
          {grid.timeSlots.map((timeSlot) => (
            <div key={timeSlot.hour} className="o-calendar-grid__time-row">
              {/* Time Label */}
              <div className="o-calendar-grid__time-label">
                <Text as="small" weight="normal" color="muted">
                  {timeSlot.displayTime}
                </Text>
              </div>

              {/* Time Slots for each day */}
              {grid.days.map((day) => {
                if (!showWeekends && (day.date.getDay() === 0 || day.date.getDay() === 6)) {
                  return null;
                }

                const dayMeetings = day.meetings.filter((meeting) => {
                  const meetingHour = meeting.startTime.getHours();
                  return meetingHour === timeSlot.hour;
                });

                return (
                  <div
                    key={`${day.date.toISOString()}-${timeSlot.hour}`}
                    className="o-calendar-grid__time-slot"
                    onClick={() => handleDateClick(day.date)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleDateClick(day.date);
                      }
                    }}
                  >
                    {dayMeetings.map((meeting) => (
                      <CalendarEvent
                        key={meeting.id}
                        meeting={meeting}
                        onClick={onMeetingClick}
                        compactMode={true}
                        showTime={true}
                        showAttendees={false}
                        maxTitleLength={20}
                        className="o-calendar-grid__week-meeting"
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Grid loading overlay */}
        {loading && (
          <div className="o-calendar-grid__loading-overlay">
            <Spinner variant="grow" color="primary" size="lg" />
          </div>
        )}
      </div>
    );
  }

  // Day view renderer
  function renderDayView(grid: DayGridType) {
    return (
      <div className={gridClasses} {...rest}>
        {/* Day Header */}
        <div className="o-calendar-grid__header o-calendar-grid__header--day">
          <div className="o-calendar-grid__day-header-info">
            <Text weight="semibold" className="o-calendar-grid__day-title">
              {grid.fullDayName}, {grid.date.getDate()}
            </Text>
            <Text as="small" weight="normal" color="muted">
              {grid.meetings.length} meeting{grid.meetings.length !== 1 ? 's' : ''}
            </Text>
          </div>
        </div>

        {/* Day Body - Time Slots */}
        <div className="o-calendar-grid__day-body">
          {grid.timeSlots.map((timeSlot) => {
            const timeMeetings = grid.meetings.filter((meeting) => {
              const meetingHour = meeting.startTime.getHours();
              return meetingHour === timeSlot.hour;
            });

            return (
              <div key={timeSlot.hour} className="o-calendar-grid__day-time-slot">
                {/* Time Label */}
                <div className="o-calendar-grid__time-label">
                  <Text as="small" weight="normal" color="muted">
                    {timeSlot.displayTime}
                  </Text>
                </div>

                {/* Meeting Content */}
                <div
                  className="o-calendar-grid__day-slot-content"
                  onClick={() => handleDateClick(grid.date)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDateClick(grid.date);
                    }
                  }}
                >
                  {timeMeetings.map((meeting) => (
                    <CalendarEvent
                      key={meeting.id}
                      meeting={meeting}
                      onClick={onMeetingClick}
                      compactMode={false}
                      showTime={true}
                      showAttendees={true}
                      maxTitleLength={50}
                      className="o-calendar-grid__day-meeting"
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Grid loading overlay */}
        {loading && (
          <div className="o-calendar-grid__loading-overlay">
            <Spinner variant="grow" color="primary" size="lg" />
          </div>
        )}
      </div>
    );
  }
};

export default CalendarGrid;
