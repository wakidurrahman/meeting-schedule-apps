/**
 * Calendar Page - Main calendar interface
 *
 * Full-featured calendar page with:
 * - Meeting display and management
 * - Modal-based meeting creation/editing
 * - Real-time GraphQL integration
 * - Conflict detection
 * - Responsive layout using CalendarTemplate
 */

import { useQuery } from '@apollo/client';
import React, { useCallback, useMemo, useState } from 'react';

import Alert from '@/components/atoms/alert';
import Badge from '@/components/atoms/badge';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import Spinner from '@/components/atoms/spinner';
import Text from '@/components/atoms/text';
import Calendar from '@/components/organisms/calendar';
import { CreateMeetingModal, MeetingDetailsModal } from '@/components/organisms/meeting-modal';
import MiniCalendar from '@/components/organisms/mini-calendar';
import CalendarTemplate from '@/components/templates/calendar';
import {
  DateRangeQueryData,
  GET_MEETINGS_BY_DATE_RANGE,
  MeetingsByDateRangeQueryData,
} from '@/graphql/meeting/queries';
import { useCalendarPrefetch } from '@/hooks/use-calendar-prefetch';
import { useToast } from '@/hooks/use-toast';
import type { CalendarViewType } from '@/types/calendar';
import { MeetingEvent } from '@/types/meeting';
import { AttendeesUser } from '@/types/user';
import { formatCalendarDate, getOptimizedDateRange } from '@/utils/calendar';
import { cloneDate, now } from '@/utils/date';
import { formatMeetingTimeRange, getMeetingStatus } from '@/utils/meeting';

interface MeetingsQueryData {
  meetings: {
    meetingsList: Array<{
      id: string;
      title: string;
      description?: string;
      startTime: string;
      endTime: string;
      attendees?: Array<AttendeesUser>;
      createdBy: AttendeesUser;
      createdAt: string;
      updatedAt: string;
    }>;
  };
}

const CalendarPage: React.FC = () => {
  // Authentication (commented out until context is available)
  // const { user } = useAuth();
  const { addSuccess } = useToast();

  // Calendar state
  const [currentDate, setCurrentDate] = useState<Date>(now());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingEvent | null>(null);

  // Sidebar state
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  // Calculate date range for current view Old (09/03/2025)
  // const dateRange = useMemo(() => {
  //   const { start, end } = getMonthBoundaries(currentDate.getFullYear(), currentDate.getMonth());
  //   return { start, end };
  // }, [currentDate]);

  //  ✅ OPTIMIZED: Calculate date range based on current view
  const dateRange = useMemo(() => {
    return getOptimizedDateRange(currentDate, calendarView);
  }, [currentDate, calendarView]);

  // Fetch meetings for current month Old (09/03/2025)
  // const {
  //   data: meetingsData,
  //   loading: meetingsLoading,
  //   error: meetingsError,
  //   refetch: refetchMeetings,
  // } = useQuery<MeetingsQueryData>(GET_MEETINGS, {
  //   variables: {
  //     // Note: This query would need to be enhanced to support date ranges
  //     // For now, it fetches all meetings and we filter client-side
  //   },
  //   // errorPolicy: 'partial',
  // });

  // ✅ OPTIMIZED: Use date-range specific query
  const {
    data: meetingsData,
    loading: meetingsLoading,
    error: meetingsError,
    refetch: refetchMeetings,
  } = useQuery<MeetingsByDateRangeQueryData, DateRangeQueryData>(GET_MEETINGS_BY_DATE_RANGE, {
    variables: {
      dateRange: {
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
      },
    },
    // Enable caching based on date range
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  // 🚀 PERFORMANCE OPTIMIZATION: Prefetch adjacent date ranges for smooth navigation
  useCalendarPrefetch(currentDate, calendarView);

  /**
   * Transform GraphQL meetings to calendar format Old (09/03/2025)
   * 🚨 Current Performance Problem Identified
   * 🔥 Root Cause: ALL meetings loaded regardless of calendar view
   * 
   * Performance Impact:
   * - 10 meetings: ~2KB data transfer ✅ Acceptable
   * - 100 meetings: ~20KB data transfer ⚠️ Noticeable delay
   * - 1,000 meetings: ~200KB data transfer ❌ Significant lag (2-3 seconds)
   * - 10,000 meetings: ~2MB data transfer ❌ Unusable (10+ seconds)

   */
  // const meetings = useMemo<MeetingEvent[]>(() => {
  //   if (!meetingsData?.meetings?.meetingsList) return [];

  //   return meetingsData.meetings.meetingsList
  //     .map((meeting) => ({
  //       id: meeting.id,
  //       title: meeting.title,
  //       description: meeting.description,
  //       startTime: new Date(meeting.startTime),
  //       endTime: new Date(meeting.endTime),
  //       attendees: meeting.attendees?.map((user) => ({ id: user.id, name: user.name })) || [],
  //       createdBy: meeting.createdBy,
  //     }))
  //     .filter((meeting) => {
  //       // 🚨 Performance Problem Identified
  //       // Filter meetings within current view range ⚠️ INEFFICIENT
  //       return meeting.startTime >= dateRange.start && meeting.startTime <= dateRange.end;
  //     });
  // }, [meetingsData, dateRange]);

  // ✅ OPTIMIZED: No client-side filtering needed - server does it
  const meetings = useMemo<MeetingEvent[]>(() => {
    if (!meetingsData?.meetingsByDateRange) return [];

    return meetingsData.meetingsByDateRange.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description || '',
      startTime: cloneDate(meeting.startTime),
      endTime: cloneDate(meeting.endTime),
      attendees: meeting.attendees?.map((user) => ({ id: user.id, name: user.name })) || [],
      createdBy: meeting.createdBy,
    }));
    // No filtering needed - server already filtered by date range
  }, [meetingsData]);

  // Today's Meetings
  const todayMeetings = useMemo(() => meetings.length, [meetings]);

  // This Week's Meetings
  const thisWeekMeetings = useMemo(() => {
    return meetings.filter((meeting) => {
      const weekStart = now();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = cloneDate(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return meeting.startTime >= weekStart && meeting.startTime <= weekEnd;
    });
  }, [meetings]);

  // Upcoming Meetings
  const upcomingMeetings = useMemo(() => {
    return meetings.filter((meeting) => meeting.startTime > now());
  }, [meetings]);

  // Calendar event handlers
  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleDateDoubleClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setShowCreateModal(true);
  }, []);

  const handleMeetingClick = useCallback((meeting: MeetingEvent) => {
    setSelectedMeeting(meeting);
    setShowDetailsModal(true);
  }, []);

  const handleCreateMeeting = useCallback((date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowCreateModal(true);
  }, []);

  const handleViewChange = useCallback((view: CalendarViewType) => {
    setCalendarView(view);
  }, []);

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Modal handlers
  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
    setSelectedDate(null);
  }, []);

  const handleCloseDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedMeeting(null);
  }, []);

  const handleMeetingCreated = useCallback(
    (meeting?: MeetingEvent) => {
      setShowCreateModal(false);
      setSelectedDate(null);
      refetchMeetings();
      addSuccess({
        title: 'Meeting Created',
        subtitle: 'just now',
        children: `Your meeting "${meeting?.title}" has been successfully created.`,
      });
    },
    [refetchMeetings, addSuccess],
  );

  const handleMeetingUpdated = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedMeeting(null);
    refetchMeetings();
    addSuccess({
      title: 'Meeting Updated',
      subtitle: 'just now',
      children: `Your meeting "${selectedMeeting?.title}" has been successfully updated.`,
    });
  }, [refetchMeetings, addSuccess, selectedMeeting]);

  const handleMeetingDeleted = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedMeeting(null);
    refetchMeetings();
    addSuccess({
      title: 'Meeting Deleted',
      subtitle: 'just now',
      children: `Your meeting "${selectedMeeting?.title}" has been successfully deleted.`,
    });
  }, [refetchMeetings, addSuccess, selectedMeeting]);

  const handleToggleSidebar = useCallback(() => {
    setShowSidebar(!showSidebar);
  }, [showSidebar]);

  // Helper function to filter today's meetings
  const getTodaysMeetings = useCallback((meetings: MeetingEvent[]) => {
    const today = now();
    return meetings.filter((meeting) => meeting.startTime.toDateString() === today.toDateString());
  }, []);

  // Helper function to render today's meetings section
  const renderTodaysMeetings = useCallback(
    (meetings: MeetingEvent[]) => {
      const todaysMeetings = getTodaysMeetings(meetings);

      if (todaysMeetings.length === 0) {
        return (
          <Text color="muted" className="d-flex align-items-center gap-2 mb-0">
            <i className="bi bi-exclamation fs-5" />
            No Events Today
          </Text>
        );
      }

      return (
        <div className="d-flex flex-column gap-2">
          {todaysMeetings.slice(0, 3).map((meeting) => (
            <div
              key={meeting.id}
              className="d-flex flex-column gap-1 p-2 bg-light rounded cursor-pointer border border-secondary shadow-sm"
              onClick={() => handleMeetingClick(meeting)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleMeetingClick(meeting);
                }
              }}
            >
              <Text as="small" weight="normal" color="dark" className="m-0">
                {meeting.title}
              </Text>
              <Text as="small" weight="medium" color="dark" className="m-0">
                {formatMeetingTimeRange(meeting.startTime, meeting.endTime)}
              </Text>
              <div className="d-flex align-items-center gap-1">
                <Badge
                  variant={getMeetingStatus(meeting) === 'ongoing' ? 'success' : 'primary'}
                  className={`badge badge-${getMeetingStatus(meeting) === 'ongoing' ? 'success' : 'primary'}`}
                >
                  {getMeetingStatus(meeting)}
                </Badge>
              </div>
            </div>
          ))}
          {todaysMeetings.length > 3 && (
            <Text
              as="small"
              weight="normal"
              color="dark"
              className="d-flex gap-1 align-items-center m-0"
            >
              <i className="bi bi-plus" aria-hidden="true" />
              {todaysMeetings.length - 3} more meetings
            </Text>
          )}
        </div>
      );
    },
    [getTodaysMeetings, handleMeetingClick],
  );

  // Calendar header component
  const calendarHeader = useMemo(
    () => (
      <div className="d-flex gap-3 align-items-center ">
        <button
          type="button"
          className="btn btn-outline-primary btn-sm border-1 rounded-circle d-flex align-items-center justify-content-center"
          onClick={handleToggleSidebar}
          aria-label="Toggle sidebar"
          style={{ width: '35px', height: '35px' }}
        >
          <i className="bi bi-list fs-5" />
        </button>
        <Heading level={1} className="h4 mb-0 d-flex align-items-center">
          <i className="bi bi-calendar-date fs-3 me-3" />
          Calendar
        </Heading>
        {selectedDate && (
          <Text color="muted" weight="light" className="m-0">
            Selected:
            <span className="text-primary fw-bold ps-1">
              {formatCalendarDate(selectedDate, 'long')}
            </span>
          </Text>
        )}
      </div>
    ),
    [selectedDate, handleToggleSidebar],
  );

  // Sidebar content
  const sidebar = useMemo(
    () => (
      <div className="px-1">
        {/* Mini Calendar */}
        <div className="mb-4">
          <MiniCalendar
            selectedDate={selectedDate || currentDate}
            currentDate={currentDate}
            onDateClick={handleDateClick}
            onMonthChange={handleDateChange}
            showNavigation={true}
          />
        </div>

        <Heading level={6} className="mb-3">
          Quick Navigation
        </Heading>
        {/* TODO: Add quick navigation */}

        {/* Today's Meetings */}
        <div className="mb-4">
          <Heading level={6} className="mb-3">
            Today&apos;s Meetings
          </Heading>
          {renderTodaysMeetings(meetings)}
        </div>

        {/* Calendar Stats */}
        <div>
          <Heading level={6} className="mb-3">
            This Month
          </Heading>
          <div className="d-flex flex-column gap-1 small">
            <div className="d-flex justify-content-between">
              <Text as="span" weight="normal" color="dark" className="m-0">
                Total Meetings:
              </Text>
              <Text as="span" weight="medium" color="dark" className="m-0">
                {todayMeetings}
              </Text>
            </div>
            <div className="d-flex justify-content-between">
              <Text as="span" weight="normal" color="dark" className="m-0">
                This Week:
              </Text>
              <Text as="span" weight="medium" color="dark" className="m-0">
                {thisWeekMeetings.length}
              </Text>
            </div>
            <div className="d-flex justify-content-between">
              <Text as="span" weight="normal" color="dark" className="m-0">
                Upcoming:
              </Text>
              <Text as="span" weight="medium" color="dark" className="m-0">
                {upcomingMeetings.length}
              </Text>
            </div>
          </div>
        </div>
      </div>
    ),
    [
      selectedDate,
      currentDate,
      handleDateClick,
      handleDateChange,
      meetings,
      renderTodaysMeetings,
      todayMeetings,
      thisWeekMeetings,
      upcomingMeetings,
    ],
  );

  // Main calendar content
  const calendarContent = useMemo(() => {
    if (meetingsLoading) {
      return (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '400px' }}
        >
          <div className="text-center">
            <Spinner size="lg" variant="grow" className="mb-3" />
          </div>
        </div>
      );
    }

    if (meetingsError) {
      return (
        <Alert variant="danger" className="m-4">
          <Heading level={6}>Error Loading Calendar</Heading>
          <Text className="mb-2">{meetingsError.message}</Text>
          <Button variant="outline-danger" size="sm" onClick={() => refetchMeetings()}>
            <i className="bi bi-arrow-clockwise me-1" />
            Retry
          </Button>
        </Alert>
      );
    }

    return (
      <Calendar
        meetings={meetings}
        view={calendarView}
        selectedDate={selectedDate || undefined}
        loading={meetingsLoading}
        showWeekends={true}
        onDateClick={handleDateClick}
        onDateDoubleClick={handleDateDoubleClick}
        onMeetingClick={handleMeetingClick}
        onCreateMeeting={handleCreateMeeting}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
      />
    );
  }, [
    meetings,
    calendarView,
    selectedDate,
    meetingsLoading,
    meetingsError,
    handleDateClick,
    handleMeetingClick,
    handleCreateMeeting,
    handleViewChange,
    handleDateChange,
    refetchMeetings,
    handleDateDoubleClick,
  ]);

  // Modal components (real modals with full functionality)
  const modals = useMemo(
    () => (
      <>
        {/* Create Meeting Modal */}
        <CreateMeetingModal
          show={showCreateModal}
          onHide={handleCloseCreateModal}
          selectedDate={selectedDate || undefined}
          onSuccess={handleMeetingCreated}
          existingMeetings={meetings}
        />

        {/* Meeting Details Modal */}
        <MeetingDetailsModal
          show={showDetailsModal}
          onHide={handleCloseDetailsModal}
          meeting={selectedMeeting}
          onEdit={() => {
            // Navigate to edit page or open edit modal
            handleMeetingUpdated();
          }}
          onDelete={() => {
            handleMeetingDeleted();
          }}
        />
      </>
    ),
    [
      showCreateModal,
      showDetailsModal,
      selectedDate,
      selectedMeeting,
      meetings,
      handleCloseCreateModal,
      handleCloseDetailsModal,
      handleMeetingCreated,
      handleMeetingUpdated,
      handleMeetingDeleted,
    ],
  );

  // Render using CalendarTemplate
  return (
    <CalendarTemplate
      calendarHeader={calendarHeader}
      calendarContent={calendarContent}
      sidebar={sidebar}
      modals={modals}
      showSidebar={showSidebar}
    />
  );
};

export default CalendarPage;
