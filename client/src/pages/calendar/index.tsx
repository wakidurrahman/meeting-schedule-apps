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
import CalendarTemplate from '@/components/templates/calendar';
import { GET_MEETINGS } from '@/graphql/meeting/queries';
import type { CalendarViewType } from '@/types/calendar';
import { MeetingEvent } from '@/types/meeting';
import { AttendeesUser } from '@/types/user';
import { formatCalendarDate, getMonthBoundaries } from '@/utils/calendar';
import { now } from '@/utils/date';
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
      creator: { id: string; name: string };
      createdAt: string;
      updatedAt: string;
    }>;
  };
}

const CalendarPage: React.FC = () => {
  // Authentication (commented out until context is available)
  // const { user } = useAuth();
  // const { addToast } = useToast();

  // Calendar state
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarView, setCalendarView] = useState<CalendarViewType>('month');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingEvent | null>(null);

  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  console.log('showSidebar', showSidebar);
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

  // const handleDateDoubleClick = useCallback((date: Date) => {
  //   setSelectedDate(date);
  //   setShowCreateModal(true);
  // }, []);

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
      // addToast({
      //   type: 'success',
      //   title: 'Meeting Created',
      //   message: 'Your meeting has been successfully created.',
      // });
      console.log('Meeting created successfully:', meeting);
    },
    [refetchMeetings],
  );

  const handleMeetingUpdated = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedMeeting(null);
    refetchMeetings();
    // addToast({
    //   type: 'success',
    //   title: 'Meeting Updated',
    //   message: 'Your meeting has been successfully updated.',
    // });
    console.log('Meeting updated successfully');
  }, [refetchMeetings]);

  const handleMeetingDeleted = useCallback(() => {
    setShowDetailsModal(false);
    setSelectedMeeting(null);
    refetchMeetings();
    // addToast({
    //   type: 'success',
    //   title: 'Meeting Deleted',
    //   message: 'Your meeting has been successfully deleted.',
    // });
    console.log('Meeting deleted successfully');
  }, [refetchMeetings]);

  const handleToggleSidebar = useCallback(() => {
    console.log('handleToggleSidebar', showSidebar);
    setShowSidebar(!showSidebar);
  }, [showSidebar]);

  // Calendar header component
  const calendarHeader = useMemo(
    () => (
      <div className="d-flex gap-3 align-items-center ">
        <button
          className="btn btn-outline-primary btn-sm border-0"
          onClick={handleToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list fs-5" />
        </button>
        <i className="bi bi-calendar-date fs-3" />
        <Heading level={1} className="h4 mb-0">
          Calendar
        </Heading>
        {selectedDate && (
          <Text color="muted" weight="light" className="m-0">
            Selected:{' '}
            <span className="text-primary fw-bold">{formatCalendarDate(selectedDate, 'long')}</span>
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
          <Heading level={6} className="mb-3">
            Quick Navigation
          </Heading>
          <div className="d-grid gap-2">
            <Button variant="outline-secondary" size="sm" onClick={() => setCurrentDate(now())}>
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
          <Heading level={6} className="mb-3">
            Today&apos;s Meetings
          </Heading>
          {(() => {
            const today = now();
            const todaysMeetings = meetings.filter(
              (meeting) => meeting.startTime.toDateString() === today.toDateString(),
            );

            if (todaysMeetings.length === 0) {
              return <Text className="text-muted small mb-0">No meetings today</Text>;
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
                    <Text as="small" weight="normal" color="dark" className="m-0">
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
          })()}
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
                {meetings.length}
              </Text>
            </div>
            <div className="d-flex justify-content-between">
              <Text as="span" weight="normal" color="dark" className="m-0">
                This Week:
              </Text>
              <Text as="span" weight="medium" color="dark" className="m-0">
                {
                  meetings.filter((m) => {
                    const weekStart = new Date();
                    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);
                    return m.startTime >= weekStart && m.startTime <= weekEnd;
                  }).length
                }
              </Text>
            </div>
            <div className="d-flex justify-content-between">
              <Text as="span" weight="normal" color="dark" className="m-0">
                Upcoming:
              </Text>
              <Text as="span" weight="medium" color="dark" className="m-0">
                {meetings.filter((m) => m.startTime > new Date()).length}
              </Text>
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
          onEdit={(meeting: MeetingEvent) => {
            // Navigate to edit page or open edit modal
            console.log('Edit meeting:', meeting);
            handleMeetingUpdated();
          }}
          onDelete={(meetingId: string) => {
            console.log('Delete meeting:', meetingId);
            handleMeetingDeleted();
          }}
        />
      </>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
