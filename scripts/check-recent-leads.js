const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRecentLeads() {
  console.log('\n🔍 Checking for recent leads (yesterday and today)...\n');

  // Calculate yesterday and today dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  console.log('Date range:');
  console.log(`  Yesterday: ${yesterday.toISOString()}`);
  console.log(`  Today: ${today.toISOString()}`);
  console.log('');

  // First, let's see what tables exist
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .or('table_name.like.%lead%,table_name.like.%book%,table_name.like.%quote%,table_name.like.%submission%');

  if (!tablesError && tables) {
    console.log('📋 Found tables:', tables.map(t => t.table_name).join(', '));
    console.log('');
  }

  // Check bookings table
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📅 BOOKINGS (Online Appointments)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('*')
    .gte('created_at', yesterday.toISOString())
    .order('created_at', { ascending: false });

  if (bookingsError) {
    console.error('❌ Error fetching bookings:', bookingsError);
  } else if (!bookings || bookings.length === 0) {
    console.log('✓ No bookings found for yesterday or today');
  } else {
    console.log(`\n✓ Found ${bookings.length} booking(s):\n`);
    bookings.forEach((booking, i) => {
      const createdAt = new Date(booking.created_at);
      console.log(`${i + 1}. Booking ID: ${booking.id}`);
      console.log(`   Created: ${createdAt.toLocaleString()}`);
      console.log(`   Customer: ${booking.customer_name || 'N/A'}`);
      console.log(`   Email: ${booking.customer_email || 'N/A'}`);
      console.log(`   Phone: ${booking.customer_phone || 'N/A'}`);
      console.log(`   Service: ${booking.service_type || 'N/A'}`);
      console.log(`   Vehicle: ${booking.vehicle_year || ''} ${booking.vehicle_make || ''} ${booking.vehicle_model || ''}`);
      console.log('');
    });
  }

  // Check leads/quotes table
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💬 QUICK QUOTES / LEADS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', yesterday.toISOString())
    .order('created_at', { ascending: false });

  if (leadsError) {
    console.error('❌ Error fetching leads:', leadsError);
  } else if (!leads || leads.length === 0) {
    console.log('✓ No quick quotes/leads found for yesterday or today');
  } else {
    console.log(`\n✓ Found ${leads.length} quick quote(s)/lead(s):\n`);
    leads.forEach((lead, i) => {
      const createdAt = new Date(lead.created_at);
      console.log(`${i + 1}. Lead ID: ${lead.id}`);
      console.log(`   Created: ${createdAt.toLocaleString()}`);
      console.log(`   Name: ${lead.name || 'N/A'}`);
      console.log(`   Email: ${lead.email || 'N/A'}`);
      console.log(`   Phone: ${lead.phone || 'N/A'}`);
      console.log(`   Type: ${lead.type || lead.service_type || 'N/A'}`);
      console.log('');
    });
  }

  // Check conversion_events for form submissions
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CONVERSION EVENTS (Form Submissions)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const { data: conversions, error: conversionsError } = await supabase
    .from('conversion_events')
    .select('*')
    .eq('event_type', 'form_submit')
    .gte('created_at', yesterday.toISOString())
    .order('created_at', { ascending: false });

  if (conversionsError) {
    console.error('❌ Error fetching conversions:', conversionsError);
  } else if (!conversions || conversions.length === 0) {
    console.log('✓ No form submissions found for yesterday or today');
  } else {
    console.log(`\n✓ Found ${conversions.length} form submission(s):\n`);
    conversions.forEach((conv, i) => {
      const createdAt = new Date(conv.created_at);
      console.log(`${i + 1}. Conversion ID: ${conv.id}`);
      console.log(`   Created: ${createdAt.toLocaleString()}`);
      console.log(`   Page: ${conv.page_path || 'N/A'}`);
      console.log(`   Button Location: ${conv.button_location || 'N/A'}`);
      console.log(`   Metadata: ${JSON.stringify(conv.metadata || {})}`);
      console.log('');
    });
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📈 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  Bookings (Online Appointments): ${bookings?.length || 0}`);
  console.log(`  Quick Quotes/Leads: ${leads?.length || 0}`);
  console.log(`  Form Submissions (Analytics): ${conversions?.length || 0}`);
  console.log(`  TOTAL LEADS: ${(bookings?.length || 0) + (leads?.length || 0)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

checkRecentLeads().catch(console.error);
