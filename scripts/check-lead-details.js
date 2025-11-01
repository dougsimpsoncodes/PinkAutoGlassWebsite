const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkLeadDetails() {
  console.log('\n🔍 Checking today\'s 3 leads for email notification status...\n');

  const leadIds = [
    '952bf59b-e769-4b86-8b2a-c20937d69cdb', // 2:18 PM
    '6aea7222-d951-4602-9094-a144107fd7df', // 1:33 PM - daviddahlin@outlook.com
    'e4c155ac-ded0-47de-ab64-be677faa3661'  // 10:45 AM
  ];

  for (const leadId of leadIds) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Get full lead details
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error) {
      console.error(`❌ Error fetching lead ${leadId}:`, error);
      continue;
    }

    const createdAt = new Date(lead.created_at);
    console.log(`\n📋 Lead ID: ${lead.id}`);
    console.log(`   Created: ${createdAt.toLocaleString()}`);
    console.log(`   Email: ${lead.email || 'N/A'}`);
    console.log(`   Type: ${lead.type || 'N/A'}`);
    console.log(`\n   Full Data:`);
    console.log(`   ${JSON.stringify(lead, null, 2)}`);
    console.log('');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('📧 Checking email notification system...\n');

  // Check the lead API route to see how notifications are sent
  console.log('Looking at /api/lead/route.ts to understand notification flow...\n');
}

checkLeadDetails().catch(console.error);
