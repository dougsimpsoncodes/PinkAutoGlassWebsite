import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config({ path: new URL('../.env.local', import.meta.url).pathname });

const leadId = process.argv[2];
if (!leadId) { console.error('usage: node scripts/verify-quote-lead-smoke.mjs <leadId>'); process.exit(1); }

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const { data: lead, error } = await supabase
  .from('leads')
  .select('*')
  .eq('id', leadId)
  .single();

if (error) { console.error('Error:', error); process.exit(1); }
console.log(JSON.stringify(lead, null, 2));
