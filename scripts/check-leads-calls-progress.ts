#!/usr/bin/env -S npx tsx
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function loadEnv(p: string) {
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const t = line.trim(); if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('='); if (eq === -1) continue;
    const key = t.slice(0, eq).trim(); let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv(resolve(__dirname, '..', '.env.local'));

const c = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

(async () => {
  for (const tbl of ['leads', 'ringcentral_calls']) {
    const out: Record<string, number> = {};
    for (const m of ['null', 'colorado', 'arizona']) {
      const q = c.from(tbl).select('*', { count: 'exact', head: true });
      const { count } = m === 'null' ? await q.is('market', null) : await q.eq('market', m);
      out[m] = count ?? 0;
    }
    const total = out.null + out.colorado + out.arizona;
    const tagged = out.colorado + out.arizona;
    const pct = total > 0 ? ((tagged / total) * 100).toFixed(1) : '0.0';
    console.log(`${tbl.padEnd(20)} total=${String(total).padStart(6)}  null=${String(out.null).padStart(6)}  colorado=${String(out.colorado).padStart(5)}  arizona=${String(out.arizona).padStart(4)}  tagged=${pct}%`);
  }
})();
