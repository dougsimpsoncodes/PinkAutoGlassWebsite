'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPhoneClick, trackTextClick } from '@/lib/tracking';

/**
 * Site-wide phone and text click tracker.
 * Attached once in the root layout — catches any tel:/sms: link on every page
 * that isn't already tracked by CTAButtons or AboveFoldCTA.
 * Google Ads conversion deduplicates by session_id, so double-firing on
 * already-tracked links is harmless.
 */
export default function GlobalPhoneTracker() {
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (href.startsWith('tel:')) {
        trackPhoneClick(pathname, anchor.textContent?.trim(), href.replace('tel:', ''));
      } else if (href.startsWith('sms:')) {
        trackTextClick(pathname, anchor.textContent?.trim());
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  return null;
}
