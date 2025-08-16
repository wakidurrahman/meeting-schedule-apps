import React from 'react';

import { TableRowSkeleton } from '../skeleton';

type Column<T> = {
  key: keyof T;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
};

type Action<T> = {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  onClick?: (row: T) => void;
};

type TableProps<T> = {
  columns: Array<Column<T>>;
  data: Array<T>;
  /**
   * Static actions applied to every row (deprecated). Use rowActions instead.
   */
  actions?: Array<Action<T>>;
  /**
   * A function that returns actions for a specific row.
   */
  rowActions?: (row: T) => Array<Action<T>>;
  /**
   * Show loading skeleton while preserving table structure
   */
  loading?: boolean;
  /**
   * Number of skeleton rows to show during loading
   */
  skeletonRows?: number;
};

export default function BootstrapTable<T extends Record<string, unknown>>({
  columns,
  data,
  actions = [],
  rowActions,
  loading = false,
  skeletonRows = 5,
}: TableProps<T>): JSX.Element {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} scope="col">
                {col.header}
              </th>
            ))}
            {(rowActions || actions.length > 0) && (
              <th scope="col" style={{ width: 180 }}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            // Show skeleton rows during loading
            Array.from({ length: skeletonRows }, (_, idx) => (
              <TableRowSkeleton
                key={`skeleton-${idx}`}
                columns={columns.length + (rowActions || actions.length > 0 ? 1 : 0)}
              />
            ))
          ) : data.length > 0 ? (
            // Show actual data
            data.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={String(col.key)}>
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
                {(rowActions || actions.length > 0) && (
                  <td>
                    <div className="d-flex gap-2">
                      {(rowActions ? rowActions(row) : actions).map((a, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`btn btn-sm btn-${a.variant ?? 'primary'}`}
                          onClick={() => a.onClick?.(row)}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))
          ) : (
            // Show empty state
            <tr>
              <td
                colSpan={columns.length + (rowActions || actions.length > 0 ? 1 : 0)}
                className="text-center py-4"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
