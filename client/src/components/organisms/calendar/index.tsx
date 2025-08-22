/**
 * Calendar Organism Component
 *
 * Main calendar component that provides:
 * - Multiple view types (month, week, day, year)
 * - Meeting display and interaction
 * - Navigation controls
 * - Date selection
 * - Meeting creation integration
 */

import React, { useCallback, useMemo, useState } from 'react';

import CalendarGrid from './grid';
import CalendarHeader from './header';
import './index.scss';

import Spinner from '@/components/atoms/spinner';
import type { CalendarGridType, CalendarViewType } from '@/types/calendar';
import { BaseComponentProps } from '@/types/components-common';
import type { MeetingEvent } from '@/types/meeting';
import {
  generateCalendarGrid,
  getCalendarViewTitle,
  navigateDay,
  navigateMonth,
  navigateWeek,
} from '@/utils/calendar';
import { buildClassNames } from '@/utils/component';
import { fromPartsJST, now } from '@/utils/date';

export interface CalendarProps extends BaseComponentProps {
  // Data
  meetings?: MeetingEvent[];
  loading?: boolean;
  error?: string | null;

  // View state
  view?: CalendarViewType;
  selectedDate?: Date;
  showWeekends?: boolean;

  // Event handlers
  onDateClick?: (date: Date) => void;
  onMeetingClick?: (meeting: MeetingEvent) => void;
  onCreateMeeting?: (date?: Date) => void;

  onViewChange?: (view: CalendarViewType) => void;
  onDateChange?: (date: Date) => void;

  // UI customization
  compactMode?: boolean;
  minHeight?: string;
}

export interface CalendarState {
  currentDate: Date;
  view: CalendarViewType;
  selectedDate: Date | null;
  hoveredDate: Date | null;
}

const Calendar: React.FC<CalendarProps> = ({
  meetings = [],
  loading = false,
  error = null,
  view = 'month',
  selectedDate,
  showWeekends = true,
  onDateClick,
  onMeetingClick,
  onCreateMeeting,

  onViewChange,
  onDateChange,
  compactMode = false,
  minHeight = '500px',
  className,
  ...rest
}) => {
  // 1. State management
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate || now());
  const [currentView, setCurrentView] = useState<CalendarViewType>(view);
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(
    selectedDate || null,
  );
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  /**
   * All Event Handlers
   *
   * *This is a performance optimization.*
   * All of the event handlers are wrapped in useCallback to avoid unnecessary re-renders.
   * The useCallback hook is used to memoize the event handlers so that they are not recreated on every render.
   * This is important because the event handlers are passed to the child components and if they are recreated on every render,
   * the child components will also be recreated on every render.
   *
   * 1. handleNavigatePrevious (Previous button)
   * 2. handleNavigateNext (Next button)
   * 3. handleNavigateToday (Today button)
   * 4. handleViewChange (View selector)
   * 5. handleDateClick (Date click)
   * 6. handleDateDoubleClick (Date double click)
   * 7. handleMeetingClick (Meeting click)
   * 8. handleDateHover (Date hover)
   * 9. handleDateLeave (Date leave)
   */

  // 2. Navigation handlers previous date
  const handleNavigatePrevious = useCallback(() => {
    let newDate: Date;

    switch (currentView) {
      case 'month':
        newDate = navigateMonth(currentDate, 'previous');
        break;
      case 'week':
        newDate = navigateWeek(currentDate, 'previous');
        break;
      case 'day':
        newDate = navigateDay(currentDate, 'previous');
        break;
      case 'year':
        newDate = fromPartsJST({
          year: currentDate.getFullYear() - 1,
          month: currentDate.getMonth(),
          day: currentDate.getDate(),
        });

        break;
      default:
        newDate = navigateMonth(currentDate, 'previous');
    }

    setCurrentDate(newDate);
    onDateChange?.(newDate);
  }, [currentDate, currentView, onDateChange]);

  // 3. Navigation handlers next date
  const handleNavigateNext = useCallback(() => {
    let newDate: Date;

    switch (currentView) {
      case 'month':
        newDate = navigateMonth(currentDate, 'next');
        break;
      case 'week':
        newDate = navigateWeek(currentDate, 'next');
        break;
      case 'day':
        newDate = navigateDay(currentDate, 'next');
        break;
      case 'year':
        newDate = new Date(
          currentDate.getFullYear() + 1,
          currentDate.getMonth(),
          currentDate.getDate(),
        );
        break;
      default:
        newDate = navigateMonth(currentDate, 'next');
    }

    setCurrentDate(newDate);
    onDateChange?.(newDate);
  }, [currentDate, currentView, onDateChange]);

  // 4. Navigation handlers today date
  const handleNavigateToday = useCallback(() => {
    const today = now();
    setCurrentDate(today);
    setInternalSelectedDate(today);
    onDateChange?.(today);
  }, [onDateChange]);

  // 5. Navigation handlers view change
  const handleViewChange = useCallback(
    (newView: CalendarViewType) => {
      setCurrentView(newView);
      onViewChange?.(newView);
    },
    [onViewChange],
  );

  // 6. Date interaction handlers
  const handleDateClick = useCallback(
    (date: Date) => {
      console.log('date', date);
      setInternalSelectedDate(date);
      onDateClick?.(date);
    },
    [onDateClick],
  );

  // 7. Date double click handler
  const handleDateDoubleClick = useCallback(
    (date: Date) => {
      console.log('date double click', date);
      onCreateMeeting?.(date);
    },
    [onCreateMeeting],
  );

  // 8. Meeting click handler
  const handleMeetingClick = useCallback(
    (meeting: MeetingEvent, event?: React.MouseEvent) => {
      event?.stopPropagation();
      onMeetingClick?.(meeting);
    },
    [onMeetingClick],
  );

  /**
   * 9. Memoized calendar data
   *
   * *This is a performance optimization.*
   *
   * The calendar grid is memoized so that it is not recreated on every render.
   * This is important because the calendar grid is a large object and it is not necessary to recreate it on every render.
   *
   * calendarGrid
   * - currentDate: Date
   * - currentView: CalendarViewType
   * - meetings: MeetingEvent[]
   *
   * calendarTitle
   * - currentDate: Date
   * - currentView: CalendarViewType
   */
  const calendarGrid = useMemo<CalendarGridType>(() => {
    if (currentView === 'month') {
      return generateCalendarGrid(currentDate.getFullYear(), currentDate.getMonth(), meetings);
    }
    // For other views, we'll still use the month grid as base
    // TODO: Implement week/day/year specific grids...
    return generateCalendarGrid(currentDate.getFullYear(), currentDate.getMonth(), meetings);
  }, [currentDate, currentView, meetings]);

  // 10. Calendar title
  const calendarTitle = useMemo(() => {
    return getCalendarViewTitle(currentDate, currentView);
  }, [currentDate, currentView]);

  // CSS classes
  const calendarClasses = buildClassNames(
    'o-calendar',
    compactMode && 'o-calendar--compact',
    loading && 'o-calendar--loading',
    className,
  );

  return (
    <div className={calendarClasses} style={{ minHeight }} {...rest}>
      {/* Calendar Header */}

      <CalendarHeader
        title={calendarTitle}
        onPrevious={handleNavigatePrevious}
        onNext={handleNavigateNext}
        onToday={handleNavigateToday}
        loading={loading}
        onCreateMeeting={() => onCreateMeeting?.()}
        className="o-calendar__header"
        onViewChange={handleViewChange}
        view={currentView}
      />

      {/* Error State */}
      {error && (
        <div className="o-calendar__error alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Calendar Content */}
      <div className="o-calendar__content">
        <CalendarGrid
          calendarGrid={calendarGrid}
          view={currentView}
          selectedDate={internalSelectedDate}
          hoveredDate={hoveredDate}
          showWeekends={showWeekends}
          loading={loading}
          onDateClick={handleDateClick}
          onDateDoubleClick={handleDateDoubleClick}
          onMeetingClick={handleMeetingClick}
          onDateHover={setHoveredDate}
          compactMode={compactMode}
        />
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="o-calendar__loading-overlay">
          <Spinner variant="grow" color="primary" size="lg" />
        </div>
      )}
    </div>
  );
};

export default Calendar;
