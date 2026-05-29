/**
 * Environment-detection helpers + write-barrier assertion.
 *
 * Two signals must agree before a mutation path is allowed to write:
 *   1. NEXT_PUBLIC_APP_ENV (human-readable label)
 *   2. The Supabase project ref baked into NEXT_PUBLIC_SUPABASE_URL
 *
 * Why two signals: a single env-var toggle is brittle. The Supabase URL
 * cannot be forged without breaking the actual DB connection, which makes
 * it the strongest data-destination signal. NEXT_PUBLIC_APP_ENV is the
 * human label that surfaces in banners, robots, and notifications.
 *
 * If the two disagree, `assertEnvCoherent()` throws and refuses the write.
 * See docs/STAGING.md for setup.
 */
export type AppEnv = 'production' | 'staging' | 'development';

export function getAppEnv(): AppEnv {
  const raw = (process.env.NEXT_PUBLIC_APP_ENV || '').toLowerCase().trim();
  if (raw === 'staging') return 'staging';
  if (raw === 'development') return 'development';
  return 'production';
}

export function isStaging(): boolean {
  return getAppEnv() === 'staging';
}

export function isProduction(): boolean {
  return getAppEnv() === 'production';
}

/**
 * Comma-separated list of Supabase project refs (the `<ref>` in
 * `https://<ref>.supabase.co`) that are designated STAGING projects.
 *
 * Set this env var on BOTH the prod Vercel project and the staging Vercel
 * project to the SAME value, so each environment knows what counts as
 * staging. When unset, the coherence check is a no-op (safe default).
 */
function getStagingProjectRefs(): string[] {
  return (process.env.STAGING_SUPABASE_PROJECT_REFS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Extract `<ref>` from `https://<ref>.supabase.co`, or null if URL is unset/malformed. */
function getSupabaseProjectRef(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const m = url.match(/^https:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return m ? m[1].toLowerCase() : null;
}

/** True iff the configured Supabase URL points at a known staging project. */
export function isStagingSupabase(): boolean {
  const refs = getStagingProjectRefs();
  if (refs.length === 0) return false;
  const here = getSupabaseProjectRef();
  return here ? refs.includes(here) : false;
}

/**
 * Hard write-barrier. Call at the top of any API route that mutates
 * production-relevant tables (leads, quotes, bookings, etc.) so a drifted
 * NEXT_PUBLIC_APP_ENV vs Supabase URL combo throws instead of silently
 * writing test data to prod (or prod data to staging).
 *
 * Throws an Error on mismatch. Returns normally when:
 *   - STAGING_SUPABASE_PROJECT_REFS is unset (no-op fallback), OR
 *   - app env + supabase ref agree on which environment we're in.
 */
export function assertEnvCoherent(): void {
  const refs = getStagingProjectRefs();
  if (refs.length === 0) return; // not configured yet — no-op

  const appEnv = getAppEnv();
  const onStagingDb = isStagingSupabase();

  if (appEnv === 'staging' && !onStagingDb) {
    throw new Error(
      'Env mismatch: NEXT_PUBLIC_APP_ENV=staging but Supabase URL is not a known staging project ref. ' +
        'Refusing to write to avoid polluting production data. See docs/STAGING.md.'
    );
  }
  if (appEnv === 'production' && onStagingDb) {
    throw new Error(
      'Env mismatch: NEXT_PUBLIC_APP_ENV=production but Supabase URL IS a known staging project ref. ' +
        'Refusing to write to avoid mixing staging data into production. See docs/STAGING.md.'
    );
  }
}
