'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initializeSession, trackPageView, trackScrollDepth, resetScrollTracking } from '@/lib/tracking';

/**
 * Tracking Provider - Initializes analytics and tracks page views
 */
export default function TrackingProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Initialize session on first load
    initializeSession();
  }, []);

  useEffect(() => {
    // Track page view on route change
    if (pathname) {
      resetScrollTracking();
      trackPageView(pathname);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    // Set up scroll tracking
    const handleScroll = () => trackScrollDepth();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  return null;
}
