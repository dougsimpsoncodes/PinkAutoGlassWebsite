import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Resend } from 'resend';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.production') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const resend = new Resend(process.env.RESEND_API_KEY);

// Import the functions from the preview script
async function fetchData() {
  const { today, sevenDaysAgo, fourteenDaysAgo } = getDateRanges();

  // Fetch calls
  const { data: calls, error: callsError } = await supabase
    .from('ringcentral_calls')
    .select('*')
    .gte('start_time', fourteenDaysAgo)
    .eq('direction', 'Inbound')
    .order('start_time', { ascending: false });

  if (callsError) throw callsError;

  // Deduplicate calls
  const deduplicatedCalls = deduplicateCalls(calls);

  // Fetch leads
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', fourteenDaysAgo)
    .order('created_at', { ascending: false });

  if (leadsError) throw leadsError;

  // Filter test leads
  const filteredLeads = filterTestLeads(leads);

  // Deduplicate leads
  const deduplicatedLeads = deduplicateLeads(filteredLeads);

  // Fetch Google Ads data
  const adsData = [];

  return {
    calls: deduplicatedCalls,
    leads: deduplicatedLeads,
    adsData: adsData,
  };
}

function getDateRanges() {
  const now = new Date();
  const reportDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  reportDate.setHours(0, 0, 0, 0);

  const fourteenDaysAgo = new Date(reportDate);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const sevenDaysAgo = new Date(reportDate);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return {
    today: reportDate.toISOString(),
    sevenDaysAgo: sevenDaysAgo.toISOString(),
    fourteenDaysAgo: fourteenDaysAgo.toISOString()
  };
}

function deduplicateCalls(calls) {
  const sessionMap = new Map();

  calls.forEach(call => {
    const existing = sessionMap.get(call.session_id);

    if (!existing) {
      sessionMap.set(call.session_id, call);
    } else {
      const isInboundToUs = call.direction === 'Inbound' && call.to_number === '+17209187465';
      const existingIsInboundToUs = existing.direction === 'Inbound' && existing.to_number === '+17209187465';

      if (isInboundToUs && !existingIsInboundToUs) {
        sessionMap.set(call.session_id, call);
      }
    }
  });

  return Array.from(sessionMap.values());
}

function filterTestLeads(leads) {
  return leads.filter(lead => {
    const email = (lead.email || '').toLowerCase();
    const firstName = (lead.first_name || '').toLowerCase();
    const lastName = (lead.last_name || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();

    const hasTestInEmail = email.includes('test');
    const hasTestInName = fullName.includes('test') || firstName.includes('test') || lastName.includes('test');
    const hasTest = hasTestInEmail || hasTestInName;

    const isPinkDomain = email.endsWith('@pink.com') || email.endsWith('@pinkautoglass.com');

    const isTestLead = hasTest && isPinkDomain;

    return !isTestLead;
  });
}

function deduplicateLeads(leads) {
  const seenMap = new Map();

  leads.forEach(lead => {
    const email = (lead.email || '').toLowerCase();
    const phone = (lead.phone_e164 || lead.phone || '').replace(/\D/g, '');
    const key = email || phone;

    if (!key) {
      return;
    }

    const existing = seenMap.get(key);
    if (!existing) {
      seenMap.set(key, lead);
    } else {
      const currentDate = new Date(lead.created_at);
      const existingDate = new Date(existing.created_at);
      if (currentDate > existingDate) {
        seenMap.set(key, lead);
      }
    }
  });

  return Array.from(seenMap.values());
}

function getTodaysContacts(calls, leads) {
  const now = new Date();
  const reportDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  reportDate.setHours(0, 0, 0, 0);

  const nextDay = new Date(reportDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const contacts = [];

  calls.forEach(call => {
    const callDate = new Date(call.start_time);
    if (callDate >= reportDate && callDate < nextDay) {
      contacts.push({
        source: 'phone',
        name: call.from_name || 'Unknown Caller',
        phone: call.from_number,
        email: '',
        vehicle: '',
        time: new Date(call.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        timestamp: callDate
      });
    }
  });

  leads.forEach(lead => {
    const leadDate = new Date(lead.created_at);
    if (leadDate >= reportDate && leadDate < nextDay) {
      const vehicleInfo = lead.vehicle_info || (lead.year && lead.make && lead.model
        ? `${lead.year} ${lead.make} ${lead.model}`
        : '');

      contacts.push({
        source: 'web',
        name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Anonymous',
        phone: lead.phone_e164 || lead.phone || '',
        email: lead.email || '',
        vehicle: vehicleInfo,
        time: new Date(lead.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
        timestamp: leadDate
      });
    }
  });

  contacts.sort((a, b) => b.timestamp - a.timestamp);

  // Deduplicate contacts
  const uniqueContacts = [];
  const seen = new Set();

  contacts.forEach(contact => {
    const key = (contact.email || contact.phone || '').toLowerCase().replace(/\D/g, '');

    if (key && !seen.has(key)) {
      seen.add(key);
      uniqueContacts.push(contact);
    } else if (!key) {
      uniqueContacts.push(contact);
    }
  });

  return uniqueContacts;
}

async function sendTestReport() {
  console.log('🔄 Generating test daily report...');

  // Fetch data
  const data = await fetchData();
  const contacts = getTodaysContacts(data.calls, data.leads);

  // Count actual unique contacts
  const actualPhoneLeads = contacts.filter(c => c.source === 'phone').length;
  const actualWebLeads = contacts.filter(c => c.source === 'web').length;

  console.log(`\n📊 Report Summary:`);
  console.log(`- Phone Leads: ${actualPhoneLeads}`);
  console.log(`- Web Leads: ${actualWebLeads}`);
  console.log(`- Total Contacts: ${contacts.length}`);

  // Generate simple HTML (basic version for testing)
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Daily Report - TEST</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #FF1493 0%, #FF69B4 100%); padding: 24px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 24px;">Daily Report - TEST</h1>
      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <!-- Metrics -->
    <div style="padding: 32px 24px;">
      <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #333;">Key Metrics</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
          <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Phone Leads</div>
          <div style="font-size: 28px; font-weight: 600; color: #333;">${actualPhoneLeads}</div>
        </div>
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
          <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Web Leads</div>
          <div style="font-size: 28px; font-weight: 600; color: #333;">${actualWebLeads}</div>
        </div>
      </div>
    </div>

    ${contacts.length > 0 ? `
    <!-- Today's Contacts -->
    <div style="padding: 0 24px 32px 24px;">
      <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333;">Yesterday's Contacts (${contacts.length})</h2>
      ${contacts.slice(0, 10).map(contact => `
        <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="background: ${contact.source === 'phone' ? '#3b82f6' : '#10b981'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase; margin-right: 8px;">${contact.source}</span>
            <strong style="color: #333;">${contact.name}</strong>
            <span style="margin-left: auto; color: #666; font-size: 13px;">${contact.time}</span>
          </div>
          <div style="font-size: 13px; color: #666;">
            ${contact.phone ? `📞 ${contact.phone}` : ''}
            ${contact.email ? ` • ✉️ ${contact.email}` : ''}
          </div>
          ${contact.vehicle ? `<div style="font-size: 13px; color: #666; margin-top: 4px;">🚗 ${contact.vehicle}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 16px; text-align: center; font-size: 12px; color: #666;">
      Pink Auto Glass • Test Report Generated at ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Denver' })} MT
    </div>
  </div>
</body>
</html>
  `;

  // Send email
  console.log('\n📧 Sending test email to doug@pinkautoglass.com...');

  const { data: emailData, error: emailError } = await resend.emails.send({
    from: 'doug@pinkautoglass.com',
    to: ['doug@pinkautoglass.com'],
    subject: `TEST - Daily Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    html: html,
  });

  if (emailError) {
    console.error('❌ Error sending email:', emailError);
    throw emailError;
  }

  console.log('✅ Test email sent successfully!');
  console.log('📬 Email ID:', emailData.id);
}

sendTestReport().catch(console.error);
