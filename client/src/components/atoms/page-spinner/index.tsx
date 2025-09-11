/**
 * Page Spinner Component
 *
 * Optimized loading spinner for lazy-loaded pages with skeleton layouts
 * Provides better UX during code splitting and page transitions
 */

import React from 'react';

import './index.scss';

import Spinner from '@/components/atoms/spinner';
import { buildClassNames } from '@/utils/component';

interface PageSpinnerProps {
  message?: string;
  className?: string;
  variant?: 'full-page' | 'content-area' | 'minimal';
  showSkeleton?: boolean;
}

/**
 * Full-page loading spinner for lazy-loaded routes
 */
export const PageSpinner: React.FC<PageSpinnerProps> = ({
  message = 'Loading...',
  className,
  variant = 'content-area',
  showSkeleton = false,
}) => {
  const spinnerClasses = buildClassNames(
    'page-spinner',
    variant === 'full-page' && 'page-spinner--full-page',
    variant === 'content-area' && 'page-spinner--content-area',
    variant === 'minimal' && 'page-spinner--minimal',
    className,
  );

  if (variant === 'full-page') {
    return (
      <div className={spinnerClasses}>
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75"
          style={{ zIndex: 9999 }}
        >
          <div className="text-center">
            <Spinner size="lg" color="primary" />
            <div className="mt-3">
              <p className="text-muted mb-0">{message}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className={spinnerClasses}>
        <div className="d-flex align-items-center justify-content-center py-4">
          <Spinner size="sm" color="primary" />
          <span className="ms-2 text-muted">{message}</span>
        </div>
      </div>
    );
  }

  // Default content-area variant
  return (
    <div className={spinnerClasses}>
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 text-center">
            <Spinner size="lg" color="primary" />
            <div className="mt-4">
              <h5 className="text-muted">{message}</h5>
              {showSkeleton && (
                <div className="mt-4">
                  <div className="placeholder-glow">
                    <div className="placeholder col-8 mb-2"></div>
                    <div className="placeholder col-6 mb-2"></div>
                    <div className="placeholder col-10"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Specialized loading components for different page types
 */
export const CalendarPageSpinner: React.FC = () => (
  <PageSpinner message="Loading Calendar..." variant="content-area" showSkeleton />
);

export const DashboardPageSpinner: React.FC = () => (
  <PageSpinner message="Loading Dashboard..." variant="content-area" showSkeleton />
);

export const UsersPageSpinner: React.FC = () => (
  <PageSpinner message="Loading Users..." variant="content-area" />
);

export const EventsPageSpinner: React.FC = () => (
  <PageSpinner message="Loading Events..." variant="content-area" />
);

export const BookingsPageSpinner: React.FC = () => (
  <PageSpinner message="Loading Bookings..." variant="content-area" />
);

export const ProfilePageSpinner: React.FC = () => (
  <PageSpinner message="Loading Profile..." variant="content-area" />
);

export const AuthPageSpinner: React.FC = () => (
  <PageSpinner message="Loading..." variant="minimal" />
);

export default PageSpinner;
