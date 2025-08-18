/**
 * Meeting Dashboard Page
 *
 * Dashboard for managing meetings with:
 * - Meeting statistics and overview
 * - Recent meetings table
 * - Quick actions for meeting management
 * - Upcoming meetings list
 * - Integration with MeetingDashboardTemplate
 */

import { useQuery } from '@apollo/client';
import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Alert from '@/components/atoms/alert';
import Badge from '@/components/atoms/badge';
import Button from '@/components/atoms/button';
import Heading from '@/components/atoms/heading';
import Spinner from '@/components/atoms/spinner';
import Card from '@/components/molecules/card';
import Table from '@/components/molecules/table';
import Modal from '@/components/organisms/modal';
import MeetingDashboardTemplate from '@/components/templates/meeting-templates/MeetingDashboardTemplate';
import { GET_MEETINGS } from '@/graphql/meeting/queries';
import type { MeetingEvent } from '@/types/calendar';
import { formatCalendarDate } from '@/utils/calendar';
import { formatAttendeeList, formatMeetingTimeRange, getMeetingStatus } from '@/utils/meeting';

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

const DashboardPage: React.FC = () => {
  // Authentication and notifications (commented out until context is available)
  // const { user } = useAuth();
  // const { addToast } = useToast();

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  // const [selectedMeeting, setSelectedMeeting] = useState<MeetingEvent | null>(null);

  // Fetch meetings
  const {
    data: meetingsData,
    loading: meetingsLoading,
    error: meetingsError,
    refetch: refetchMeetings,
  } = useQuery<MeetingsQueryData>(GET_MEETINGS, {
    // errorPolicy: 'partial',
  });

  // Transform and organize meetings
  const { meetings, stats } = useMemo(() => {
    if (!meetingsData?.meetings?.meetingsList) {
      return { meetings: [], stats: { total: 0, upcoming: 0, ongoing: 0, thisWeek: 0 } };
    }

    const transformedMeetings: MeetingEvent[] = meetingsData.meetings.meetingsList.map(
      (meeting) => ({
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        startTime: new Date(meeting.startTime),
        endTime: new Date(meeting.endTime),
        attendees: meeting.attendees?.map((a) => ({ id: a.id, name: a.name })) || [],
      }),
    );

    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const stats = {
      total: transformedMeetings.length,
      upcoming: transformedMeetings.filter((m) => m.startTime > now).length,
      ongoing: transformedMeetings.filter((m) => getMeetingStatus(m) === 'ongoing').length,
      thisWeek: transformedMeetings.filter(
        (m) => m.startTime >= weekStart && m.startTime <= weekEnd,
      ).length,
    };

    return { meetings: transformedMeetings, stats };
  }, [meetingsData]);

  // Upcoming meetings (next 5)
  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    return meetings
      .filter((meeting) => meeting.startTime > now)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 5);
  }, [meetings]);

  // Recent meetings (last 10)
  const recentMeetings = useMemo(() => {
    return meetings.sort((a, b) => b.startTime.getTime() - a.startTime.getTime()).slice(0, 10);
  }, [meetings]);

  // Event handlers
  const handleMeetingClick = useCallback((meeting: MeetingEvent) => {
    // setSelectedMeeting(meeting);
    // Navigate to meeting details or show modal
    console.log('View meeting:', meeting);
  }, []);

  const handleCreateMeeting = useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleEditMeeting = useCallback((meeting: MeetingEvent) => {
    // Navigate to edit page
    console.log('Edit meeting:', meeting);
  }, []);

  // const handleDeleteMeeting = useCallback((meeting: MeetingEvent) => {
  //   // Show confirmation and delete
  //   console.log('Delete meeting:', meeting);
  // }, []);

  // Dashboard header with stats
  const dashboardHeader = useMemo(
    () => (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Heading level={1} className="h3 mb-1">
              Meeting Dashboard
            </Heading>
            <p className="text-muted mb-0">Manage your meetings and view upcoming events</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/calendar" className="btn btn-outline-primary">
              <i className="bi bi-calendar me-1" />
              View Calendar
            </Link>
            <Button variant="primary" onClick={handleCreateMeeting}>
              <i className="bi bi-plus-lg me-1" />
              New Meeting
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="row g-3">
          <div className="col-6 col-md-3">
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="h2 text-primary mb-1">{stats.total}</div>
                <div className="small text-muted">Total Meetings</div>
              </Card.Body>
            </Card>
          </div>
          <div className="col-6 col-md-3">
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="h2 text-success mb-1">{stats.upcoming}</div>
                <div className="small text-muted">Upcoming</div>
              </Card.Body>
            </Card>
          </div>
          <div className="col-6 col-md-3">
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="h2 text-warning mb-1">{stats.ongoing}</div>
                <div className="small text-muted">Ongoing</div>
              </Card.Body>
            </Card>
          </div>
          <div className="col-6 col-md-3">
            <Card className="h-100">
              <Card.Body className="text-center">
                <div className="h2 text-info mb-1">{stats.thisWeek}</div>
                <div className="small text-muted">This Week</div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    ),
    [stats, handleCreateMeeting],
  );

  // Main dashboard content
  const mainContent = useMemo(() => {
    if (meetingsLoading) {
      return (
        <div className="text-center py-5">
          <Spinner size="lg" className="mb-3" />
          <p className="text-muted">Loading your meetings...</p>
        </div>
      );
    }

    if (meetingsError) {
      return (
        <Alert variant="danger">
          <h6>Error Loading Meetings</h6>
          <p className="mb-2">{meetingsError.message}</p>
          <Button variant="outline-danger" size="sm" onClick={() => refetchMeetings()}>
            <i className="bi bi-arrow-clockwise me-1" />
            Retry
          </Button>
        </Alert>
      );
    }

    // Convert meetings to table format
    const tableData = recentMeetings.map((meeting) => ({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      startTime: formatCalendarDate(meeting.startTime, 'short'),
      timeRange: formatMeetingTimeRange(meeting.startTime, meeting.endTime),
      status: getMeetingStatus(meeting),
      attendeeCount: meeting.attendees?.length || 0,
      attendeeList:
        meeting.attendees && meeting.attendees.length > 0
          ? formatAttendeeList(meeting.attendees, 2)
          : 'No attendees',
      _original: meeting, // Keep reference to original meeting
    }));

    // Table columns adapted for generic table
    const columns = [
      {
        header: 'Meeting',
        key: 'title' as keyof (typeof tableData)[0],
        render: (row: (typeof tableData)[0]) => (
          <div>
            <div className="fw-medium">{row.title}</div>
            {row.description && <small className="text-muted d-block">{row.description}</small>}
          </div>
        ),
      },
      {
        header: 'Date & Time',
        key: 'startTime' as keyof (typeof tableData)[0],
        render: (row: (typeof tableData)[0]) => (
          <div>
            <div>{row.startTime}</div>
            <small className="text-muted">{row.timeRange}</small>
          </div>
        ),
      },
      {
        header: 'Status',
        key: 'status' as keyof (typeof tableData)[0],
        render: (row: (typeof tableData)[0]) => {
          const variants = {
            upcoming: 'primary',
            ongoing: 'success',
            completed: 'secondary',
            cancelled: 'danger',
          } as const;
          return (
            <Badge variant={variants[row.status as keyof typeof variants]}>{row.status}</Badge>
          );
        },
      },
      {
        header: 'Attendees',
        key: 'attendeeList' as keyof (typeof tableData)[0],
        render: (row: (typeof tableData)[0]) => <span className="small">{row.attendeeList}</span>,
      },
    ];

    // Table actions
    const actions = [
      {
        label: 'View',
        variant: 'outline-primary' as const,
        onClick: (row: (typeof tableData)[0]) => handleMeetingClick(row._original),
      },
      {
        label: 'Edit',
        variant: 'outline-secondary' as const,
        onClick: (row: (typeof tableData)[0]) => handleEditMeeting(row._original),
      },
    ];

    return (
      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Recent Meetings</h5>
            <Button variant="outline-primary" size="sm" onClick={() => refetchMeetings()}>
              <i className="bi bi-arrow-clockwise me-1" />
              Refresh
            </Button>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {tableData.length > 0 ? (
            <Table
              data={tableData}
              columns={columns}
              rowActions={() => actions}
              loading={false}
              // className="mb-0"
            />
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-calendar-x fs-1 text-muted mb-3 d-block" />
              <h6>No Meetings Found</h6>
              <p className="text-muted mb-3">Get started by creating your first meeting.</p>
              <Button variant="primary" onClick={handleCreateMeeting}>
                <i className="bi bi-plus-lg me-1" />
                Create Meeting
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  }, [
    meetingsLoading,
    meetingsError,
    recentMeetings,
    handleMeetingClick,
    handleEditMeeting,
    handleCreateMeeting,
    refetchMeetings,
  ]);

  // Quick actions sidebar
  const quickActions = useMemo(
    () => (
      <div className="d-flex flex-column gap-3">
        {/* Quick Actions */}
        <Card>
          <Card.Header>
            <h6 className="mb-0">Quick Actions</h6>
          </Card.Header>
          <Card.Body>
            <div className="d-grid gap-2">
              <Button variant="primary" onClick={handleCreateMeeting}>
                <i className="bi bi-plus-lg me-1" />
                New Meeting
              </Button>
              <Link to="/calendar" className="btn btn-outline-primary">
                <i className="bi bi-calendar me-1" />
                View Calendar
              </Link>
              <Button variant="outline-secondary" onClick={() => refetchMeetings()}>
                <i className="bi bi-arrow-clockwise me-1" />
                Refresh Data
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Upcoming Meetings */}
        <Card>
          <Card.Header>
            <h6 className="mb-0">Upcoming Meetings</h6>
          </Card.Header>
          <Card.Body>
            {upcomingMeetings.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {upcomingMeetings.map((meeting) => (
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
                    <div className="text-muted small">
                      {formatCalendarDate(meeting.startTime, 'short')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small mb-0">No upcoming meetings</p>
            )}
          </Card.Body>
        </Card>
      </div>
    ),
    [upcomingMeetings, handleCreateMeeting, handleMeetingClick, refetchMeetings],
  );

  // Modal placeholder
  const modals = useMemo(
    () => (
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Meeting</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center py-4">
            <i className="bi bi-calendar-plus fs-1 text-primary mb-3 d-block" />
            <h5>Meeting Creation Modal</h5>
            <p className="text-muted mb-4">This will be the meeting creation form component.</p>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Close
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    ),
    [showCreateModal],
  );

  // Render using MeetingDashboardTemplate
  return (
    <MeetingDashboardTemplate
      dashboardHeader={dashboardHeader}
      mainContent={mainContent}
      quickActions={quickActions}
      modals={modals}
      showQuickActions={true}
    />
  );
};

export default DashboardPage;
