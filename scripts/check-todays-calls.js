import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const today = new Date();
today.setHours(0, 0, 0, 0);

const { data: calls } = await supabase
  .from('ringcentral_calls')
  .select('*')
  .gte('start_time', today.toISOString())
  .eq('direction', 'Inbound')
  .order('start_time', { ascending: false });

console.log(`\nToday (${today.toLocaleDateString()}):`);
console.log(`Raw inbound calls from DB: ${calls?.length || 0}`);

if (calls && calls.length > 0) {
  calls.forEach(c => {
    console.log(`  ${new Date(c.start_time).toLocaleTimeString()} - ${c.from_number} (session: ${c.session_id})`);
  });
}

// Check deduplication logic
const sessionMap = new Map();
calls?.forEach(call => {
  const existing = sessionMap.get(call.session_id);
  if (!existing) {
    sessionMap.set(call.session_id, call);
  } else {
    const isInboundToUs = call.direction === 'Inbound' && call.to_number === '+17209187465';
    const existingIsInboundToUs = existing.direction === 'Inbound' && existing.to_number === '+17209187465';
    if (isInboundToUs && !existingIsInboundToUs) {
      sessionMap.set(call.session_id, call);
    }
  }
});

console.log(`\nAfter deduplication: ${sessionMap.size} unique calls\n`);
