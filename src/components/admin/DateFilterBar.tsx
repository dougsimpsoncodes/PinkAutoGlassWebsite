'use client';

import { RefreshCw } from 'lucide-react';
import { useSync } from '@/contexts/SyncContext';

export type DateFilter = 'today' | 'yesterday' | '7days' | '30days' | 'all';
export const ALL_DATE_FILTERS: DateFilter[] = ['today', 'yesterday', '7days', '30days', 'all'];

interface DateFilterBarProps {
  dateFilter: DateFilter;
  onFilterChange: (filter: DateFilter) => void;
  // onSync is deprecated - now uses global sync context
  onSync?: () => void;
  syncing?: boolean;
  syncProgress?: string;
  dateDisplay?: string;
  color?: 'pink' | 'blue' | 'cyan' | 'gray';
  // Set to true to show sync button (uses global sync)
  showSync?: boolean;
}

const colorClasses = {
  pink: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-800',
    activeBtn: 'bg-pink-600 text-white',
    inactiveBtn: 'bg-white text-pink-800 hover:bg-pink-100 border border-pink-300',
    syncBtn: 'bg-pink-600 text-white hover:bg-pink-700 disabled:bg-pink-400',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    activeBtn: 'bg-blue-600 text-white',
    inactiveBtn: 'bg-white text-blue-800 hover:bg-blue-100 border border-blue-300',
    syncBtn: 'bg-pink-600 text-white hover:bg-pink-700 disabled:bg-pink-400',
  },
  cyan: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-800',
    activeBtn: 'bg-cyan-600 text-white',
    inactiveBtn: 'bg-white text-cyan-800 hover:bg-cyan-100 border border-cyan-300',
    syncBtn: 'bg-pink-600 text-white hover:bg-pink-700 disabled:bg-pink-400',
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-800',
    activeBtn: 'bg-gray-700 text-white',
    inactiveBtn: 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-300',
    syncBtn: 'bg-pink-600 text-white hover:bg-pink-700 disabled:bg-pink-400',
  },
};

export default function DateFilterBar({
  dateFilter,
  onFilterChange,
  onSync,
  syncing: syncingProp = false,
  syncProgress: syncProgressProp = '',
  dateDisplay,
  color = 'pink',
  showSync = true,
}: DateFilterBarProps) {
  const colors = colorClasses[color];

  // Use global sync context if available, otherwise fall back to props
  let globalSync: ReturnType<typeof useSync> | null = null;
  try {
    globalSync = useSync();
  } catch {
    // Context not available (e.g., outside SyncProvider)
  }

  // Use global sync state if available, otherwise use props
  const syncing = globalSync?.syncing ?? syncingProp;
  const syncProgress = globalSync?.progress ?? syncProgressProp;

  const handleSync = () => {
    if (globalSync) {
      globalSync.triggerGlobalSync();
    } else if (onSync) {
      onSync();
    }
  };

  const getFilterLabel = (filter: DateFilter) => {
    switch (filter) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case 'all': return 'All Time';
    }
  };

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-4 mb-6`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {dateDisplay && (
          <p className={`text-sm ${colors.text}`}>
            <strong>Report Period:</strong> {dateDisplay}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {ALL_DATE_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => onFilterChange(filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                dateFilter === filter ? colors.activeBtn : colors.inactiveBtn
              }`}
            >
              {getFilterLabel(filter)}
            </button>
          ))}
          {(showSync && (globalSync || onSync)) && (
            <button
              onClick={handleSync}
              disabled={syncing}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${colors.syncBtn} ml-2 flex items-center gap-2`}
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? (syncProgress || 'Syncing...') : 'Sync All Data'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
