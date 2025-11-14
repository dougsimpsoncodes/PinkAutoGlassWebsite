require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
  console.error('Missing Supabase credentials');
  console.error('Need either SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Use service key if available, otherwise use anon key
const supabase = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

async function checkLeadEmails() {
  try {
    console.log('Checking for leads and emails...\n');

    // Check for leads submitted in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentLeads, error: recentError } = await supabase
      .from('leads')
      .select('*')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (recentError && recentError.code !== 'PGRST116') {
      console.error('Error querying recent leads:', recentError);
    } else if (recentLeads) {
      console.log(`📊 Total leads in last 7 days: ${recentLeads.length}`);
      if (recentLeads.length > 0) {
        console.log('\nMost recent leads:');
        recentLeads.slice(0, 5).forEach((lead, idx) => {
          const date = new Date(lead.created_at);
          console.log(`  ${idx + 1}. ${lead.firstName || ''} ${lead.lastName || ''} - ${lead.email || lead.phone || 'N/A'} - ${date.toLocaleDateString()} ${date.toLocaleTimeString()}`);
        });
      }
    }

    // Check for leads today
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .gte('created_at', '2025-11-13T00:00:00Z')
      .lte('created_at', '2025-11-13T23:59:59Z');

    if (leadsError && leadsError.code !== 'PGRST116') {
      console.error('Error querying leads:', leadsError);
    } else if (leads) {
      console.log(`📊 Leads created today (Nov 13): ${leads.length}`);
      if (leads.length > 0) {
        console.log('\nLead details:');
        leads.forEach((lead, idx) => {
          console.log(`  ${idx + 1}. ${lead.firstName || ''} ${lead.lastName || ''} - ${lead.email || lead.phone || 'N/A'} at ${new Date(lead.created_at).toLocaleTimeString()}`);
        });
      }
    }

    // Check for email_logs or similar tracking table
    const { data: emails, error: emailsError } = await supabase
      .from('email_logs')
      .select('*')
      .gte('created_at', '2025-11-13T00:00:00Z')
      .lte('created_at', '2025-11-13T23:59:59Z');

    if (emailsError && emailsError.code !== 'PGRST116') {
      console.error('\nError querying email_logs:', emailsError);
    } else if (emails) {
      console.log(`\n📧 Emails sent today (Nov 13): ${emails.length}`);
      if (emails.length > 0) {
        console.log('\nEmail details:');
        emails.forEach((email, idx) => {
          console.log(`  ${idx + 1}. To: ${email.to_email || 'N/A'} - Subject: ${email.subject || 'N/A'} - Status: ${email.status || 'N/A'} at ${new Date(email.created_at).toLocaleTimeString()}`);
        });
      }
    }

    // Check for booking_submissions table
    const { data: bookings, error: bookingsError } = await supabase
      .from('booking_submissions')
      .select('*')
      .gte('created_at', '2025-11-13T00:00:00Z')
      .lte('created_at', '2025-11-13T23:59:59Z');

    if (bookingsError && bookingsError.code !== 'PGRST116') {
      console.error('\nError querying booking_submissions:', bookingsError);
    } else if (bookings) {
      console.log(`\n📝 Booking submissions today (Nov 13): ${bookings.length}`);
      if (bookings.length > 0) {
        console.log('\nBooking details:');
        bookings.forEach((booking, idx) => {
          console.log(`  ${idx + 1}. ${booking.firstName || ''} ${booking.lastName || ''} - ${booking.email || booking.phone || 'N/A'} at ${new Date(booking.created_at).toLocaleTimeString()}`);
        });
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkLeadEmails();
