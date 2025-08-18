/**
 * Meeting Scheduler Demo Page
 *
 * Demo page to showcase the new Calendar and Dashboard pages
 * This serves as a navigation hub for testing the new functionality
 */

import React from 'react';
import { Link } from 'react-router-dom';

import Alert from '@/components/atoms/alert';
import Heading from '@/components/atoms/heading';
import Card from '@/components/molecules/card';
import BaseTemplate from '@/components/templates/base-templates';

const MeetingSchedulerDemo: React.FC = () => {
  return (
    <BaseTemplate>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Header */}
            <div className="text-center mb-5">
              <Heading level={1} className="display-4 text-primary mb-3">
                🎉 Meeting Scheduler Ready!
              </Heading>
              <p className="lead text-muted">
                Your complete meeting management system has been successfully implemented.
                <br />
                Explore the new Calendar and Dashboard features below.
              </p>
            </div>

            {/* Success Alert */}
            <Alert variant="success" className="mb-4">
              <div className="d-flex align-items-center">
                <i className="bi bi-check-circle-fill fs-4 me-3" />
                <div>
                  <h6 className="mb-1">Implementation Complete</h6>
                  <small>
                    Calendar organism, specialized templates, utilities, and page components are
                    ready for production use.
                  </small>
                </div>
              </div>
            </Alert>

            {/* Main Demo Cards */}
            <div className="row g-4 mb-5">
              {/* Calendar Page */}
              <div className="col-md-6">
                <Card className="h-100 border-primary">
                  <Card.Body className="text-center p-4">
                    <div className="text-primary mb-3">
                      <i className="bi bi-calendar-month display-1" />
                    </div>
                    <h5 className="card-title">Calendar View</h5>
                    <p className="card-text">
                      Full-featured calendar interface with meeting display, navigation, and
                      interaction. Built using CalendarTemplate and Calendar organism.
                    </p>
                    <div className="d-grid gap-2">
                      <Link to="/calendar" className="btn btn-primary">
                        <i className="bi bi-calendar me-2" />
                        Open Calendar
                      </Link>
                      <Link to="/dummy/organisms" className="btn btn-outline-primary btn-sm">
                        View Demo Components
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              {/* Dashboard Page */}
              <div className="col-md-6">
                <Card className="h-100 border-success">
                  <Card.Body className="text-center p-4">
                    <div className="text-success mb-3">
                      <i className="bi bi-grid-3x3-gap display-1" />
                    </div>
                    <h5 className="card-title">Meeting Dashboard</h5>
                    <p className="card-text">
                      Management dashboard with meeting statistics, recent meetings table, and quick
                      actions. Built using MeetingDashboardTemplate.
                    </p>
                    <div className="d-grid gap-2">
                      <Link to="/dashboard" className="btn btn-success">
                        <i className="bi bi-speedometer2 me-2" />
                        Open Dashboard
                      </Link>
                      <Link to="/dummy/templates" className="btn btn-outline-success btn-sm">
                        View Template Demos
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* Features Overview */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-stars me-2" />
                  Features Implemented
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="row g-3">
                  <div className="col-md-6">
                    <h6 className="text-primary">
                      <i className="bi bi-calendar-month me-2" />
                      Calendar Features
                    </h6>
                    <ul className="list-unstyled">
                      <li>✅ Monthly grid with meeting display</li>
                      <li>✅ Interactive date selection</li>
                      <li>✅ Meeting event chips with status</li>
                      <li>✅ Navigation controls (prev/next/today)</li>
                      <li>✅ View switching (month/week/day/year)</li>
                      <li>✅ Loading states and error handling</li>
                      <li>✅ Mobile-responsive design</li>
                      <li>✅ JST timezone support</li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-success">
                      <i className="bi bi-speedometer2 me-2" />
                      Dashboard Features
                    </h6>
                    <ul className="list-unstyled">
                      <li>✅ Meeting statistics cards</li>
                      <li>✅ Recent meetings table</li>
                      <li>✅ Quick actions sidebar</li>
                      <li>✅ Upcoming meetings list</li>
                      <li>✅ Responsive layout</li>
                      <li>✅ Modal integration</li>
                      <li>✅ GraphQL data integration</li>
                      <li>✅ Professional UI design</li>
                    </ul>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Architecture Info */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-diagram-3 me-2" />
                  Architecture Highlights
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="row g-3">
                  <div className="col-md-4">
                    <h6 className="text-info">Templates</h6>
                    <ul className="list-unstyled small">
                      <li>• CalendarTemplate</li>
                      <li>• MeetingDashboardTemplate</li>
                      <li>• MeetingDetailTemplate</li>
                    </ul>
                  </div>
                  <div className="col-md-4">
                    <h6 className="text-warning">Components</h6>
                    <ul className="list-unstyled small">
                      <li>• Calendar organism (6 components)</li>
                      <li>• ReactSelectField atom</li>
                      <li>• Modal integration</li>
                      <li>• Table & Card molecules</li>
                    </ul>
                  </div>
                  <div className="col-md-4">
                    <h6 className="text-danger">Utilities</h6>
                    <ul className="list-unstyled small">
                      <li>• 33 calendar/meeting functions</li>
                      <li>• Complete TypeScript types</li>
                      <li>• JST timezone integration</li>
                      <li>• Conflict detection logic</li>
                    </ul>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Next Steps */}
            <Card className="border-warning">
              <Card.Header className="bg-warning-subtle">
                <h5 className="mb-0">
                  <i className="bi bi-rocket me-2" />
                  Ready for Next Phase
                </h5>
              </Card.Header>
              <Card.Body>
                <p className="mb-3">
                  The foundation is complete! The next development priorities are:
                </p>
                <div className="row g-2">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-primary me-2">1</span>
                      <span>Meeting Creation/Edit Modals</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-primary me-2">2</span>
                      <span>Enhanced GraphQL Queries</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-secondary me-2">3</span>
                      <span>Conflict Detection Integration</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-secondary me-2">4</span>
                      <span>Real-time Updates</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Navigation */}
            <div className="text-center mt-5">
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/calendar" className="btn btn-primary btn-lg">
                  <i className="bi bi-calendar me-2" />
                  Try Calendar
                </Link>
                <Link to="/dashboard" className="btn btn-success btn-lg">
                  <i className="bi bi-speedometer2 me-2" />
                  Try Dashboard
                </Link>
                <Link to="/dummy" className="btn btn-outline-secondary">
                  <i className="bi bi-grid me-2" />
                  All Components
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BaseTemplate>
  );
};

export default MeetingSchedulerDemo;
