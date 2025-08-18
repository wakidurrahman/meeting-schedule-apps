import React from 'react';

import Footer from '@/components/organisms/footer';
import Header from '@/components/organisms/header';
import { BaseComponentProps } from '@/types/components-common';
import { buildClassNames } from '@/utils/component';

export interface MeetingDetailTemplateProps extends BaseComponentProps {
  /**
   * Breadcrumb navigation
   */
  breadcrumb?: React.ReactNode;
  /**
   * Meeting header with title, status, and actions
   */
  meetingHeader?: React.ReactNode;
  /**
   * Main meeting content (details, description, attendees)
   */
  meetingContent: React.ReactNode;
  /**
   * Meeting sidebar (quick info, related meetings, actions)
   */
  sidebar?: React.ReactNode;
  /**
   * Modals and overlays
   */
  modals?: React.ReactNode;
  /**
   * Show/hide sidebar
   */
  showSidebar?: boolean;
  /**
   * Centered layout (for edit forms)
   */
  centered?: boolean;
}

/**
 * Meeting Detail Template
 *
 * Specialized template for meeting detail/edit pages with:
 * - Breadcrumb navigation
 * - Meeting header with actions
 * - Main content area for meeting details
 * - Optional sidebar for related info
 * - Centered layout option for forms
 * - Modal overlay area
 */
export default function MeetingDetailTemplate({
  children,
  className,
  breadcrumb,
  meetingHeader,
  meetingContent,
  sidebar,
  modals,
  showSidebar = false,
  centered = false,
}: MeetingDetailTemplateProps): JSX.Element {
  const templateClasses = buildClassNames('t-meeting-detail-template', className);

  return (
    <div className={templateClasses}>
      <Header />

      <main className="t-meeting-detail-template__main py-4">
        <div className={centered ? 'container' : 'container-fluid'}>
          {/* Breadcrumb */}
          {breadcrumb && (
            <div className="t-meeting-detail-template__breadcrumb mb-3">{breadcrumb}</div>
          )}

          {/* Meeting Header */}
          {meetingHeader && (
            <div className="t-meeting-detail-template__header mb-4">{meetingHeader}</div>
          )}

          {/* Main Content */}
          <div className={buildClassNames('row', centered && 'justify-content-center')}>
            {/* Meeting Content */}
            <div
              className={buildClassNames(
                'col',
                centered ? 'col-md-8 col-lg-6' : showSidebar ? 'col-lg-8 col-xl-9' : 'col-12',
              )}
            >
              <div className="t-meeting-detail-template__content">{meetingContent}</div>
            </div>

            {/* Sidebar */}
            {showSidebar && !centered && sidebar && (
              <div className="col-lg-4 col-xl-3">
                <div className="t-meeting-detail-template__sidebar">{sidebar}</div>
              </div>
            )}
          </div>

          {/* Legacy children support */}
          {children && <div className="t-meeting-detail-template__legacy mt-4">{children}</div>}
        </div>
      </main>

      <Footer />

      {/* Modals & Overlays */}
      {modals}
    </div>
  );
}
