import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Re-export the main Skeleton component
export { Skeleton };

/**
 * Skeleton wrapper with theme support
 * ✅ Complete! Here's what I've implemented:
 * ✅ Cards - Perfect skeleton cards matching your user cards
 * ✅ Table Data - Complete table skeletons with configurable rows/columns
 * ✅ Lists - List items with optional avatars
 * ✅ Forms - Form fields, buttons, labels
 * ✅ Navigation - Navbar, menu items
 * ✅ Articles - Blog posts, content sections
 * ✅ Page Layouts - Complete page skeletons with sidebars
 * ✅ Custom Elements - Any shape, size, animation
 */
export const SkeletonWrapper = ({
  children,
  isDark = false,
}: {
  children: React.ReactNode;
  isDark?: boolean;
}) => (
  <SkeletonTheme
    baseColor={isDark ? '#202020' : '#ebebeb'}
    highlightColor={isDark ? '#444' : '#f5f5f5'}
  >
    {children}
  </SkeletonTheme>
);

/**
 * User Card Skeleton - matches your current user cards
 */
export const UserCardSkeleton = () => (
  <div className="card h-100 border-secondary shadow-sm">
    {/* Card Header */}
    <div className="card-header bg-light">
      <div className="mb-2">
        <Skeleton height={20} width="70%" />
      </div>
      <Skeleton height={14} width="85%" />
    </div>

    {/* Card Body */}
    <div className="card-body">
      <div className="mb-2">
        <Skeleton height={14} width="90%" />
      </div>
      <div className="mb-2">
        <Skeleton height={14} width="75%" />
      </div>
      <div className="mb-2">
        <Skeleton height={14} width="60%" />
      </div>
      <div className="mb-2">
        <Skeleton height={14} width="80%" />
      </div>
      <div>
        <Skeleton height={14} width="85%" />
      </div>
    </div>

    {/* Card Footer */}
    <div className="card-footer bg-light">
      <div className="d-flex gap-2 justify-content-end">
        <Skeleton height={30} width={50} />
        <Skeleton height={30} width={50} />
        <Skeleton height={30} width={60} />
      </div>
    </div>
  </div>
);

/**
 * Table Row Skeleton
 */
export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
  <tr>
    {Array.from({ length: columns }, (_, index) => (
      <td key={index} className="py-3">
        <Skeleton height={16} />
      </td>
    ))}
  </tr>
);

/**
 * Complete Table Skeleton
 */
export const TableSkeleton = ({
  rows = 10,
  columns = 5,
  showHeader = true,
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}) => (
  <div className="table-responsive">
    <table className="table">
      {showHeader && (
        <thead>
          <tr>
            {Array.from({ length: columns }, (_, index) => (
              <th key={index} className="py-3">
                <Skeleton height={18} width="80%" />
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>
        {Array.from({ length: rows }, (_, index) => (
          <TableRowSkeleton key={index} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

/**
 * List Item Skeleton
 */
export const ListItemSkeleton = ({ showAvatar = false }: { showAvatar?: boolean }) => (
  <div className="d-flex align-items-center p-3 border-bottom">
    {showAvatar && (
      <div className="me-3">
        <Skeleton circle height={40} width={40} />
      </div>
    )}
    <div className="flex-grow-1">
      <div className="mb-1">
        <Skeleton height={16} width="60%" />
      </div>
      <Skeleton height={14} width="80%" />
    </div>
    <div className="ms-auto">
      <Skeleton height={12} width={60} />
    </div>
  </div>
);

/**
 * Complete List Skeleton
 */
export const ListSkeleton = ({
  items = 8,
  showAvatar = false,
}: {
  items?: number;
  showAvatar?: boolean;
}) => (
  <div className="list-group">
    {Array.from({ length: items }, (_, index) => (
      <ListItemSkeleton key={index} showAvatar={showAvatar} />
    ))}
  </div>
);

/**
 * Form Field Skeleton
 */
export const FormFieldSkeleton = ({ hasLabel = true }: { hasLabel?: boolean }) => (
  <div className="mb-3">
    {hasLabel && (
      <div className="mb-2">
        <Skeleton height={16} width="30%" />
      </div>
    )}
    <Skeleton height={38} borderRadius={4} />
  </div>
);

/**
 * Complete Form Skeleton
 */
export const FormSkeleton = ({ fields = 5 }: { fields?: number }) => (
  <div>
    {Array.from({ length: fields }, (_, index) => (
      <FormFieldSkeleton key={index} />
    ))}
    <div className="d-flex gap-2 justify-content-end mt-4">
      <Skeleton height={38} width={80} />
      <Skeleton height={38} width={100} />
    </div>
  </div>
);

/**
 * Navigation Skeleton
 */
export const NavSkeleton = ({ items = 4 }: { items?: number }) => (
  <nav className="navbar navbar-expand-lg navbar-light bg-light">
    <div className="container">
      <Skeleton height={24} width={150} />
      <div className="d-flex gap-4">
        {Array.from({ length: items }, (_, index) => (
          <Skeleton key={index} height={20} width={80} />
        ))}
      </div>
    </div>
  </nav>
);

/**
 * Article/Blog Post Skeleton
 */
export const ArticleSkeleton = () => (
  <article className="mb-4">
    <div className="mb-3">
      <Skeleton height={32} width="80%" className="mb-2" />
      <div className="d-flex align-items-center gap-3">
        <Skeleton circle height={32} width={32} />
        <div>
          <Skeleton height={14} width={100} className="mb-1" />
          <Skeleton height={12} width={80} />
        </div>
      </div>
    </div>
    <div className="mb-3">
      <Skeleton height={200} />
    </div>
    <div>
      <Skeleton count={4} height={16} className="mb-2" />
      <Skeleton height={16} width="60%" />
    </div>
  </article>
);

/**
 * Users Page Skeleton - specifically for your users page
 */
export const UsersPageSkeleton = ({ count = 12 }: { count?: number }) => (
  <div className="container mt-4">
    <div className="row">
      <div className="col-12">
        {/* Header Skeleton */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Skeleton height={40} width={200} className="mb-2" />
            <Skeleton height={16} width={300} />
          </div>
          <div>
            <Skeleton height={38} width={80} />
          </div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 g-3 mb-4">
          {Array.from({ length: count }, (_, index) => (
            <div key={index} className="col">
              <UserCardSkeleton />
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className="d-flex justify-content-center mb-4">
          <div className="d-flex gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} height={38} width={38} />
            ))}
          </div>
        </div>

        {/* Results Summary Skeleton */}
        <div className="text-center">
          <Skeleton height={14} width={200} />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Generic Page Skeleton with customizable sections
 */
export const PageSkeleton = ({
  showHeader = true,
  showNavigation = true,
  sections = 3,
  showSidebar = false,
}: {
  showHeader?: boolean;
  showNavigation?: boolean;
  sections?: number;
  showSidebar?: boolean;
}) => (
  <div>
    {showNavigation && <NavSkeleton />}

    {showHeader && (
      <div className="container mt-4 mb-4">
        <Skeleton height={48} width="50%" className="mb-2" />
        <Skeleton height={20} width="70%" />
      </div>
    )}

    <div className="container">
      <div className="row">
        <div className={showSidebar ? 'col-md-8' : 'col-12'}>
          {Array.from({ length: sections }, (_, index) => (
            <div key={index} className="mb-4">
              <Skeleton height={24} width="40%" className="mb-3" />
              <Skeleton count={3} height={16} className="mb-2" />
              <Skeleton height={16} width="80%" />
            </div>
          ))}
        </div>

        {showSidebar && (
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <Skeleton height={20} width="60%" className="mb-3" />
                <Skeleton count={4} height={14} className="mb-2" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default Skeleton;
