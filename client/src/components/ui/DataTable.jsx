import React from 'react';
import { Search, ChevronLeft, ChevronRight, Inbox, Loader2 } from 'lucide-react';

export const DataTable = ({
  columns,
  data = [],
  isLoading = false,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filters,
  pagination,
  onPageChange,
  emptyMessage = 'No records found matching criteria.',
}) => {
  return (
    <div className="bg-white dark:bg-navy-900 rounded-2xl border border-slate-200 dark:border-navy-800 shadow-soft overflow-hidden">
      {/* Top Filter Bar */}
      {(onSearchChange || filters) && (
        <div className="p-4 border-b border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {onSearchChange && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="search"
                aria-label={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
            </div>
          )}

          {filters && <div className="flex items-center gap-2 flex-wrap">{filters}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/75 dark:bg-navy-950/50 border-b border-slate-100 dark:border-navy-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 sm:px-6 py-3.5 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-navy-800/60">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
                    <span className="text-xs text-slate-400">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                    <Inbox className="w-10 h-10 stroke-[1.5]" />
                    <p className="text-xs sm:text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr
                  key={row._id || rowIdx}
                  className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors"
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={`px-4 sm:px-6 py-3.5 ${col.className || ''}`}>
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="px-4 sm:px-6 py-3 border-t border-slate-100 dark:border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing page <strong className="text-slate-800 dark:text-slate-200">{pagination.page}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{pagination.totalPages}</strong> (
            {pagination.total} records)
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
