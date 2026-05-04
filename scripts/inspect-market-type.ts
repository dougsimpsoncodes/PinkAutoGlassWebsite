#!/usr/bin/env -S npx tsx
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

const c = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
(async () => {
  const { data, error } = await c.from('leads').select('market_type, market').limit(3000);
  if (error) { console.error(error); process.exit(1); }
  const cross: Record<string, number> = {};
  for (const r of data!) {
    const k = `market_type=${r.market_type ?? 'NULL'} | market=${r.market ?? 'NULL'}`;
    cross[k] = (cross[k] || 0) + 1;
  }
  console.log(JSON.stringify(cross, null, 2));
})();
