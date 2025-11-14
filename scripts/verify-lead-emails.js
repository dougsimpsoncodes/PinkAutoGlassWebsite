#!/usr/bin/env node
/**
 * Verify that all leads in database received alert emails via Resend
 */

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.production' });

async function verifyLeadEmails() {
  console.log('🔍 Checking which leads received alert emails...\n');

  // Initialize clients
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    // Step 1: Get all leads from database (exclude test leads)
    console.log('📊 Fetching leads from database...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadsError) throw leadsError;

    // Filter out test leads and leads without email
    const realLeads = leads.filter(lead => {
      if (!lead.email) return false; // Skip leads without email

      const email = lead.email.toLowerCase();
      const firstName = (lead.first_name || '').toLowerCase();
      const lastName = (lead.last_name || '').toLowerCase();

      return !email.includes('test') &&
             !email.includes('example.com') &&
             !firstName.includes('test') &&
             !firstName.includes('smoke') &&
             !lastName.includes('test') &&
             !lastName.includes('smoke') &&
             !firstName.includes('e2e') &&
             !lastName.includes('e2e');
    });

    console.log(`✅ Found ${realLeads.length} real leads (${leads.length - realLeads.length} test leads excluded)\n`);

    // Step 2: Get sent emails from Resend
    console.log('📧 Fetching sent emails from Resend API...');

    // Resend API returns paginated results - we'll fetch multiple pages if needed
    let allSentEmails = [];
    let hasMore = true;
    let page = 1;

    // Note: The Resend API key is restricted - we can only call list() without parameters
    // Adding parameters like { limit: 100 } causes a 401 "restricted to only send emails" error
    const response = await resend.emails.list();

    if (response && response.data && response.data.data) {
      allSentEmails = response.data.data;
      console.log(`  Retrieved ${allSentEmails.length} emails from Resend`);

      if (response.data.has_more) {
        console.log(`  ⚠️  Note: There are more emails available, but pagination requires API key with full permissions`);
      }
    } else if (response && response.error) {
      console.error('❌ Resend API Error:', response.error);
      throw new Error(`Resend API failed: ${response.error.message}`);
    } else {
      console.warn('⚠️  Unexpected response format from Resend API');
    }

    console.log(`✅ Found ${allSentEmails.length} sent emails in Resend\n`);

    // Step 3: Match leads to sent emails
    console.log('🔍 Matching leads to sent emails...\n');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pinkautoglass.com';
    const adminEmails = adminEmail.split(',').map(e => e.trim().toLowerCase());

    const results = {
      withEmail: [],
      withoutEmail: [],
      adminEmails: [],
    };

    // Fetch full email content to match by lead email address
    console.log('📥 Fetching full email content for matching...');
    const emailsWithContent = [];

    for (const email of allSentEmails) {
      try {
        const fullEmail = await resend.emails.get(email.id);
        if (fullEmail && fullEmail.data) {
          emailsWithContent.push({
            ...email,
            html: fullEmail.data.html || '',
            text: fullEmail.data.text || ''
          });
        } else {
          emailsWithContent.push(email);
        }
      } catch (err) {
        console.log(`  ⚠️  Could not fetch content for email ${email.id.substring(0, 8)}: ${err.message}`);
        emailsWithContent.push(email);
      }
    }

    console.log(`✅ Fetched content for ${emailsWithContent.filter(e => e.html || e.text).length}/${emailsWithContent.length} emails\n`);

    for (const lead of realLeads) {
      const leadEmail = lead.email.toLowerCase();
      const leadCreatedAt = new Date(lead.created_at);

      // Look for admin notification email that mentions this lead's email address
      const adminNotification = emailsWithContent.find(email => {
        const to = Array.isArray(email.to) ? email.to : [email.to];
        const toEmails = to.map(e => e.toLowerCase());

        // Check if sent to admin
        const sentToAdmin = toEmails.some(e => adminEmails.includes(e));
        if (!sentToAdmin) return false;

        // Check timestamp - email should be sent within 1 hour of lead creation
        const emailSentAt = new Date(email.created_at);
        const timeDiff = emailSentAt - leadCreatedAt;
        const withinTimeWindow = timeDiff >= -60000 && timeDiff <= 3600000; // -1 min to +1 hour

        if (!withinTimeWindow) return false;

        // Match by email address in content or subject
        const subject = (email.subject || '').toLowerCase();
        const html = (email.html || '').toLowerCase();
        const text = (email.text || '').toLowerCase();

        return subject.includes(leadEmail) ||
               html.includes(leadEmail) ||
               text.includes(leadEmail);
      });

      if (adminNotification) {
        results.withEmail.push({
          ...lead,
          emailSentAt: adminNotification.created_at,
          emailId: adminNotification.id,
        });
      } else {
        results.withoutEmail.push(lead);
      }
    }

    // Step 4: Display results
    console.log('=' .repeat(80));
    console.log('📊 RESULTS\n');
    console.log(`✅ Leads WITH alert emails: ${results.withEmail.length}`);
    console.log(`❌ Leads WITHOUT alert emails: ${results.withoutEmail.length}`);
    console.log('='.repeat(80));

    if (results.withoutEmail.length > 0) {
      console.log('\n❌ LEADS MISSING ALERT EMAILS:\n');
      results.withoutEmail.forEach((lead, i) => {
        console.log(`${i + 1}. ${lead.first_name} ${lead.last_name} (${lead.email})`);
        if (lead.phone) console.log(`   Phone: ${lead.phone}`);
        console.log(`   Created: ${new Date(lead.created_at).toLocaleString()}`);
        console.log(`   Lead ID: ${lead.id}`);
        console.log('');
      });
    } else {
      console.log('\n✅ All leads have received alert emails!\n');
    }

    if (results.withEmail.length > 0) {
      console.log('\n✅ RECENT LEADS WITH ALERT EMAILS (last 10):\n');
      results.withEmail.slice(0, 10).forEach((lead, i) => {
        console.log(`${i + 1}. ${lead.first_name} ${lead.last_name} (${lead.email})`);
        console.log(`   Alert sent: ${new Date(lead.emailSentAt).toLocaleString()}`);
        console.log(`   Lead created: ${new Date(lead.created_at).toLocaleString()}`);
        console.log('');
      });
    }

    // Summary
    const successRate = realLeads.length > 0
      ? ((results.withEmail.length / realLeads.length) * 100).toFixed(1)
      : 0;

    console.log('='.repeat(80));
    console.log(`📈 ALERT EMAIL SUCCESS RATE: ${successRate}% (${results.withEmail.length}/${realLeads.length})`);
    console.log('='.repeat(80));

    if (results.withoutEmail.length > 0) {
      console.log('\n⚠️  ACTION NEEDED: Some leads did not receive alert emails.');
      console.log('   Consider manually sending notifications for these leads.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the verification
verifyLeadEmails();
