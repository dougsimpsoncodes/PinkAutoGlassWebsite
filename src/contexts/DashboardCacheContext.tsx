'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

interface DashboardData {
  summary: {
    totalSpend: number;
    totalLeads: number;
    costPerLead: number;
    totalClicks: number;
    totalImpressions: number;
    overallCtr: number;
    conversionRate: number;
    totalRevenue: number;
    roas: number;
  };
  platforms: {
    google: PlatformMetrics;
    microsoft: PlatformMetrics;
    other: PlatformMetrics;
  };
  calls: {
    total: number;
    answered: number;
    missed: number;
    answerRate: number;
    byPlatform: {
      google: number;
      microsoft: number;
      direct: number;
    };
  };
  leads: {
    total: number;
    new: number;
    byPlatform: {
      google: number;
      microsoft: number;
      direct: number;
    };
  };
  comparison: Record<string, unknown>;
  dateRange: {
    start: string;
    end: string;
    display: string;
    period: string;
  };
  _cached?: boolean;
}

interface PlatformMetrics {
  spend: number;
  clicks: number;
  impressions: number;
  ctr: number;
  leads: {
    total: number;
    calls: number;
    texts: number;
    forms: number;
  };
  costPerLead: number;
}

interface CacheEntry {
  data: DashboardData;
  timestamp: number;
  expiresAt: number;
}

interface DashboardCacheContextType {
  // Get cached data for a period (returns null if not cached or expired)
  getCachedData: (period: string) => DashboardData | null;

  // Set data in cache
  setCachedData: (period: string, data: DashboardData) => void;

  // Check if data is being fetched
  isLoading: (period: string) => boolean;

  // Trigger preload of all common periods
  preloadAll: () => Promise<void>;

  // Invalidate cache (e.g., after data changes)
  invalidateCache: (period?: string) => void;

  // Preload status
  preloadStatus: 'idle' | 'loading' | 'complete' | 'error';
}

const DashboardCacheContext = createContext<DashboardCacheContextType | null>(null);

// Cache TTL in milliseconds (matches server-side 60 seconds)
const CACHE_TTL_MS = 60 * 1000;

export function DashboardCacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  const [loadingPeriods, setLoadingPeriods] = useState<Set<string>>(new Set());
  const [preloadStatus, setPreloadStatus] = useState<'idle' | 'loading' | 'complete' | 'error'>('idle');
  const preloadAttempted = useRef(false);

  const getCachedData = useCallback((period: string): DashboardData | null => {
    const entry = cache.get(period);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      // Remove expired entry
      setCache(prev => {
        const next = new Map(prev);
        next.delete(period);
        return next;
      });
      return null;
    }

    return entry.data;
  }, [cache]);

  const setCachedData = useCallback((period: string, data: DashboardData) => {
    const now = Date.now();
    setCache(prev => {
      const next = new Map(prev);
      next.set(period, {
        data,
        timestamp: now,
        expiresAt: now + CACHE_TTL_MS,
      });
      return next;
    });
  }, []);

  const isLoading = useCallback((period: string): boolean => {
    return loadingPeriods.has(period);
  }, [loadingPeriods]);

  const preloadAll = useCallback(async () => {
    if (preloadStatus === 'loading') return;

    setPreloadStatus('loading');
    const periods = ['today', 'yesterday', '7days', '30days'];

    // Mark all as loading
    setLoadingPeriods(new Set(periods));

    try {
      // Fetch all periods in parallel
      const results = await Promise.all(
        periods.map(async (period) => {
          try {
            const response = await fetch(`/api/admin/dashboard/unified?period=${period}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            return { period, data, success: true };
          } catch (error) {
            console.error(`Failed to preload ${period}:`, error);
            return { period, data: null, success: false };
          }
        })
      );

      // Update cache with successful results
      const now = Date.now();
      setCache(prev => {
        const next = new Map(prev);
        for (const result of results) {
          if (result.success && result.data) {
            next.set(result.period, {
              data: result.data,
              timestamp: now,
              expiresAt: now + CACHE_TTL_MS,
            });
          }
        }
        return next;
      });

      setPreloadStatus('complete');
    } catch (error) {
      console.error('Preload failed:', error);
      setPreloadStatus('error');
    } finally {
      setLoadingPeriods(new Set());
    }
  }, [preloadStatus]);

  const invalidateCache = useCallback((period?: string) => {
    if (period) {
      setCache(prev => {
        const next = new Map(prev);
        next.delete(period);
        return next;
      });
    } else {
      setCache(new Map());
    }
    setPreloadStatus('idle');
  }, []);

  // Auto-preload just "7days" on mount (the default view)
  // Other periods are fetched on-demand
  useEffect(() => {
    if (!preloadAttempted.current) {
      preloadAttempted.current = true;
      // Preload just "7days" - the default dashboard view
      const timer = setTimeout(async () => {
        try {
          const response = await fetch('/api/admin/dashboard/unified?period=7days');
          if (response.ok) {
            const data = await response.json();
            const now = Date.now();
            setCache(prev => {
              const next = new Map(prev);
              next.set('7days', {
                data,
                timestamp: now,
                expiresAt: now + CACHE_TTL_MS,
              });
              return next;
            });
          }
        } catch (error) {
          console.error('Preload failed:', error);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <DashboardCacheContext.Provider
      value={{
        getCachedData,
        setCachedData,
        isLoading,
        preloadAll,
        invalidateCache,
        preloadStatus,
      }}
    >
      {children}
    </DashboardCacheContext.Provider>
  );
}

export function useDashboardCache() {
  const context = useContext(DashboardCacheContext);
  if (!context) {
    throw new Error('useDashboardCache must be used within a DashboardCacheProvider');
  }
  return context;
}

/**
 * Hook for fetching dashboard data with cache support
 * Returns cached data immediately if available, otherwise fetches
 */
export function useDashboardData(period: string) {
  const { getCachedData, setCachedData, isLoading } = useDashboardCache();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check cache first
    const cached = getCachedData(period);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    // If already loading from preload, wait for it
    if (isLoading(period)) {
      const interval = setInterval(() => {
        const cached = getCachedData(period);
        if (cached) {
          setData(cached);
          setLoading(false);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    // Fetch fresh data
    setLoading(true);
    fetch(`/api/admin/dashboard/unified?period=${period}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setData(data);
        setCachedData(period, data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [period, getCachedData, setCachedData, isLoading]);

  return { data, loading, error };
}
