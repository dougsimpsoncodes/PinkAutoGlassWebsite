/**
 * Send daily report to a single recipient for testing
 * Usage: node scripts/send-daily-report-test.js doug@pinkautoglass.com
 *
 * This script mirrors the cron job logic but sends to a specific email.
 *
 * 5 Lead Sources:
 * 1. Phone Calls - RingCentral inbound calls
 * 2. Quick Quote Requests - Website form submissions (leads table)
 * 3. Click to Call - Website phone click tracking (conversion_events)
 * 4. Click to Text - Website text click tracking (conversion_events)
 * 5. Google Ads - Impressions, clicks, spend, conversions
 */

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { GoogleAdsApi } = require('google-ads-api');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Fetch Google Ads data for a specific date
async function fetchGoogleAdsData(dateStr) {
  try {
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    const customer = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/[-\s]/g, ''),
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    const query = `
      SELECT
        campaign.id,
        campaign.name,
        segments.date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions
      FROM campaign
      WHERE segments.date = '${dateStr}'
        AND campaign.status != 'REMOVED'
    `;

    const results = await customer.query(query);

    let impressions = 0, clicks = 0, spend = 0, conversions = 0;

    results.forEach(row => {
      impressions += parseInt(row.metrics.impressions || '0');
      clicks += parseInt(row.metrics.clicks || '0');
      spend += parseFloat((row.metrics.cost_micros / 1000000).toFixed(2));
      conversions += parseFloat(row.metrics.conversions || '0');
    });

    return { impressions, clicks, spend, conversions };
  } catch (error) {
    console.error('Google Ads API error:', error.message);
    return { impressions: 0, clicks: 0, spend: 0, conversions: 0 };
  }
}

const recipient = process.argv[2];
if (!recipient) {
  console.error('Usage: node scripts/send-daily-report-test.js <email>');
  process.exit(1);
}

// Helper functions
function getDayName(date) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

function formatPhone(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Denver' });
}

// Deduplicate calls
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

// Deduplicate leads
function deduplicateLeads(leads) {
  const contactMap = new Map();
  leads.forEach(lead => {
    const key = (lead.email || lead.phone_e164 || lead.id).toLowerCase();
    const existing = contactMap.get(key);
    if (!existing) {
      contactMap.set(key, lead);
    } else {
      const leadDate = new Date(lead.created_at);
      const existingDate = new Date(existing.created_at);
      if (leadDate > existingDate) {
        contactMap.set(key, lead);
      }
    }
  });
  return Array.from(contactMap.values());
}

// Filter test leads
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

// Get source style for contact labels
function getSourceStyle(source) {
  switch (source) {
    case 'phone':
      return { label: 'Phone Call', color: '#3b82f6' };
    case 'quote':
      return { label: 'Quote Request', color: '#10b981' };
    case 'click-call':
      return { label: 'Click to Call', color: '#8b5cf6' };
    case 'click-text':
      return { label: 'Click to Text', color: '#f59e0b' };
    default:
      return { label: 'Lead', color: '#6b7280' };
  }
}

async function main() {
  console.log(`\n📧 Sending daily report to: ${recipient}\n`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
  }
  if (!resendKey || !fromEmail) {
    console.error('Missing Resend credentials');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const resend = new Resend(resendKey);

  // Calculate date ranges in Mountain Time (UTC-7)
  const mtOffset = -7 * 60;
  const now = new Date();
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
  const mtNow = new Date(utcNow + (mtOffset * 60000));

  // Yesterday in MT
  const yesterdayMT = new Date(mtNow);
  yesterdayMT.setDate(yesterdayMT.getDate() - 1);
  yesterdayMT.setHours(0, 0, 0, 0);
  const yesterdayStartUTC = new Date(yesterdayMT.getTime() - (mtOffset * 60000));

  const todayMT = new Date(mtNow);
  todayMT.setHours(0, 0, 0, 0);
  const todayStartUTC = new Date(todayMT.getTime() - (mtOffset * 60000));

  const fourteenDaysAgoMT = new Date(yesterdayMT);
  fourteenDaysAgoMT.setDate(fourteenDaysAgoMT.getDate() - 14);
  const fourteenDaysAgoUTC = new Date(fourteenDaysAgoMT.getTime() - (mtOffset * 60000));

  console.log(`Report date (MT): ${yesterdayMT.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`);

  // 1. Fetch RingCentral phone calls
  const { data: allCalls } = await supabase
    .from('ringcentral_calls')
    .select('*')
    .gte('start_time', fourteenDaysAgoUTC.toISOString())
    .eq('direction', 'Inbound')
    .order('start_time', { ascending: false });

  const calls = deduplicateCalls(allCalls || []);
  console.log(`1. Phone Calls (RingCentral): ${calls.length} total`);

  // 2. Fetch Quick Quote form submissions
  const { data: allLeads } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', fourteenDaysAgoUTC.toISOString())
    .order('created_at', { ascending: false });

  const filteredLeads = filterTestLeads(allLeads || []);
  const leads = deduplicateLeads(filteredLeads);
  console.log(`2. Quote Requests (forms): ${leads.length} total`);

  // 3 & 4. Fetch conversion events (click-to-call and click-to-text)
  const { data: conversionEvents } = await supabase
    .from('conversion_events')
    .select('*')
    .gte('created_at', fourteenDaysAgoUTC.toISOString())
    .in('event_type', ['phone_click', 'text_click'])
    .order('created_at', { ascending: false });

  const phoneClicks = (conversionEvents || []).filter(e => e.event_type === 'phone_click');
  const textClicks = (conversionEvents || []).filter(e => e.event_type === 'text_click');
  console.log(`3. Click to Call: ${phoneClicks.length} total`);
  console.log(`4. Click to Text: ${textClicks.length} total`);

  // 5. Fetch Google Ads data from API
  const yesterdayDateStr = yesterdayMT.toISOString().split('T')[0];
  console.log(`5. Google Ads: Fetching data for ${yesterdayDateStr}...`);
  const googleAdsData = await fetchGoogleAdsData(yesterdayDateStr);
  console.log(`   Impressions: ${googleAdsData.impressions}, Clicks: ${googleAdsData.clicks}, Spend: $${googleAdsData.spend.toFixed(2)}, Conversions: ${googleAdsData.conversions}`);

  // Calculate yesterday's stats
  const yesterdayCalls = calls.filter(call => {
    const callDate = new Date(call.start_time);
    return callDate >= yesterdayStartUTC && callDate < todayStartUTC;
  });

  // Deduplicate by phone number, keep most recent call per number
  const uniqueCallers = new Map();
  yesterdayCalls.forEach(call => {
    const phone = call.from_number;
    const existing = uniqueCallers.get(phone);
    if (!existing || new Date(call.start_time) > new Date(existing.start_time)) {
      uniqueCallers.set(phone, call);
    }
  });
  const phoneCalls = uniqueCallers.size; // Unique phone numbers

  const quoteRequests = leads.filter(lead => {
    const leadDate = new Date(lead.created_at);
    return leadDate >= yesterdayStartUTC && leadDate < todayStartUTC;
  }).length;

  const clickToCalls = (conversionEvents || []).filter(event => {
    const eventDate = new Date(event.created_at);
    return event.event_type === 'phone_click' && eventDate >= yesterdayStartUTC && eventDate < todayStartUTC;
  }).length;

  const clickToTexts = (conversionEvents || []).filter(event => {
    const eventDate = new Date(event.created_at);
    return event.event_type === 'text_click' && eventDate >= yesterdayStartUTC && eventDate < todayStartUTC;
  }).length;

  // Combine all data for the report
  const reportDay = {
    phoneCalls,
    quoteRequests,
    clickToCalls,
    clickToTexts,
    impressions: googleAdsData.impressions,
    clicks: googleAdsData.clicks,
    spend: googleAdsData.spend,
    conversions: googleAdsData.conversions,
  };

  console.log(`\n=== Yesterday's Stats (${yesterdayMT.toLocaleDateString()}) ===`);
  console.log(`Phone Calls: ${reportDay.phoneCalls}`);
  console.log(`Quote Requests: ${reportDay.quoteRequests}`);
  console.log(`Click to Call: ${reportDay.clickToCalls}`);
  console.log(`Click to Text: ${reportDay.clickToTexts}`);

  // Get yesterday's contacts
  const contacts = [];

  // Phone calls - use unique callers (one entry per phone number)
  uniqueCallers.forEach(call => {
    contacts.push({
      source: 'phone',
      name: call.from_name || 'Unknown Caller',
      phone: formatPhone(call.from_number),
      email: '',
      vehicle: '',
      time: formatTime(call.start_time),
      timestamp: new Date(call.start_time),
    });
  });

  // Quote requests
  leads.filter(lead => {
    const leadDate = new Date(lead.created_at);
    return leadDate >= yesterdayStartUTC && leadDate < todayStartUTC;
  }).forEach(lead => {
    const vehicleInfo = lead.vehicle_year && lead.vehicle_make && lead.vehicle_model
      ? `${lead.vehicle_year} ${lead.vehicle_make} ${lead.vehicle_model}`
      : '';
    contacts.push({
      source: 'quote',
      name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Anonymous',
      phone: formatPhone(lead.phone_e164 || ''),
      email: lead.email || '',
      vehicle: vehicleInfo,
      time: formatTime(lead.created_at),
      timestamp: new Date(lead.created_at),
    });
  });

  // Click events
  (conversionEvents || []).filter(event => {
    const eventDate = new Date(event.created_at);
    return eventDate >= yesterdayStartUTC && eventDate < todayStartUTC;
  }).forEach(event => {
    contacts.push({
      source: event.event_type === 'phone_click' ? 'click-call' : 'click-text',
      name: 'Website Visitor',
      phone: '',
      email: '',
      vehicle: '',
      time: formatTime(event.created_at),
      timestamp: new Date(event.created_at),
      location: event.button_location || '',
    });
  });

  // Sort by time
  contacts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  console.log(`Total contacts: ${contacts.length}`);

  // Calculate trends (simplified - just show 0% for test)
  const trends = {
    phoneCalls: { change: '0.0' },
    quoteRequests: { change: '0.0' },
    clickToCalls: { change: '0.0' },
    clickToTexts: { change: '0.0' },
    impressions: { change: '0.0' },
    clicks: { change: '0.0' },
    spend: { change: '0.0' },
    conversions: { change: '0.0' },
  };

  const totalLeads = reportDay.phoneCalls + reportDay.quoteRequests + reportDay.clickToCalls + reportDay.clickToTexts;

  // Generate HTML
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Business Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #E91E63 0%, #C2185B 100%); padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600;">Daily Business Report</h1>
      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">${yesterdayMT.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <!-- Lead Sources Summary -->
    <div style="padding: 32px 24px 16px 24px;">
      <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #333;">Lead Sources (${totalLeads} total)</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #eff6ff; padding: 14px; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <div style="font-size: 13px; color: #1e40af; margin-bottom: 2px;">Phone Calls</div>
          <div style="font-size: 24px; font-weight: 600; color: #1e3a8a;">${reportDay.phoneCalls}</div>
        </div>
        <div style="background: #ecfdf5; padding: 14px; border-radius: 8px; border-left: 4px solid #10b981;">
          <div style="font-size: 13px; color: #065f46; margin-bottom: 2px;">Quote Requests</div>
          <div style="font-size: 24px; font-weight: 600; color: #064e3b;">${reportDay.quoteRequests}</div>
        </div>
        <div style="background: #f5f3ff; padding: 14px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
          <div style="font-size: 13px; color: #5b21b6; margin-bottom: 2px;">Click to Call</div>
          <div style="font-size: 24px; font-weight: 600; color: #4c1d95;">${reportDay.clickToCalls}</div>
        </div>
        <div style="background: #fffbeb; padding: 14px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <div style="font-size: 13px; color: #92400e; margin-bottom: 2px;">Click to Text</div>
          <div style="font-size: 24px; font-weight: 600; color: #78350f;">${reportDay.clickToTexts}</div>
        </div>
      </div>
    </div>

    <!-- Google Ads Performance -->
    <div style="padding: 16px 24px 32px 24px;">
      <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #333;">Google Ads Performance</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #f8f9fa; padding: 14px; border-radius: 8px;">
          <div style="font-size: 13px; color: #666; margin-bottom: 2px;">Impressions</div>
          <div style="font-size: 24px; font-weight: 600; color: #333;">${reportDay.impressions.toLocaleString()}</div>
        </div>
        <div style="background: #f8f9fa; padding: 14px; border-radius: 8px;">
          <div style="font-size: 13px; color: #666; margin-bottom: 2px;">Ad Clicks</div>
          <div style="font-size: 24px; font-weight: 600; color: #333;">${reportDay.clicks.toLocaleString()}</div>
        </div>
        <div style="background: #f8f9fa; padding: 14px; border-radius: 8px;">
          <div style="font-size: 13px; color: #666; margin-bottom: 2px;">Ad Spend</div>
          <div style="font-size: 24px; font-weight: 600; color: #333;">$${reportDay.spend.toFixed(2)}</div>
        </div>
        <div style="background: #f8f9fa; padding: 14px; border-radius: 8px;">
          <div style="font-size: 13px; color: #666; margin-bottom: 2px;">Click to Call (Ad)</div>
          <div style="font-size: 24px; font-weight: 600; color: #333;">${reportDay.conversions.toFixed(0)}</div>
        </div>
      </div>
    </div>

    ${contacts.length > 0 ? `
    <!-- Yesterday's Activity -->
    <div style="padding: 0 24px 32px 24px;">
      <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333;">Yesterday's Activity (${contacts.length})</h2>
      ${contacts.slice(0, 15).map(contact => {
        const style = getSourceStyle(contact.source);
        return `
        <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="background: ${style.color}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 8px;">${style.label}</span>
            <strong style="color: #333;">${contact.name}</strong>
            <span style="margin-left: auto; color: #666; font-size: 13px;">${contact.time}</span>
          </div>
          ${contact.phone || contact.email ? `
          <div style="font-size: 13px; color: #666;">
            ${contact.phone ? `📞 ${contact.phone}` : ''}
            ${contact.email ? ` • ✉️ ${contact.email}` : ''}
          </div>
          ` : ''}
          ${contact.vehicle ? `<div style="font-size: 13px; color: #666; margin-top: 4px;">🚗 ${contact.vehicle}</div>` : ''}
          ${contact.location ? `<div style="font-size: 12px; color: #999; margin-top: 2px;">Location: ${contact.location}</div>` : ''}
        </div>
      `;}).join('')}
      ${contacts.length > 15 ? `<div style="text-align: center; color: #666; font-size: 14px; margin-top: 12px;">+ ${contacts.length - 15} more activities</div>` : ''}
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #666; font-size: 13px;">Pink Auto Glass Daily Report</p>
      <p style="margin: 8px 0 0 0; color: #999; font-size: 12px;">Automated daily business metrics</p>
    </div>

  </div>
</body>
</html>
`;

  // Send email
  const subject = `Daily Report - ${yesterdayMT.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  console.log(`\nSending email...`);
  console.log(`Subject: ${subject}`);

  const { data, error } = await resend.emails.send({
    from: `Pink Auto Glass <${fromEmail}>`,
    to: recipient,
    subject,
    html,
  });

  if (error) {
    console.error('❌ Failed to send email:', error);
    process.exit(1);
  }

  console.log(`\n✅ Email sent successfully to ${recipient}`);
  console.log(`   Email ID: ${data.id}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
