/**
 * Dashboard Caching Layer
 *
 * Uses Vercel KV when configured (KV_REST_API_URL + KV_REST_API_TOKEN),
 * falls back to in-memory cache when not available.
 *
 * In-memory cache limitations in serverless:
 * - Cache is per-instance (not shared across Lambda functions)
 * - Cleared on cold starts
 * - Still effective for repeated requests within a session
 */

import { kv } from '@vercel/kv';

// In-memory fallback cache
const memoryCache = new Map<string, { data: unknown; expires: number }>();

// Check if Vercel KV is configured
const isKVConfigured = !!(
  process.env.KV_REST_API_URL &&
  process.env.KV_REST_API_TOKEN
);

// Cache TTL defaults (in seconds)
export const CACHE_TTL = {
  DASHBOARD_DATA: 60,      // 1 minute - dashboard metrics
  GOOGLE_ADS: 300,         // 5 minutes - external API
  MICROSOFT_ADS: 300,      // 5 minutes - external API
  CALLS_DATA: 60,          // 1 minute - call logs
  LEADS_DATA: 60,          // 1 minute - lead data
} as const;

/**
 * Generate a cache key for dashboard data
 */
export function getCacheKey(prefix: string, period: string): string {
  return `dashboard:${prefix}:${period}`;
}

/**
 * Get cached data
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    if (isKVConfigured) {
      const data = await kv.get<T>(key);
      return data;
    } else {
      // In-memory fallback
      const cached = memoryCache.get(key);
      if (cached && cached.expires > Date.now()) {
        return cached.data as T;
      }
      // Clean up expired entry
      if (cached) {
        memoryCache.delete(key);
      }
      return null;
    }
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set cached data with TTL
 */
export async function setCache<T>(
  key: string,
  data: T,
  ttlSeconds: number = CACHE_TTL.DASHBOARD_DATA
): Promise<void> {
  try {
    if (isKVConfigured) {
      await kv.set(key, data, { ex: ttlSeconds });
    } else {
      // In-memory fallback
      memoryCache.set(key, {
        data,
        expires: Date.now() + (ttlSeconds * 1000),
      });
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Delete cached data
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    if (isKVConfigured) {
      await kv.del(key);
    } else {
      memoryCache.delete(key);
    }
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * Invalidate all dashboard caches for a specific period
 * Call this when data changes (new lead, new call, etc.)
 */
export async function invalidateDashboardCache(period?: string): Promise<void> {
  const prefixes = ['unified', 'google-ads', 'microsoft-ads', 'calls', 'leads'];
  const periods = period ? [period] : ['today', 'yesterday', '7days', '30days', 'all'];

  const keys = prefixes.flatMap(prefix =>
    periods.map(p => getCacheKey(prefix, p))
  );

  await Promise.all(keys.map(key => deleteCache(key)));
}

/**
 * Wrapper for cached API calls
 * Tries cache first, falls back to fetcher, caches result
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = CACHE_TTL.DASHBOARD_DATA
): Promise<{ data: T; cached: boolean }> {
  // Try cache first
  const cached = await getCache<T>(key);
  if (cached !== null) {
    return { data: cached, cached: true };
  }

  // Fetch fresh data
  const data = await fetcher();

  // Cache for next time (don't await - fire and forget)
  setCache(key, data, ttlSeconds).catch(() => {});

  return { data, cached: false };
}

/**
 * Get cache status for debugging
 */
export function getCacheStatus(): {
  type: 'vercel-kv' | 'in-memory';
  memoryEntries: number;
} {
  return {
    type: isKVConfigured ? 'vercel-kv' : 'in-memory',
    memoryEntries: memoryCache.size,
  };
}
