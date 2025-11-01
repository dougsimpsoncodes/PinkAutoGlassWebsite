const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBookings() {
  console.log('\n🔍 Checking recent leads (past 3 hours)...\n');

  const threeHoursAgo = new Date();
  threeHoursAgo.setHours(threeHoursAgo.getHours() - 3);

  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', threeHoursAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log(`Found ${leads.length} lead(s):\n`);
  leads.forEach((lead, i) => {
    console.log(`${i + 1}. ID: ${lead.id}`);
    console.log(`   Created: ${new Date(lead.created_at).toLocaleString()}`);
    console.log(`   Type: ${lead.type || 'N/A'}`);
    console.log(`   Email: ${lead.email || 'N/A'}`);
    console.log(`   Has streetAddress: ${!!lead.street_address ? 'YES (booking)' : 'NO (quick quote)'}`);
    console.log('');
  });
}

checkBookings().catch(console.error);
