/**
 * Compile-time sanity check for the env-coherence machinery.
 * Run via `npm run verify:env-coherence` (or `npx tsx scripts/verify-env-coherence.ts`).
 *
 * Mirrors what `assertEnvCoherent()` does at runtime — but exercises it
 * against synthetic env combos so we know the trap actually catches drift.
 */
import { assertEnvCoherent } from '../src/lib/env';

interface Case {
  name: string;
  env: Record<string, string | undefined>;
  expect: 'ok' | 'throw';
}

const cases: Case[] = [
  {
    name: 'unconfigured (no STAGING_SUPABASE_PROJECT_REFS) — no-op',
    env: { NEXT_PUBLIC_APP_ENV: 'staging', NEXT_PUBLIC_SUPABASE_URL: 'https://prodref.supabase.co', STAGING_SUPABASE_PROJECT_REFS: '' },
    expect: 'ok',
  },
  {
    name: 'configured + matched (production)',
    env: { NEXT_PUBLIC_APP_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: 'https://prodref.supabase.co', STAGING_SUPABASE_PROJECT_REFS: 'stagingref' },
    expect: 'ok',
  },
  {
    name: 'configured + matched (staging)',
    env: { NEXT_PUBLIC_APP_ENV: 'staging', NEXT_PUBLIC_SUPABASE_URL: 'https://stagingref.supabase.co', STAGING_SUPABASE_PROJECT_REFS: 'stagingref' },
    expect: 'ok',
  },
  {
    name: 'drift: app says staging but URL is prod',
    env: { NEXT_PUBLIC_APP_ENV: 'staging', NEXT_PUBLIC_SUPABASE_URL: 'https://prodref.supabase.co', STAGING_SUPABASE_PROJECT_REFS: 'stagingref' },
    expect: 'throw',
  },
  {
    name: 'drift: app says production but URL is staging',
    env: { NEXT_PUBLIC_APP_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: 'https://stagingref.supabase.co', STAGING_SUPABASE_PROJECT_REFS: 'stagingref' },
    expect: 'throw',
  },
  {
    name: 'case-insensitive ref match',
    env: { NEXT_PUBLIC_APP_ENV: 'staging', NEXT_PUBLIC_SUPABASE_URL: 'https://STAGINGREF.supabase.co', STAGING_SUPABASE_PROJECT_REFS: 'stagingref' },
    expect: 'ok',
  },
  {
    name: 'multiple staging refs supported',
    env: { NEXT_PUBLIC_APP_ENV: 'staging', NEXT_PUBLIC_SUPABASE_URL: 'https://second.supabase.co', STAGING_SUPABASE_PROJECT_REFS: 'first, second , third' },
    expect: 'ok',
  },
];

let failed = 0;
const originalEnv = { ...process.env };

for (const c of cases) {
  Object.assign(process.env, originalEnv, c.env);
  let actual: 'ok' | 'throw' = 'ok';
  try {
    assertEnvCoherent();
  } catch {
    actual = 'throw';
  }
  const ok = actual === c.expect;
  if (!ok) failed++;
  console.log(`  ${ok ? '✓' : '✗'} ${c.name}  →  expected=${c.expect}, got=${actual}`);
}

Object.assign(process.env, originalEnv);

if (failed > 0) {
  console.error(`\n${failed} of ${cases.length} cases failed.`);
  process.exit(1);
}
console.log(`\nAll ${cases.length} env-coherence cases passed.`);
