#!/usr/bin/env -S npx tsx
/**
 * Quick read-only progress check for the market-backfill scripts.
 * Reports row counts grouped by market for the 3 denormalized tables.
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function countByMarket(table: string) {
  const out: Record<string, number | null> = { null: 0, colorado: 0, arizona: 0 };
  for (const m of ['null', 'colorado', 'arizona']) {
    const q = supabase.from(table).select('*', { count: 'exact', head: true });
    const { count, error } = m === 'null' ? await q.is('market', null) : await q.eq('market', m);
    if (error) { console.error(`  ${table}/${m}: ${error.message}`); out[m] = null; continue; }
    out[m] = count ?? 0;
  }
  const total = Object.values(out).reduce((s: number, v) => s + (v ?? 0), 0);
  return { ...out, total };
}

async function main() {
  for (const tbl of ['user_sessions', 'page_views', 'conversion_events']) {
    const c = await countByMarket(tbl);
    const tagged = (c.colorado ?? 0) + (c.arizona ?? 0);
    const pctTagged = c.total > 0 ? ((tagged / (c.total as number)) * 100).toFixed(1) : '0.0';
    console.log(
      `${tbl.padEnd(20)} total=${String(c.total).padStart(6)}  null=${String(c.null).padStart(6)}  colorado=${String(c.colorado).padStart(5)}  arizona=${String(c.arizona).padStart(4)}  tagged=${pctTagged}%`
    );
  }
}

main().catch(e => { console.error(e); process.exit(1); });
