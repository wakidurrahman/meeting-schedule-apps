import React from 'react';

import Footer from '@/components/organisms/footer';
import Header from '@/components/organisms/header';
import { BaseComponentProps } from '@/types/components-common';
import { buildClassNames } from '@/utils/component';

export interface CalendarTemplateProps extends BaseComponentProps {
  /**
   * Calendar header content (navigation, view controls, create button)
   */
  calendarHeader?: React.ReactNode;
  /**
   * Main calendar content (calendar grid)
   */
  calendarContent: React.ReactNode;
  /**
   * Sidebar content (mini calendar, meeting list, filters)
   */
  sidebar?: React.ReactNode;
  /**
   * Modals and overlays (meeting creation, details, etc.)
   */
  modals?: React.ReactNode;
  /**
   * Show/hide sidebar
   */
  showSidebar?: boolean;
}

/**
 * Calendar Template
 *
 * Specialized template for calendar views with:
 * - Dedicated calendar header section
 * - Main calendar grid area
 * - Optional sidebar for mini calendar and meeting list
 * - Modal overlay area
 * - Optimized layout for calendar functionality
 */
export default function CalendarTemplate({
  children,
  className,
  calendarHeader,
  calendarContent,
  sidebar,
  modals,
  showSidebar = true,
}: CalendarTemplateProps): JSX.Element {
  const templateClasses = buildClassNames('t-calendar-template', className);

  return (
    <div className={templateClasses}>
      <Header />

      <main className="t-calendar-template__main">
        {/* Calendar Header - Navigation & Controls */}
        {calendarHeader && (
          <div className="t-calendar-template__header">
            <div className="container-fluid">{calendarHeader}</div>
          </div>
        )}

        {/* Main Calendar Content Area */}
        <div className="t-calendar-template__content">
          <div className="container-fluid">
            <div className="row g-0">
              {/* Calendar Grid */}
              <div
                className={buildClassNames('col', showSidebar ? 'col-lg-9 col-xl-10' : 'col-12')}
              >
                <div className="t-calendar-template__calendar">{calendarContent}</div>
              </div>

              {/* Sidebar */}
              {showSidebar && sidebar && (
                <div className="col-lg-3 col-xl-2">
                  <div className="t-calendar-template__sidebar">{sidebar}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Legacy children support */}
        {children && <div className="t-calendar-template__legacy">{children}</div>}
      </main>

      <Footer />

      {/* Modals & Overlays */}
      {modals}
    </div>
  );
}
