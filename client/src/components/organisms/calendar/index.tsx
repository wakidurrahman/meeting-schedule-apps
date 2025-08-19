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
  hideNavigation?: boolean;
  hideHeader?: boolean;
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
  hideHeader = false,
  minHeight = '500px',
  className,
  ...rest
}) => {
  // State management
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate || new Date());
  const [currentView, setCurrentView] = useState<CalendarViewType>(view);
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(
    selectedDate || null,
  );
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Memoized calendar data
  const calendarGrid = useMemo<CalendarGridType>(() => {
    if (currentView === 'month') {
      return generateCalendarGrid(currentDate.getFullYear(), currentDate.getMonth(), meetings);
    }
    // For other views, we'll still use the month grid as base
    // TODO: Implement week/day/year specific grids
    return generateCalendarGrid(currentDate.getFullYear(), currentDate.getMonth(), meetings);
  }, [currentDate, currentView, meetings]);

  // Navigation handlers
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
        newDate = new Date(
          currentDate.getFullYear() - 1,
          currentDate.getMonth(),
          currentDate.getDate(),
        );
        break;
      default:
        newDate = navigateMonth(currentDate, 'previous');
    }

    setCurrentDate(newDate);
    onDateChange?.(newDate);
  }, [currentDate, currentView, onDateChange]);

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

  const handleNavigateToday = useCallback(() => {
    const today = new Date();
    setCurrentDate(today);
    setInternalSelectedDate(today);
    onDateChange?.(today);
  }, [onDateChange]);

  const handleViewChange = useCallback(
    (newView: CalendarViewType) => {
      setCurrentView(newView);
      onViewChange?.(newView);
    },
    [onViewChange],
  );

  // Date interaction handlers
  const handleDateClick = useCallback(
    (date: Date) => {
      setInternalSelectedDate(date);
      onDateClick?.(date);
    },
    [onDateClick],
  );

  const handleDateDoubleClick = useCallback(
    (date: Date) => {
      onCreateMeeting?.(date);
    },
    [onCreateMeeting],
  );

  const handleMeetingClick = useCallback(
    (meeting: MeetingEvent, event?: React.MouseEvent) => {
      event?.stopPropagation();
      onMeetingClick?.(meeting);
    },
    [onMeetingClick],
  );

  // Calendar title
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
      {!hideHeader && (
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
      )}

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
