'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageScroll, event } from '@/lib/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const scrollTracked = useRef<Set<number>>(new Set());
  const timeOnPageStart = useRef<number>(0);
  const timeTracked = useRef<Set<number>>(new Set());

  useEffect(() => {
    // Reset tracking for new page
    scrollTracked.current = new Set();
    timeTracked.current = new Set();
    timeOnPageStart.current = Date.now();

    // Scroll depth tracking
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const scrollPercentage = Math.round((scrollPosition / scrollHeight) * 100);

      // Track at 25%, 50%, 75%, and 100%
      const milestones = [25, 50, 75, 100];
      milestones.forEach((milestone) => {
        if (scrollPercentage >= milestone && !scrollTracked.current.has(milestone)) {
          scrollTracked.current.add(milestone);
          trackPageScroll(milestone, pathname);
        }
      });
    };

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

    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Track initial view (0% scroll)
    handleScroll();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
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
