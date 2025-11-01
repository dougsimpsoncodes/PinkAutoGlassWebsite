const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecentSubmission() {
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', oneMinuteAgo)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data.length === 0) {
    console.log('❌ No new leads in the last minute');
    console.log('\nThe form submission may have failed. Check:');
    console.log('1. Browser console for errors');
    console.log('2. Network tab for failed API requests');
    console.log('3. Which page/form you used');
  } else {
    console.log(`✅ Found ${data.length} new lead(s) in the last minute:\n`);
    data.forEach(lead => {
      const isBooking = !!lead.street_address;
      console.log(`  ${new Date(lead.created_at).toLocaleTimeString()}`);
      console.log(`  Type: ${isBooking ? '📅 BOOKING' : '💬 QUICK QUOTE'}`);
      console.log(`  Email: ${lead.email}`);
      console.log(`  ID: ${lead.id}`);
      console.log('');
    });
  }
}

checkRecentSubmission().catch(console.error);
