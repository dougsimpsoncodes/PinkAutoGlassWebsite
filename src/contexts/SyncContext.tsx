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

export const SyncContext = createContext<SyncContextType | null>(null);

const SYNC_ENDPOINTS = [
  { name: 'Google Ads', endpoint: '/api/admin/sync/google-ads' },
  { name: 'Microsoft Ads', endpoint: '/api/admin/sync/microsoft-ads' },
  { name: 'Google Search Console', endpoint: '/api/admin/sync/google-search-console' },
  { name: 'RingCentral', endpoint: '/api/admin/sync/ringcentral' },
];
const SYNC_TIMEOUT_MS = 120000;

export function SyncProvider({ children }: { children: ReactNode }) {
  const [syncing, setSyncing] = useState(false);
  const [progress, setProgress] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncVersion, setSyncVersion] = useState(0);

  const triggerGlobalSync = useCallback(async () => {
    if (syncing) return;

    setSyncing(true);
    setProgress(`Syncing data sources (0/${SYNC_ENDPOINTS.length})...`);

    try {
      let completed = 0;

      // Sync all external data sources in parallel with per-endpoint timeout.
      const results = await Promise.all(
        SYNC_ENDPOINTS.map(async ({ name, endpoint }) => {
          const controller = new AbortController();
          let timeoutId: ReturnType<typeof setTimeout> | null = null;

          try {
            const timeoutPromise = new Promise<never>((_, reject) => {
              timeoutId = setTimeout(() => {
                controller.abort();
                reject(new Error(`Timed out after ${SYNC_TIMEOUT_MS / 1000}s`));
              }, SYNC_TIMEOUT_MS);
            });

            const res = await Promise.race([
              fetch(endpoint, {
                method: 'POST',
                signal: controller.signal,
                cache: 'no-store',
              }),
              timeoutPromise,
            ]);

            let data: any = null;
            try {
              data = await res.json();
            } catch {
              data = null;
            }

            const success = res.ok && !!data?.ok;
            return { name, endpoint, success, status: res.status, data };
          } catch (error) {
            const isTimeout = error instanceof Error && (
              error.name === 'AbortError' || error.message.includes('Timed out')
            );
            return {
              name,
              endpoint,
              success: false,
              status: 0,
              data: { ok: false, error: isTimeout ? `Timed out after ${SYNC_TIMEOUT_MS / 1000}s` : String(error) },
            };
          } finally {
            if (timeoutId) clearTimeout(timeoutId);
            completed += 1;
            setProgress(`Syncing data sources (${completed}/${SYNC_ENDPOINTS.length})...`);
          }
        })
      );

      // Log results
      results.forEach((result) => {
        if (result.success) {
          console.log(`✅ ${result.name}`);
        } else {
          console.error(`❌ ${result.name}:`, result.data?.error || `HTTP ${result.status}`);
        }
      });

      const failedCount = results.filter(r => !r.success).length;

      setLastSyncTime(new Date());
      if (failedCount > 0) {
        setProgress(`Sync completed with ${failedCount} issue${failedCount > 1 ? 's' : ''}. Refreshing data...`);
      } else {
        setProgress('Refreshing data...');
      }

      // Increment sync version to signal all pages to refresh
      setSyncVersion(v => v + 1);

      // Give pages time to react and fetch
      await new Promise(resolve => setTimeout(resolve, 500));
      if (failedCount > 0) {
        setTimeout(() => setProgress(''), 2500);
      } else {
        setProgress('');
      }
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
