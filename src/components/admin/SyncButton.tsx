'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface SyncButtonProps {
  scope?: 'all' | 'funnel' | 'roi' | 'calls';
  onSyncComplete?: () => void;
}

export default function SyncButton({ scope = 'all', onSyncComplete }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleSync = async () => {
    setSyncing(true);

    try {
      console.log(`🔄 Starting sync (scope: ${scope})...`);

      // Determine which endpoints to sync based on scope
      const syncEndpoints = getSyncEndpoints(scope);

      // Run all syncs in parallel
      const results = await Promise.allSettled(
        syncEndpoints.map(endpoint =>
          fetch(endpoint, { method: 'POST' })
            .then(res => res.json())
            .then(data => ({ endpoint, success: data.ok, data }))
        )
      );

      // Log results
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          const { endpoint, success } = result.value;
          console.log(success ? `✅ ${endpoint}` : `❌ ${endpoint}`);
        } else {
          console.error(`❌ ${syncEndpoints[i]}: ${result.reason}`);
        }
      });

      setLastSync(new Date());

      // Wait a moment then refresh the page data
      if (onSyncComplete) {
        setTimeout(onSyncComplete, 1000);
      }

    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getSyncEndpoints = (scope: string): string[] => {
    switch (scope) {
      case 'calls':
        return ['/api/admin/sync/ringcentral'];

      case 'funnel':
      case 'roi':
        return [
          '/api/admin/sync/google-ads',
          '/api/admin/sync/microsoft-ads',
          '/api/admin/sync/google-search-console',
          '/api/admin/sync/ringcentral',
        ];

      case 'all':
      default:
        return [
          '/api/admin/sync/google-ads',
          '/api/admin/sync/microsoft-ads',
          '/api/admin/sync/google-search-console',
          '/api/admin/sync/ringcentral',
          '/api/admin/sync/gbp-reviews',
        ];
    }
  };

  const getButtonText = () => {
    if (syncing) return 'Syncing...';
    if (lastSync) {
      const minutes = Math.floor((Date.now() - lastSync.getTime()) / 60000);
      if (minutes < 1) return 'Just synced';
      if (minutes < 60) return `Synced ${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `Synced ${hours}h ago`;
    }
    return 'Sync Data';
  };

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
        ${syncing
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
          : 'bg-gradient-to-r from-pink-600 to-blue-600 text-white hover:from-pink-700 hover:to-blue-700'
        }
      `}
    >
      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
      {getButtonText()}
    </button>
  );
}
