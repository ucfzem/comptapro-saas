'use client';

import { useState, useMemo, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

type Column<T> = {
  key: string;
  label: string;
  render?: (row: T, index: number) => React.ReactNode;
};

type DataTableProps<T extends Record<string, any>> = {
  columns: Column<T>[];
  data: T[];
  onSelectionChange?: (selectedIds: Set<string>) => void;
  getRowId?: (row: T) => string;
};

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onSelectionChange,
  getRowId = (row: T) => String(row.id ?? row.key ?? JSON.stringify(row)),
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const handleSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setSortDir('asc');
      return key;
    });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      onSelectionChange?.(next);
      return next;
    });
  }, [onSelectionChange]);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === data.length) {
        onSelectionChange?.(new Set());
        return new Set();
      }
      const all = new Set(data.map(getRowId));
      onSelectionChange?.(all);
      return all;
    });
  }, [data, getRowId, onSelectionChange]);

  const allSelected = data.length > 0 && selectedIds.size === data.length;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-800/80 backdrop-blur-sm">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white transition-colors"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key ? (
                      sortDir === 'asc' ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sortedData.map((row, idx) => {
              const rowId = getRowId(row);
              const isSelected = selectedIds.has(rowId);
              return (
                <tr
                  key={rowId}
                  className={`transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(rowId)}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3 text-slate-700 dark:text-slate-300"
                    >
                      {col.render ? col.render(row, idx) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div className="flex items-center justify-center py-12 text-slate-400 dark:text-slate-500">
          Aucune donnée disponible
        </div>
      )}
    </div>
  );
}
