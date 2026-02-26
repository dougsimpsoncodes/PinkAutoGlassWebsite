'use client';

import { useEffect } from 'react';
import { trackPhoneClick, trackTextClick } from '@/lib/tracking';
import { trackBookingClick } from '@/lib/analytics';

/**
 * Attaches conversion tracking to all tel: and /book links on the /phoenix landing page.
 * Keeps the page itself as a server component (required for metadata export).
 */
export default function PhoenixClickTracker() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (href.startsWith('tel:')) {
        trackPhoneClick('phoenix-landing', anchor.textContent?.trim(), href.replace('tel:', ''));
      } else if (href.startsWith('/book')) {
        trackBookingClick('phoenix-landing');
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return null;
}
