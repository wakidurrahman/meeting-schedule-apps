import React from 'react';

import Footer from '@/components/organisms/footer';
import Header from '@/components/organisms/header';
import { BaseComponentProps } from '@/types/components-common';
import { buildClassNames } from '@/utils/component';

export interface MeetingDashboardTemplateProps extends BaseComponentProps {
  /**
   * Dashboard header with title, stats, and action buttons
   */
  dashboardHeader?: React.ReactNode;
  /**
   * Main content area (meeting tables, cards, lists)
   */
  mainContent: React.ReactNode;
  /**
   * Quick actions sidebar (create meeting, filters, upcoming meetings)
   */
  quickActions?: React.ReactNode;
  /**
   * Modals and overlays
   */
  modals?: React.ReactNode;
  /**
   * Show/hide quick actions sidebar
   */
  showQuickActions?: boolean;
}

/**
 * Meeting Dashboard Template
 *
 * Specialized template for meeting management dashboard with:
 * - Dashboard header with stats and actions
 * - Main content area for meeting lists/tables
 * - Quick actions sidebar
 * - Modal overlay area
 * - Optimized for meeting management workflows
 */
export default function MeetingDashboardTemplate({
  children,
  className,
  dashboardHeader,
  mainContent,
  quickActions,
  modals,
  showQuickActions = true,
}: MeetingDashboardTemplateProps): JSX.Element {
  const templateClasses = buildClassNames('t-meeting-dashboard-template', className);

  return (
    <div className={templateClasses}>
      <Header />

      <main className="t-meeting-dashboard-template__main py-4">
        <div className="container-fluid">
          {/* Dashboard Header */}
          {dashboardHeader && (
            <div className="t-meeting-dashboard-template__header mb-4">{dashboardHeader}</div>
          )}

          {/* Main Dashboard Content */}
          <div className="row">
            {/* Main Content Area */}
            <div
              className={buildClassNames('col', showQuickActions ? 'col-lg-9 col-xl-9' : 'col-12')}
            >
              <div className="t-meeting-dashboard-template__content">{mainContent}</div>
            </div>

            {/* Quick Actions Sidebar */}
            {showQuickActions && quickActions && (
              <div className="col-lg-3 col-xl-3">
                <div className="t-meeting-dashboard-template__sidebar">{quickActions}</div>
              </div>
            )}
          </div>

          {/* Legacy children support */}
          {children && <div className="t-meeting-dashboard-template__legacy mt-4">{children}</div>}
        </div>
      </main>

      <Footer />

      {/* Modals & Overlays */}
      {modals}
    </div>
  );
}
