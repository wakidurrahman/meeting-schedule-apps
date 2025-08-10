import React from 'react';

type Column<T> = {
  key: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
};

type Action = {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  onClick?: () => void;
};

type Props<T> = {
  columns: Column<T>[];
  data: T[];
  actions?: Action[];
};

export default function BootstrapTable<T extends Record<string, unknown>>({
  columns,
  data,
  actions = [],
}: Props<T>): JSX.Element {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-bordered">
        <thead className="table-light">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} scope="col">
                {col.header}
              </th>
            ))}
            {actions.length > 0 && (
              <th scope="col" style={{ width: 180 }}>
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx}>
              {columns.map((col) => (
                <td key={String(col.key)}>
                  {col.render ? col.render(row) : String(row[col.key] ?? '')}
                </td>
              ))}
              {actions.length > 0 && (
                <td>
                  <div className="d-flex gap-2">
                    {actions.map((a, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`btn btn-sm btn-${a.variant ?? 'primary'}`}
                        onClick={a.onClick}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                className="text-center"
              >
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
