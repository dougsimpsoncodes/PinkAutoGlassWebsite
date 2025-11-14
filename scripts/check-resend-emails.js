#!/usr/bin/env node

/**
 * Check Resend API for recent emails sent
 * Usage: node scripts/check-resend-emails.js
 */

require('dotenv').config({ path: '.env.production' });

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not found in .env.local');
  process.exit(1);
}

async function checkRecentEmails() {
  try {
    // Fetch last 100 emails from Resend
    const response = await fetch('https://api.resend.com/emails?limit=100', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Resend API error (${response.status}):`, errorText);
      process.exit(1);
    }

    const data = await response.json();

    console.log('\n📧 Recent Emails from Resend:\n');
    console.log(`Total emails returned: ${data.data?.length || 0}\n`);

    if (!data.data || data.data.length === 0) {
      console.log('No emails found.');
      return;
    }

    // Get admin email from env
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@pinkautoglass.com';

    // Filter for admin emails (emails TO the admin address)
    const adminEmails = data.data.filter(email =>
      email.to && (
        email.to.includes(adminEmail) ||
        (Array.isArray(email.to) && email.to.some(addr => addr.includes(adminEmail)))
      )
    );

    console.log(`📨 Admin notification emails (to ${adminEmail}): ${adminEmails.length}\n`);

    // Show all emails with details
    data.data.forEach((email, index) => {
      const createdDate = new Date(email.created_at);
      const isAdminEmail = email.to && (
        email.to.includes(adminEmail) ||
        (Array.isArray(email.to) && email.to.some(addr => addr.includes(adminEmail)))
      );

      console.log(`${index + 1}. ${isAdminEmail ? '🚨 ADMIN' : '📧 CUSTOMER'}`);
      console.log(`   To: ${Array.isArray(email.to) ? email.to.join(', ') : email.to}`);
      console.log(`   Subject: ${email.subject}`);
      console.log(`   Status: ${email.last_event || 'sent'}`);
      console.log(`   Created: ${createdDate.toLocaleString()}`);
      console.log(`   ID: ${email.id}`);
      console.log('');
    });

    // Count admin emails in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAdminEmails = adminEmails.filter(email =>
      new Date(email.created_at) > oneDayAgo
    );

    console.log(`\n✅ Summary:`);
    console.log(`   - Admin emails in last 24 hours: ${recentAdminEmails.length}`);
    console.log(`   - Total admin emails: ${adminEmails.length}`);
    console.log(`   - Total emails: ${data.data.length}`);

    if (recentAdminEmails.length > 0) {
      console.log(`\n📋 Recent admin emails:`);
      recentAdminEmails.forEach(email => {
        console.log(`   - ${email.subject} (${new Date(email.created_at).toLocaleString()})`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking Resend emails:', error.message);
    process.exit(1);
  }
}

checkRecentEmails();
