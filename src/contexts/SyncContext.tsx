'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SyncState {
  syncing: boolean;
  progress: string;
  lastSyncTime: Date | null;
  // Increment this to signal all pages to refresh their data
  syncVersion: number;
}

interface SyncContextType extends SyncState {
  triggerGlobalSync: () => Promise<void>;
  // Called by pages after they've refreshed their data
  notifySyncComplete: () => void;
}

const SyncContext = createContext<SyncContextType | null>(null);

const SYNC_ENDPOINTS = [
  { name: 'Google Ads', endpoint: '/api/admin/sync/google-ads' },
  { name: 'Microsoft Ads', endpoint: '/api/admin/sync/microsoft-ads' },
  { name: 'Google Search Console', endpoint: '/api/admin/sync/google-search-console' },
  { name: 'RingCentral', endpoint: '/api/admin/sync/ringcentral' },
];

export function SyncProvider({ children }: { children: ReactNode }) {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncVersion, setSyncVersion] = useState(0);

  const triggerGlobalSync = useCallback(async () => {
    if (syncing) return;

    setSyncing(true);
    setProgress('Starting sync...');

    try {
      // Sync all external data sources in parallel
      const results = await Promise.allSettled(
        SYNC_ENDPOINTS.map(async ({ name, endpoint }) => {
          setProgress(`Syncing ${name}...`);
          const res = await fetch(endpoint, { method: 'POST' });
          const data = await res.json();
          return { name, success: data.ok, data };
        })
      );

      // Log results
      results.forEach((result, i) => {
        const { name } = SYNC_ENDPOINTS[i];
        if (result.status === 'fulfilled') {
          console.log(result.value.success ? `✅ ${name}` : `❌ ${name}`);
        } else {
          console.error(`❌ ${name}: ${result.reason}`);
        }
      });

      setLastSyncTime(new Date());
      setProgress('Refreshing data...');

      // Increment sync version to signal all pages to refresh
      setSyncVersion(v => v + 1);

      // Give pages time to react and fetch
      await new Promise(resolve => setTimeout(resolve, 500));
      setProgress('');
    } catch (error) {
      console.error('Global sync error:', error);
      setProgress('Sync failed');
      setTimeout(() => setProgress(''), 2000);
    } finally {
      setSyncing(false);
    }
  }, [syncing]);

  const notifySyncComplete = useCallback(() => {
    // Individual pages can call this when they've finished refreshing
    // Currently just for logging, but could be used for UI feedback
  }, []);

  return (
    <SyncContext.Provider
      value={{
        syncing,
        progress,
        lastSyncTime,
        syncVersion,
        triggerGlobalSync,
        notifySyncComplete,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}

// Hook for pages to subscribe to sync events and auto-refresh
export function useSyncSubscription(onSync: () => void) {
  const { syncVersion } = useSync();

  // This effect runs whenever syncVersion changes (i.e., after a global sync)
  // The consuming component should pass their data refresh function as onSync
  // Note: We use useEffect in the consuming component to react to syncVersion changes
  return syncVersion;
}
