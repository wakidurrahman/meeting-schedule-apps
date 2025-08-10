import React from 'react';

export type PaginationProps = {
  currentPage: number;
  pageCount: number; // total number of pages, minimum 1
  onPageChange: (page: number) => void;
  ariaLabel?: string;
};

export default function Pagination({
  currentPage,
  pageCount,
  onPageChange,
  ariaLabel = 'Page navigation',
}: PaginationProps): JSX.Element {
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= pageCount;

  const goTo = (n: number) => {
    const next = Math.min(Math.max(1, n), Math.max(1, pageCount));
    if (next !== currentPage) onPageChange(next);
  };

  return (
    <nav aria-label={ariaLabel}>
      <ul className="pagination">
        <li className={`page-item ${isFirst ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => goTo(currentPage - 1)}>
            Previous
          </button>
        </li>
        {Array.from({ length: Math.max(1, pageCount) }, (_, i) => i + 1).map(
          (n) => (
            <li
              key={n}
              className={`page-item ${n === currentPage ? 'active' : ''}`}
            >
              <button
                className="page-link"
                aria-current={n === currentPage ? 'page' : undefined}
                onClick={() => goTo(n)}
              >
                {n}
              </button>
            </li>
          )
        )}
        <li className={`page-item ${isLast ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => goTo(currentPage + 1)}>
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
