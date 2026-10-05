import React from 'react';

/**
 * GENERIC REUSABLE COMPONENT (Q2.e):
 * DataTable<T> is a genuinely polymorphic table component that accepts any data entity type T.
 * Each column defines a header label, optional key accessor (keyof T), custom cell render function,
 * and visual alignment properties.
 */
export interface ColumnDef<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  rowStyle?: (item: T) => React.CSSProperties | undefined;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No data available',
  onRowClick,
  rowStyle,
}: DataTableProps<T>): React.ReactElement {
  if (isLoading) {
    return (
      <div className="card" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3.5rem 2rem',
        gap: '0.85rem',
      }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Loading table records...
        </p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card" style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        color: 'var(--text-secondary)',
      }}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                style={{
                  textAlign: col.align || 'left',
                  ...col.style,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIdx) => (
            <tr
              key={keyExtractor(item, rowIdx)}
              onClick={() => onRowClick && onRowClick(item)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                ...(rowStyle ? rowStyle(item) : {}),
              }}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  style={{
                    textAlign: col.align || 'left',
                    ...col.style,
                  }}
                >
                  {col.cell
                    ? col.cell(item, rowIdx)
                    : col.accessorKey
                    ? String(item[col.accessorKey] ?? '')
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
