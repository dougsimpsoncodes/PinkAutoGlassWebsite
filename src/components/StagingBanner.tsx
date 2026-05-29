import { isStaging } from '@/lib/env';

/**
 * Sticky banner shown ONLY on staging deploys.
 * Prevents accidental use of staging URLs as if they were production.
 */
export default function StagingBanner() {
  if (!isStaging()) return null;
  return (
    <div
      role="status"
      aria-label="Staging environment"
      className="sticky top-0 z-50 w-full bg-amber-500 text-amber-950 text-center text-sm font-semibold py-1.5 px-3 shadow-sm"
    >
      STAGING — not the live site. Test bookings and quotes here only.
    </div>
  );
}
