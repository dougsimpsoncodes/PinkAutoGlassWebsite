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
      className="fixed top-0 left-0 right-0 z-[100] w-full bg-amber-500 text-amber-950 text-center text-sm font-semibold py-1.5 px-3 shadow-sm"
      style={{ height: 28 }}
    >
      STAGING — not the live site. Test bookings and quotes here only.
    </div>
  );
}
