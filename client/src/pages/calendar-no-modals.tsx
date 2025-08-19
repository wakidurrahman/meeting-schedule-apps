/**
 * Calendar Page - Without Modal Components (for testing)
 */

import { useQuery } from '@apollo/client';
import React, { useCallback, useMemo, useState } from 'react';

import Alert from '@/components/atoms/alert';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import Spinner from '@/components/atoms/spinner';
import Calendar from '@/components/organisms/calendar';
import CalendarTemplate from '@/components/templates/calendar';
import { GET_MEETINGS } from '@/graphql/meeting/queries';
import type { CalendarViewType } from '@/types/calendar';
import type { MeetingEvent } from '@/types/meeting';
import { formatCalendarDate, getMonthBoundaries } from '@/utils/calendar';
import { formatMeetingTimeRange, getMeetingStatus } from '@/utils/meeting';

interface MeetingsQueryData {
  meetings: {
    meetingsList: Array<{
      id: string;
      title: string;
      description?: string;
      startTime: string;
      endTime: string;
      attendees?: Array<{ id: string; name: string; email: string }>;
      creator: { id: string; name: string };
      createdAt: string;
      updatedAt: string;
    }>;
  };
}

const CalendarNoModalsPage: React.FC = () => {
  // Calendar state
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingEvent | null>(null);

  // Calculate date range for current view
  const dateRange = useMemo(() => {
    const { start, end } = getMonthBoundaries(currentDate.getFullYear(), currentDate.getMonth());
    return { start, end };
  }, [currentDate]);

  // Fetch meetings for current month
  const {
    data: meetingsData,
    loading: meetingsLoading,
    error: meetingsError,
    refetch: refetchMeetings,
  } = useQuery<MeetingsQueryData>(GET_MEETINGS, {
    variables: {
      // Note: This query would need to be enhanced to support date ranges
      // For now, it fetches all meetings and we filter client-side
    },
    // errorPolicy: 'partial',
  });

  // Transform GraphQL meetings to calendar format
  const meetings = useMemo<MeetingEvent[]>(() => {
    if (!meetingsData?.meetings?.meetingsList) return [];

    return meetingsData.meetings.meetingsList
      .map((meeting) => ({
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        startTime: new Date(meeting.startTime),
        endTime: new Date(meeting.endTime),
        attendees: meeting.attendees?.map((a) => ({ id: a.id, name: a.name })) || [],
      }))
      .filter((meeting) => {
        // Filter meetings within current view range
        return meeting.startTime >= dateRange.start && meeting.startTime <= dateRange.end;
      });
  }, [meetingsData, dateRange]);

  // Calendar event handlers
  const handleDateClick = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleMeetingClick = useCallback((meeting: MeetingEvent) => {
    setSelectedMeeting(meeting);
    setShowDetailsModal(true);
    console.log('Meeting clicked:', meeting);
  }, []);

  const handleCreateMeeting = useCallback((date?: Date) => {
    if (date) {
      setSelectedDate(date);
    }
    setShowCreateModal(true);
    console.log('Create meeting:', date);
  }, []);

  const handleViewChange = useCallback((view: CalendarViewType) => {
    setCalendarView(view);
  }, []);

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, []);

  // Calendar header component
  const calendarHeader = useMemo(
    () => (
      <div className="d-flex justify-content-between align-items-center py-3">
        <div className="d-flex align-items-center gap-3">
          <Heading level={1} className="h4 mb-0">
            Calendar (No Modals Test)
          </Heading>
          {selectedDate && (
            <small className="text-muted">
              Selected: {formatCalendarDate(selectedDate, 'long')}
            </small>
          )}
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <Button variant="primary" size="sm" onClick={() => handleCreateMeeting()}>
            <i className="bi bi-plus-lg me-1" />
            Create Meeting
          </Button>
        </div>
      </div>
    ),
    [selectedDate, handleCreateMeeting],
  );

  // Sidebar content
  const sidebar = useMemo(
    () => (
      <div className="p-3">
        {/* Mini Calendar */}
        <div className="mb-4">
          <h6 className="fw-semibold mb-3">Quick Navigation</h6>
          <div className="d-grid gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Go to Today
            </Button>
            <Button variant="outline-primary" size="sm" onClick={() => handleCreateMeeting()}>
              <i className="bi bi-plus-lg me-1" />
              New Meeting
            </Button>
          </div>
        </div>

        {/* Today's Meetings */}
        <div className="mb-4">
          <h6 className="fw-semibold mb-3">Today&apos;s Meetings</h6>
          {(() => {
            const today = new Date();
            const todaysMeetings = meetings.filter(
              (meeting) => meeting.startTime.toDateString() === today.toDateString(),
            );

            if (todaysMeetings.length === 0) {
              return <p className="text-muted small mb-0">No meetings today</p>;
            }

            return (
              <div className="d-flex flex-column gap-2">
                {todaysMeetings.slice(0, 3).map((meeting) => (
                  <div
                    key={meeting.id}
                    className="p-2 bg-light rounded cursor-pointer"
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
                    <div className="fw-medium small">{meeting.title}</div>
                    <div className="text-muted small">
                      {formatMeetingTimeRange(meeting.startTime, meeting.endTime)}
                    </div>
                    <div className="d-flex align-items-center gap-1 mt-1">
                      <span
                        className={`badge badge-${getMeetingStatus(meeting) === 'ongoing' ? 'success' : 'primary'}`}
                      >
                        {getMeetingStatus(meeting)}
                      </span>
                    </div>
                  </div>
                ))}
                {todaysMeetings.length > 3 && (
                  <small className="text-muted">+{todaysMeetings.length - 3} more meetings</small>
                )}
              </div>
            );
          })()}
        </div>

        {/* Calendar Stats */}
        <div>
          <h6 className="fw-semibold mb-3">This Month</h6>
          <div className="d-flex flex-column gap-1 small">
            <div className="d-flex justify-content-between">
              <span>Total Meetings:</span>
              <span className="fw-medium">{meetings.length}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span>This Week:</span>
              <span className="fw-medium">
                {
                  meetings.filter((m) => {
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    return m.startTime >= weekStart && m.startTime <= weekEnd;
                  }).length
                }
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span>Upcoming:</span>
              <span className="fw-medium">
                {meetings.filter((m) => m.startTime > new Date()).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    [meetings, handleCreateMeeting, handleMeetingClick],
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
            <Spinner size="lg" className="mb-3" />
            <p className="text-muted">Loading your calendar...</p>
          </div>
        </div>
      );
    }

    if (meetingsError) {
      return (
        <Alert variant="danger" className="m-4">
          <h6>Error Loading Calendar</h6>
          <p className="mb-2">{meetingsError.message}</p>
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
        onMeetingClick={handleMeetingClick}
        onCreateMeeting={handleCreateMeeting}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
        className="border-0"
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
  ]);

  // Modal components (placeholder without actual modals)
  const modals = useMemo(
    () => (
      <div>
        {showCreateModal && (
          <div className="alert alert-info">
            Create Meeting Modal would be here (Date: {selectedDate?.toDateString()})
            <button
              className="btn btn-sm btn-secondary ms-2"
              onClick={() => setShowCreateModal(false)}
            >
              Close
            </button>
          </div>
        )}
        {showDetailsModal && selectedMeeting && (
          <div className="alert alert-info">
            Meeting Details Modal would be here (Meeting: {selectedMeeting.title})
            <button
              className="btn btn-sm btn-secondary ms-2"
              onClick={() => setShowDetailsModal(false)}
            >
              Close
            </button>
          </div>
        )}
      </div>
    ),
    [showCreateModal, showDetailsModal, selectedDate, selectedMeeting],
  );

  // Render using CalendarTemplate
  return (
    <CalendarTemplate
      calendarHeader={calendarHeader}
      calendarContent={calendarContent}
      sidebar={sidebar}
      modals={modals}
      showSidebar={true}
    />
  );
};

export default CalendarNoModalsPage;
