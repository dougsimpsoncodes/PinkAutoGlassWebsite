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

console.log('\n=== RingCentral Call Sync Status ===\n');

const { data: recentCalls } = await supabase
  .from('ringcentral_calls')
  .select('*')
  .order('start_time', { ascending: false })
  .limit(10);

if (recentCalls && recentCalls.length > 0) {
  console.log('Most recent call in database:');
  console.log('  Time:', new Date(recentCalls[0].start_time).toString());
  console.log('  Direction:', recentCalls[0].direction);
  console.log('  From:', recentCalls[0].from_number);

  const hoursSince = (Date.now() - new Date(recentCalls[0].start_time).getTime()) / 1000 / 60 / 60;
  console.log('  Hours ago:', hoursSince.toFixed(1));

  console.log('\nLast 10 calls:');
  recentCalls.forEach((c, i) => {
    const time = new Date(c.start_time);
    console.log('  ' + (i+1) + '.', time.toLocaleDateString(), time.toLocaleTimeString(), '-', c.direction);
  });
}

const today = new Date();
today.setHours(0, 0, 0, 0);

const { data: todayCalls } = await supabase
  .from('ringcentral_calls')
  .select('*')
  .gte('start_time', today.toISOString())
  .eq('direction', 'Inbound');

console.log('\nToday (' + today.toLocaleDateString() + '):');
console.log('  Inbound calls:', todayCalls?.length || 0);
console.log('');
