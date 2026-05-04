#!/usr/bin/env -S npx tsx
/**
 * Read-only inspection of leads table to verify column shape before P2c migration.
 * Specifically need to know if there's a ringcentral_call_id FK to support
 * the call-derived-leads follow-up backfill.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv(envPath: string) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv(resolve(__dirname, '..', '.env.local'));

const c = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

(async () => {
  const { data, error } = await c.from('leads').select('*').limit(1);
  if (error) { console.error(error); process.exit(1); }
  if (!data || data.length === 0) { console.log('(no rows)'); return; }
  console.log('leads columns:', Object.keys(data[0]).sort().join(', '));
  console.log('');
  console.log('sample row keys with values:');
  for (const [k, v] of Object.entries(data[0])) {
    if (v !== null && v !== undefined && v !== '') {
      console.log(`  ${k}:`, typeof v === 'string' ? `"${String(v).slice(0, 50)}"` : JSON.stringify(v).slice(0, 60));
    }
  }
})();
