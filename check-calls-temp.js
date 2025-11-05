const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCalls() {
  // Get today's calls (Nov 5, 2025)
  const todayStart = '2025-11-05T00:00:00Z';
  const todayEnd = '2025-11-06T00:00:00Z';
  
  const { data, error, count } = await supabase
    .from('ringcentral_calls')
    .select('*', { count: 'exact' })
    .gte('start_time', todayStart)
    .lt('start_time', todayEnd);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`Total calls on Nov 5: ${count}`);
  
  const inbound = data.filter(c => c.direction === 'Inbound');
  console.log(`Inbound calls: ${inbound.length}`);
  
  if (data.length > 0) {
    console.log('\nSample call times:');
    data.slice(0, 5).forEach(c => {
      console.log(`- ${c.start_time} | ${c.direction} | ${c.from_number} -> ${c.to_number}`);
    });
  } else {
    console.log('\nNo calls found for today - database needs sync!');
  }
}

checkCalls();
