/**
 * Environment-detection helpers for staging vs production behavior.
 *
 * `NEXT_PUBLIC_APP_ENV` is the single source of truth.
 * - `production` → live customer site (default when unset, to keep prod safe by default)
 * - `staging`    → internal staging deploy, indexable=false, banner visible, writes to staging Supabase
 * - `development` → local dev (`npm run dev`)
 *
 * Set it in each Vercel project's env vars. See docs/STAGING.md for setup.
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
