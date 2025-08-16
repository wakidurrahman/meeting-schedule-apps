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

  const goTo = (item: number) => {
    const next = Math.min(Math.max(1, item), Math.max(1, pageCount));
    console.log('next', next);
    if (next !== currentPage) onPageChange(next);
  };

  return (
    <nav aria-label={ariaLabel || 'Page navigation'}>
      <ul className="pagination">
        <li className={`page-item ${isFirst ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => goTo(currentPage - 1)}>
            Previous
          </button>
        </li>
        {Array.from({ length: Math.max(1, pageCount) }, (_, i) => i + 1).map((item) => (
          <li key={item} className={`page-item ${item === currentPage ? 'active' : ''}`}>
            <button
              className="page-link"
              aria-current={item === currentPage ? 'page' : undefined}
              onClick={() => goTo(item)}
            >
              {item}
            </button>
          </li>
        ))}
        <li className={`page-item ${isLast ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => goTo(currentPage + 1)}>
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}
