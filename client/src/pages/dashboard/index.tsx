/**
 * Unified Dashboard Page
 *
 * Comprehensive dashboard combining analytics and meeting management:
 * - Real-time statistics with trend indicators
 * - Interactive charts and visualizations
 * - Calendar-based meeting analytics
 * - Unified table showing latest meetings, users, and events
 * - Quick actions for navigation
 */

import { useQuery } from '@apollo/client';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Alert from '@/components/atoms/alert';
import Button from '@/components/atoms/button';
import { BarChart, DoughnutChart, generateChartData } from '@/components/atoms/chart';
import Heading from '@/components/atoms/heading';
import Spinner from '@/components/atoms/spinner';
import Card from '@/components/molecules/card';
import DashboardMetricCard from '@/components/molecules/dashboard-metric-card';
import CalendarChart from '@/components/organisms/calendar-chart';
import MeetingDashboardTemplate from '@/components/templates/dashboard/meeting-dashboard';
import { paths } from '@/constants/paths';
import { GET_BOOKINGS } from '@/graphql/booking/queries';
import { GET_EVENTS } from '@/graphql/event/queries';
import { GET_MEETINGS } from '@/graphql/meeting/queries';
import { GET_USERS } from '@/graphql/user/queries';
import type { Booking } from '@/types/booking';
import type { Event } from '@/types/event';
import type { Meeting } from '@/types/meeting';
import type { UserProfile } from '@/types/user';

interface DashboardData {
  meetings: Meeting[];
  events: Event[];
  bookings: Booking[];
  users: UserProfile[];
}

interface DashboardMetrics {
  totalUsers: number;
  totalEvents: number;
  totalBookings: number;
  totalMeetings: number;
  totalRevenue: number;
  recentUsers: number;
  recentEvents: number;
  recentBookings: number;
  recentMeetings: number;
  recentRevenue: number;
  userGrowth: number;
  eventGrowth: number;
  bookingGrowth: number;
  meetingGrowth: number;
  revenueGrowth: number;
}

const DashboardPage: React.FC = () => {
  const [currentDate] = useState(new Date());

  // Fetch data from multiple sources with limits for performance optimization
  const {
    data: meetingsData,
    loading: meetingsLoading,
    error: meetingsError,
    refetch: refetchMeetings,
  } = useQuery(GET_MEETINGS, {
    errorPolicy: 'all',
  });

  const { data: eventsData, loading: eventsLoading, error: eventsError } = useQuery(GET_EVENTS);

  const {
    data: bookingsData,
    loading: bookingsLoading,
    error: bookingsError,
  } = useQuery(GET_BOOKINGS);

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery(GET_USERS, {
    variables: { pagination: { limit: 50 } },
  });

  // Combine loading and error states
  const isLoading = meetingsLoading || eventsLoading || bookingsLoading || usersLoading;
  const hasError = meetingsError || eventsError || bookingsError || usersError;

  // Process and analyze data
  const dashboardData: DashboardData = useMemo(() => {
    return {
      meetings: meetingsData?.meetings?.meetingsList || [],
      events: eventsData?.events || [],
      bookings: bookingsData?.bookings || [],
      users: usersData?.users?.usersList || [],
    };
  }, [meetingsData, eventsData, bookingsData, usersData]);

  // Calculate analytics metrics
  const metrics: DashboardMetrics = useMemo(() => {
    const { meetings, events, bookings, users } = dashboardData;
    const nowDate = new Date();
    const thirtyDaysAgo = subMonths(nowDate, 1);

    // Recent data (last 30 days)
    const recentMeetings = [...meetings].filter((m) => new Date(m.createdAt || '') > thirtyDaysAgo);
    const recentEvents = [...events].filter((e) => new Date(e.createdAt) > thirtyDaysAgo);
    const recentBookings = [...bookings].filter((b) => new Date(b.createdAt) > thirtyDaysAgo);
    const recentUsers = [...users].filter((u) => new Date(u.createdAt) > thirtyDaysAgo);

    // Calculate revenue
    const totalRevenue = events.reduce((sum, event) => sum + (event.price || 0), 0);
    const recentRevenue = recentEvents.reduce((sum, event) => sum + (event.price || 0), 0);

    // Calculate growth rates
    const calculateGrowth = (recent: number, total: number): number => {
      if (total === 0) return 0;
      return Math.round((recent / (total - recent)) * 100);
    };

    return {
      totalUsers: users.length,
      totalEvents: events.length,
      totalBookings: bookings.length,
      totalMeetings: meetings.length,
      totalRevenue,
      recentUsers: recentUsers.length,
      recentEvents: recentEvents.length,
      recentBookings: recentBookings.length,
      recentMeetings: recentMeetings.length,
      recentRevenue,
      userGrowth: calculateGrowth(recentUsers.length, users.length),
      eventGrowth: calculateGrowth(recentEvents.length, events.length),
      bookingGrowth: calculateGrowth(recentBookings.length, bookings.length),
      meetingGrowth: calculateGrowth(recentMeetings.length, meetings.length),
      revenueGrowth: calculateGrowth(recentRevenue, totalRevenue),
    };
  }, [dashboardData]);

  // Generate events and bookings distribution chart
  const eventsBookingsChart = useMemo(() => {
    const { events, bookings } = dashboardData;

    // Calculate distribution data
    const totalEvents = events.length;
    const totalBookings = bookings.length;
    const totalItems = totalEvents + totalBookings;

    if (totalItems === 0) {
      return generateChartData(
        ['No Data'],
        [{ label: 'Distribution', data: [1], colorScheme: 'purple' as const }],
      );
    }

    return generateChartData(
      ['Events', 'Bookings'],
      [
        {
          label: 'Distribution',
          data: [totalEvents, totalBookings],
          colorScheme: 'purple' as const,
        },
      ],
    );
  }, [dashboardData]);

  // Generate user activity chart
  const userActivityChart = useMemo(() => {
    const { users, meetings } = dashboardData;
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, 'MMM'),
        start: startOfMonth(date),
        end: endOfMonth(date),
      };
    });

    const activityData = months.map(({ month, start, end }) => {
      const newUsers = [...users].filter((user) => {
        const userDate = new Date(user.createdAt);
        return userDate >= start && userDate <= end;
      });

      const newMeetings = [...meetings].filter((meeting) => {
        const meetingDate = new Date(meeting.createdAt || '');
        return meetingDate >= start && meetingDate <= end;
      });

      return {
        month,
        users: newUsers.length,
        meetings: newMeetings.length,
      };
    });

    return generateChartData(
      activityData.map((d) => d.month),
      [
        {
          label: 'New Users',
          data: activityData.map((d) => d.users),
          colorScheme: 'blue' as const,
        },
        {
          label: 'New Meetings',
          data: activityData.map((d) => d.meetings),
          colorScheme: 'success' as const,
        },
      ],
    );
  }, [dashboardData]);

  // Individual widget data processing
  const widgetData = useMemo(() => {
    const { meetings, events, users, bookings } = dashboardData;

    // Recent meetings data
    const recentMeetings = [...meetings]
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5);

    // Recent users data
    const recentUsers = [...users]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Recent events data
    const recentEvents = [...events]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Recent bookings data
    const recentBookings = [...bookings]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      meetings: recentMeetings,
      users: recentUsers,
      events: recentEvents,
      bookings: recentBookings,
    };
  }, [dashboardData]);

  // Dashboard header with metrics
  const dashboardHeader = useMemo(
    () => (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Heading level={1} className="h3 mb-1">
              X-Scheduler Dashboard
            </Heading>
            <p className="text-muted mb-0">
              Comprehensive platform analytics and meeting management
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm">
              <i className="bi bi-download me-1" />
              Export
            </Button>
            <Button variant="outline-secondary" size="sm">
              <i className="bi bi-gear me-1" />
              Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="row g-3">
          <div className="col-6 col-lg-3">
            <DashboardMetricCard
              title="Total Users"
              value={metrics.totalUsers}
              icon="bi-people"
              colorScheme="purple"
              trend={{
                value: metrics.userGrowth,
                isPositive: metrics.userGrowth > 0,
                label: 'vs last month',
              }}
            />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetricCard
              title="Total Meetings"
              value={metrics.totalMeetings}
              icon="bi-calendar-event"
              colorScheme="blue"
              trend={{
                value: metrics.meetingGrowth,
                isPositive: metrics.meetingGrowth > 0,
                label: 'vs last month',
              }}
            />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetricCard
              title="Total Events"
              value={metrics.totalEvents}
              icon="bi-calendar-event"
              colorScheme="success"
              trend={{
                value: metrics.eventGrowth,
                isPositive: metrics.eventGrowth > 0,
                label: 'vs last month',
              }}
            />
          </div>
          <div className="col-6 col-lg-3">
            <DashboardMetricCard
              title="Total Bookings"
              value={metrics.totalBookings}
              icon="bi-bookmark-check"
              colorScheme="warning"
              trend={{
                value: metrics.bookingGrowth,
                isPositive: metrics.bookingGrowth > 0,
                label: 'vs last month',
              }}
            />
          </div>
        </div>
      </div>
    ),
    [metrics],
  );

  // Main dashboard content
  const mainContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="text-center py-5">
          <Spinner size="lg" className="mb-3" />
          <p className="text-muted">Loading dashboard data...</p>
        </div>
      );
    }

    if (hasError) {
      return (
        <Alert variant="danger" className="mb-4">
          <h6>Error Loading Data</h6>
          <p className="mb-0">
            There was an error loading the dashboard data. Please try refreshing the page.
          </p>
        </Alert>
      );
    }

    return (
      <>
        {/* Charts Section */}
        <div className="row mb-4">
          <div className="col-12">
            <CalendarChart
              meetings={dashboardData.meetings}
              currentDate={currentDate}
              height={300}
            />
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-8">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Events & Bookings Distribution</h6>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center">
                    <div
                      className="bg-primary rounded me-2"
                      style={{ width: '12px', height: '12px' }}
                    ></div>
                    <small className="text-muted">Events</small>
                  </div>
                  <div className="d-flex align-items-center">
                    <div
                      className="bg-secondary rounded me-2"
                      style={{ width: '12px', height: '12px' }}
                    ></div>
                    <small className="text-muted">Bookings</small>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="row">
                  <div className="col-md-6">
                    <DoughnutChart data={eventsBookingsChart} height={200} />
                  </div>
                  <div className="col-md-6">
                    <div className="h-100 d-flex flex-column justify-content-center">
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-calendar-event text-primary me-2" />
                            <span className="fw-medium">Events</span>
                          </div>
                          <span className="fw-bold">{dashboardData.events.length}</span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-primary"
                            style={{
                              width: `${
                                dashboardData.events.length + dashboardData.bookings.length > 0
                                  ? (dashboardData.events.length /
                                      (dashboardData.events.length +
                                        dashboardData.bookings.length)) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <div className="d-flex align-items-center">
                            <i className="bi bi-bookmark-check text-secondary me-2" />
                            <span className="fw-medium">Bookings</span>
                          </div>
                          <span className="fw-bold">{dashboardData.bookings.length}</span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-secondary"
                            style={{
                              width: `${
                                dashboardData.events.length + dashboardData.bookings.length > 0
                                  ? (dashboardData.bookings.length /
                                      (dashboardData.events.length +
                                        dashboardData.bookings.length)) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-4">
            <Card>
              <Card.Header>
                <h6 className="mb-0">User Activity & Growth</h6>
              </Card.Header>
              <Card.Body>
                <BarChart data={userActivityChart} height={250} />
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* Independent Widgets Section */}
        <div className="row mb-4">
          {/* Recent Meetings Widget */}
          <div className="col-md-6 mb-4">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="bi bi-calendar-event text-primary me-2" />
                  Recent Meetings
                </h6>
                <Link to={paths.calendar} className="text-primary small text-decoration-none">
                  See All
                </Link>
              </Card.Header>
              <Card.Body className="p-0">
                {widgetData.meetings.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Meeting</th>
                          <th>Attendees</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {widgetData.meetings.map((meeting) => (
                          <tr key={meeting.id}>
                            <td>
                              <div className="fw-medium">{meeting.title}</div>
                              <small className="text-muted">
                                {meeting.description || 'No description'}
                              </small>
                            </td>
                            <td>
                              <span className="badge bg-primary">
                                {meeting.attendees?.length || 0}
                              </span>
                            </td>
                            <td>
                              <small>{format(new Date(meeting.startTime), 'MMM dd, HH:mm')}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-calendar-x fs-3 text-muted mb-2 d-block" />
                    <small className="text-muted">No meetings yet</small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>

          {/* Recent Users Widget */}
          <div className="col-md-6 mb-4">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="bi bi-people text-success me-2" />
                  Recent Users
                </h6>
                <Link to={paths.users} className="text-primary small text-decoration-none">
                  See All
                </Link>
              </Card.Header>
              <Card.Body className="p-0">
                {widgetData.users.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>User</th>
                          <th>Role</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {widgetData.users.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-person-circle text-success me-2" />
                                <div>
                                  <div className="fw-medium">{user.name}</div>
                                  <small className="text-muted">{user.email}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-secondary'}`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <small>{format(new Date(user.createdAt), 'MMM dd')}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-person-x fs-3 text-muted mb-2 d-block" />
                    <small className="text-muted">No users yet</small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>

        <div className="row mb-4">
          {/* Recent Events Widget */}
          <div className="col-md-6 mb-4">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="bi bi-calendar-check text-warning me-2" />
                  Recent Events
                </h6>
                <Link to={paths.events} className="text-primary small text-decoration-none">
                  See All
                </Link>
              </Card.Header>
              <Card.Body className="p-0">
                {widgetData.events.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Event</th>
                          <th>Price</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {widgetData.events.map((event) => (
                          <tr key={event.id}>
                            <td>
                              <div className="fw-medium">{event.title}</div>
                              <small className="text-muted">
                                {event.description || 'No description'}
                              </small>
                            </td>
                            <td>
                              <span className="fw-medium text-success">${event.price || 0}</span>
                            </td>
                            <td>
                              <small>{format(new Date(event.date), 'MMM dd')}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-calendar-x fs-3 text-muted mb-2 d-block" />
                    <small className="text-muted">No events yet</small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>

          {/* Recent Bookings Widget */}
          <div className="col-md-6 mb-4">
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <i className="bi bi-bookmark-check text-info me-2" />
                  Recent Bookings
                </h6>
                <Link to={paths.bookings} className="text-primary small text-decoration-none">
                  See All
                </Link>
              </Card.Header>
              <Card.Body className="p-0">
                {widgetData.bookings.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Event</th>
                          <th>User</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {widgetData.bookings.map((booking) => (
                          <tr key={booking.id}>
                            <td>
                              <div className="fw-medium">
                                {booking.event?.title || 'Unknown Event'}
                              </div>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <i className="bi bi-person-circle text-info me-1" />
                                <span>{booking.user?.name || 'Unknown User'}</span>
                              </div>
                            </td>
                            <td>
                              <small>{format(new Date(booking.createdAt), 'MMM dd')}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="bi bi-bookmark-x fs-3 text-muted mb-2 d-block" />
                    <small className="text-muted">No bookings yet</small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </div>
      </>
    );
  }, [
    isLoading,
    hasError,
    widgetData,
    dashboardData,
    currentDate,
    eventsBookingsChart,
    userActivityChart,
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
              <Link to="/calendar" className="btn btn-outline-primary">
                <i className="bi bi-calendar me-1" />
                View Calendar
              </Link>
              <Link to="/users" className="btn btn-outline-success">
                <i className="bi bi-people me-1" />
                Manage Users
              </Link>
              <Link to="/events" className="btn btn-outline-warning">
                <i className="bi bi-calendar-event me-1" />
                Manage Events
              </Link>
              <Button variant="outline-secondary" onClick={() => refetchMeetings()}>
                <i className="bi bi-arrow-clockwise me-1" />
                Refresh Data
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Recent Activity */}
        <Card>
          <Card.Header>
            <h6 className="mb-0">Recent Activity</h6>
          </Card.Header>
          <Card.Body>
            <div className="d-flex flex-column gap-2">
              <div className="small">
                <div className="fw-medium">New user registered</div>
                <div className="text-muted">2 minutes ago</div>
              </div>
              <div className="small">
                <div className="fw-medium">Meeting scheduled</div>
                <div className="text-muted">5 minutes ago</div>
              </div>
              <div className="small">
                <div className="fw-medium">Event booking made</div>
                <div className="text-muted">10 minutes ago</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    ),
    [refetchMeetings],
  );

  // Render using MeetingDashboardTemplate
  return (
    <MeetingDashboardTemplate
      dashboardHeader={dashboardHeader}
      mainContent={mainContent}
      quickActions={quickActions}
      showQuickActions={true}
    />
  );
};

export default DashboardPage;
