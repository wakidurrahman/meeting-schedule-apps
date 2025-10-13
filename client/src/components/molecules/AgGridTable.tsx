/**
 * AG Grid Table Component
 *
 * A reusable table component built with AG Grid React
 * Provides features like sorting, filtering, pagination, and column resizing
 */

import type { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
// @ts-expect-error - AG Grid types are installed but may not be recognized by linter
import { AgGridReact } from 'ag-grid-react';
import React, { useMemo } from 'react';

// Import AG Grid styles
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export interface AgGridTableProps<T = Record<string, unknown>> {
  /** Column definitions for the grid */
  columnDefs: ColDef<T>[];
  /** Data to display in the grid */
  rowData: T[];
  /** Enable pagination (default: true) */
  pagination?: boolean;
  /** Number of rows per page (default: 10) */
  paginationPageSize?: number;
  /** Available page sizes for pagination (default: [10, 25, 50, 100]) */
  paginationPageSizeSelector?: number[] | boolean;
  /** Enable default column sorting (default: true) */
  sortable?: boolean;
  /** Enable default column filtering (default: true) */
  filterable?: boolean;
  /** Enable default column resizing (default: true) */
  resizable?: boolean;
  /** Grid height (default: 500px) */
  height?: string | number;
  /** Loading state */
  loading?: boolean;
  /** Callback when grid is ready */
  onGridReady?: (event: GridReadyEvent) => void;
  /** Additional grid options */
  gridOptions?: GridOptions;
  /** Custom class name for styling */
  className?: string;
  /** Theme (default: 'alpine') */
  theme?: 'alpine' | 'balham' | 'material';
}

/**
 * AgGridTable Component
 *
 * @example
 * ```tsx
 * const columnDefs = [
 *   { field: 'id', headerName: 'ID' },
 *   { field: 'name', headerName: 'Name' },
 * ];
 *
 * <AgGridTable
 *   columnDefs={columnDefs}
 *   rowData={data}
 *   pagination={true}
 * />
 * ```
 */
export const AgGridTable = <T extends Record<string, unknown>>({
  columnDefs,
  rowData,
  pagination = true,
  paginationPageSize = 10,
  paginationPageSizeSelector = [10, 25, 50, 100],
  sortable = true,
  filterable = true,
  resizable = true,
  height = '500px',
  loading = false,
  onGridReady,
  gridOptions = {},
  className = '',
  theme = 'alpine',
}: AgGridTableProps<T>) => {
  // Default column definitions with sorting, filtering, and resizing
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable,
      filter: filterable,
      resizable,
      flex: 1,
      minWidth: 100,
    }),
    [sortable, filterable, resizable],
  );

  // Merge grid options
  const mergedGridOptions: GridOptions = useMemo(
    () => ({
      ...gridOptions,
      defaultColDef,
      pagination,
      paginationPageSize,
      paginationPageSizeSelector,
      animateRows: true,
      rowSelection: 'multiple',
      suppressCellFocus: true,
      enableCellTextSelection: true,
      loading,
    }),
    [
      gridOptions,
      defaultColDef,
      pagination,
      paginationPageSize,
      paginationPageSizeSelector,
      loading,
    ],
  );

  return (
    <div className={`ag-theme-${theme} ${className}`} style={{ height, width: '100%' }}>
      <AgGridReact<T>
        columnDefs={columnDefs}
        rowData={rowData}
        {...mergedGridOptions}
        onGridReady={onGridReady}
      />
    </div>
  );
};

export default AgGridTable;
