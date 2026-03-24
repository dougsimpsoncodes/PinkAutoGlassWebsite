'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { event } from '@/lib/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const timeOnPageStart = useRef<number>(0);
  const timeTracked = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Reset tracking for new page
    timeTracked.current = new Set();
    timeOnPageStart.current = Date.now();

    // Note: Scroll depth tracking is handled by tracking.ts trackScrollDepth()
    // to avoid duplicate GA4 scroll_depth events.

    // Time on page tracking (15s, 30s, 60s, 120s, 300s)
    const timeIntervals = [15000, 30000, 60000, 120000, 300000]; // milliseconds
    const timeIntervalIds: NodeJS.Timeout[] = [];

    timeIntervals.forEach((interval, index) => {
      const timeoutId = setTimeout(() => {
        const seconds = interval / 1000;
        if (!timeTracked.current.has(seconds)) {
          timeTracked.current.add(seconds);
          event({
            action: 'time_on_page',
            category: 'engagement',
            label: pathname,
            value: seconds,
          });
        }
      }, interval);
      timeIntervalIds.push(timeoutId);
    });

    // Cleanup
    return () => {
      timeIntervalIds.forEach((id) => clearTimeout(id));

      // Track final time on page when leaving
      const timeOnPage = Math.round((Date.now() - timeOnPageStart.current) / 1000);
      if (timeOnPage >= 5) {
        event({
          action: 'page_exit',
          category: 'engagement',
          label: pathname,
          value: timeOnPage,
        });
      }
    };
  }, [pathname]);

  return null; // This component doesn't render anything
}
