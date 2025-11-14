#!/usr/bin/env node
/**
 * Verify that all leads in database received alert emails
 * Uses exported CSV from Resend dashboard
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.production' });

async function verifyEmailsFromCSV() {
  console.log('🔍 Checking which leads received alert emails using CSV export...\n');

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Step 1: Find the CSV file
    const csvFiles = fs.readdirSync('.').filter(f => f.startsWith('emails-sent-') && f.endsWith('.csv'));
    if (csvFiles.length === 0) {
      throw new Error('No emails-sent CSV file found in current directory');
    }

    const csvFile = csvFiles[csvFiles.length - 1]; // Use most recent
    console.log(`📄 Reading CSV file: ${csvFile}\n`);

    // Step 2: Parse CSV (handle multi-line fields)
    const csvContent = fs.readFileSync(csvFile, 'utf-8');
    const lines = csvContent.split('\n');

    const emails = [];
    let currentLine = '';

    for (let i = 1; i < lines.length; i++) {
      currentLine += lines[i];

      // Check if this is a complete row (has correct number of commas)
      const commaCount = (currentLine.match(/,/g) || []).length;

      if (commaCount >= 11 || i === lines.length - 1) {
        if (!currentLine.trim()) {
          currentLine = '';
          continue;
        }

        // Parse the row
        const values = currentLine.split(',');
        const email = {
          id: values[0] || '',
          created_at: values[1] || '',
          subject: values[2] || '',
          from: values[3] || '',
          to: values[4] || '',
          last_event: values[7] || ''
        };
        emails.push(email);
        currentLine = '';
      }
    }

    console.log(`✅ Found ${emails.length} sent emails in CSV\n`);

    // Step 3: Get all leads from database (exclude test leads)
    console.log('📊 Fetching leads from database...');
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (leadsError) throw leadsError;

    // Filter out test leads
    const realLeads = leads.filter(lead => {
      if (!lead.email) return false;

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

    // Step 4: Match leads to sent emails
    console.log('🔍 Matching leads to sent emails...\n');

    const adminEmailsStr = process.env.ADMIN_EMAIL || 'admin@pinkautoglass.com';
    const adminEmails = adminEmailsStr.split(',').map(e => e.trim().toLowerCase());

    const results = {
      withEmail: [],
      withoutEmail: [],
    };

    for (const lead of realLeads) {
      const leadCreatedAt = new Date(lead.created_at);
      const firstName = (lead.first_name || '').toLowerCase();
      const lastName = (lead.last_name || '').toLowerCase();
      const leadIdPrefix = lead.id.substring(0, 8).toUpperCase();

      // Look for admin notification email
      const adminNotification = emails.find(email => {
        // Check if sent to admin
        const toEmails = email.to.toLowerCase();
        const sentToAdmin = adminEmails.some(admin => toEmails.includes(admin));

        if (!sentToAdmin) return false;

        // Check timestamp - within 1 hour
        const emailSentAt = new Date(email.created_at);
        const timeDiff = emailSentAt - leadCreatedAt;
        const withinTimeWindow = timeDiff >= -60000 && timeDiff <= 3600000;

        if (!withinTimeWindow) return false;

        // Match by name in subject or lead ID
        const subject = email.subject.toLowerCase();

        // Check for lead ID reference (like "70D358F3") - for booking emails
        if (subject.includes(leadIdPrefix.toLowerCase())) {
          return true;
        }

        // For Quick Quote emails, match by first name only (since many don't have last names in DB)
        if (subject.includes('quick quote') && firstName && firstName !== 'null' && firstName.length >= 3) {
          return subject.includes(firstName);
        }

        // For other emails, try to match both first and last name
        if (firstName && lastName &&
            firstName !== 'null' && lastName !== 'null' &&
            firstName.length >= 3 && lastName.length >= 3) {
          return subject.includes(firstName) && subject.includes(lastName);
        }

        return false;
      });

      if (adminNotification) {
        results.withEmail.push({
          ...lead,
          emailSentAt: adminNotification.created_at,
          emailId: adminNotification.id,
          emailSubject: adminNotification.subject
        });
      } else {
        results.withoutEmail.push(lead);
      }
    }

    // Step 5: Display results
    console.log('='.repeat(80));
    console.log('📊 RESULTS\n');
    console.log(`✅ Leads WITH alert emails: ${results.withEmail.length}`);
    console.log(`❌ Leads WITHOUT alert emails: ${results.withoutEmail.length}`);
    console.log('='.repeat(80));

    if (results.withoutEmail.length > 0) {
      console.log('\n❌ LEADS MISSING ALERT EMAILS:\n');
      results.withoutEmail.forEach((lead, i) => {
        console.log(`${i + 1}. ${lead.first_name} ${lead.last_name} (${lead.email})`);
        console.log(`   Created: ${new Date(lead.created_at).toLocaleString()}`);
        console.log(`   Lead ID: ${lead.id.substring(0, 8)}`);
        console.log('');
      });
    } else {
      console.log('\n✅ All leads have received alert emails!\n');
    }

    if (results.withEmail.length > 0) {
      console.log('\n✅ RECENT LEADS WITH ALERT EMAILS (last 10):\n');
      results.withEmail.slice(0, 10).forEach((lead, i) => {
        console.log(`${i + 1}. ${lead.first_name} ${lead.last_name} (${lead.email})`);
        console.log(`   Alert: ${lead.emailSubject}`);
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
verifyEmailsFromCSV();
