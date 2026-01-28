/**
 * Generate Daily Report HTML Preview
 * This script fetches all data and generates the HTML email for preview
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Mountain Time helpers
const mtOffset = -7 * 60;
const now = new Date();
const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
const mtNow = new Date(utcNow + (mtOffset * 60000));

const todayMT = new Date(mtNow);
todayMT.setHours(0, 0, 0, 0);

const yesterdayMT = new Date(todayMT);
yesterdayMT.setDate(yesterdayMT.getDate() - 1);

const fourteenDaysAgoMT = new Date(todayMT);
fourteenDaysAgoMT.setDate(fourteenDaysAgoMT.getDate() - 14);
const fourteenDaysAgoUTC = new Date(fourteenDaysAgoMT.getTime() - (mtOffset * 60000));

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

async function generateReport() {
  console.error('Fetching data from database...');

  // 1. Fetch calls
  const { data: allCalls } = await supabase
    .from('ringcentral_calls')
    .select('*')
    .gte('start_time', fourteenDaysAgoUTC.toISOString())
    .eq('direction', 'Inbound')
    .order('start_time', { ascending: false });

  // Deduplicate calls by session_id
  const sessionMap = new Map();
  (allCalls || []).forEach(call => {
    if (!sessionMap.has(call.session_id)) {
      sessionMap.set(call.session_id, call);
    }
  });
  const calls = Array.from(sessionMap.values());

  // 2. Fetch leads
  const { data: allLeads } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', fourteenDaysAgoUTC.toISOString())
    .order('created_at', { ascending: false });

  // Filter test leads
  const leads = (allLeads || []).filter(lead => {
    const email = (lead.email || '').toLowerCase();
    const name = ((lead.first_name || '') + ' ' + (lead.last_name || '')).toLowerCase();
    const hasTest = email.includes('test') || name.includes('test');
    const isPink = email.endsWith('@pink.com') || email.endsWith('@pinkautoglass.com');
    return !(hasTest && isPink);
  });

  // 3. Fetch conversion events
  const { data: allConversionEvents } = await supabase
    .from('conversion_events')
    .select('*')
    .gte('created_at', fourteenDaysAgoUTC.toISOString())
    .in('event_type', ['phone_click', 'text_click']);

  // Deduplicate conversion events by session_id + event_type
  const eventSessionMap = new Map();
  (allConversionEvents || []).forEach(event => {
    const key = `${event.session_id || event.id}_${event.event_type}`;
    const existing = eventSessionMap.get(key);
    if (!existing) {
      eventSessionMap.set(key, event);
    } else {
      // Keep earliest click
      if (new Date(event.created_at) < new Date(existing.created_at)) {
        eventSessionMap.set(key, event);
      }
    }
  });
  const conversionEvents = Array.from(eventSessionMap.values());

  console.error(`Fetched: ${calls.length} calls, ${leads.length} leads`);
  console.error(`Conversion events: ${(allConversionEvents || []).length} raw → ${conversionEvents.length} deduplicated`);

  // Calculate yesterday stats
  const yesterdayStartUTC = new Date(yesterdayMT.getTime() - (mtOffset * 60000));
  const todayStartUTC = new Date(todayMT.getTime() - (mtOffset * 60000));

  const yesterdayCalls = calls.filter(c => {
    const d = new Date(c.start_time);
    return d >= yesterdayStartUTC && d < todayStartUTC;
  });
  const phoneCalls = new Set(yesterdayCalls.map(c => c.from_number)).size;

  const yesterdayLeads = leads.filter(l => {
    const d = new Date(l.created_at);
    return d >= yesterdayStartUTC && d < todayStartUTC;
  });
  const quoteRequests = yesterdayLeads.length;

  const clickToCalls = (conversionEvents || []).filter(e => {
    const d = new Date(e.created_at);
    return e.event_type === 'phone_click' && d >= yesterdayStartUTC && d < todayStartUTC;
  }).length;

  const clickToTexts = (conversionEvents || []).filter(e => {
    const d = new Date(e.created_at);
    return e.event_type === 'text_click' && d >= yesterdayStartUTC && d < todayStartUTC;
  }).length;

  console.error(`Yesterday (${yesterdayMT.toISOString().split('T')[0]}): ${phoneCalls} calls, ${quoteRequests} quotes, ${clickToCalls} click-calls, ${clickToTexts} click-texts`);

  // Real data from admin dashboard APIs for Dec 3:
  // curl "https://pinkautoglass.com/api/admin/dashboard/google-ads?period=yesterday"
  // curl "https://pinkautoglass.com/api/admin/dashboard/microsoft-ads?period=yesterday"
  const googleAds = {
    impressions: 267,
    clicks: 9,
    spend: 161.53,
    conversions: 0
  };
  console.error('Google Ads (from API):', googleAds);

  const msAds = {
    impressions: 2160,
    clicks: 36,
    spend: 90.00,
    conversions: 0
  };
  console.error('Microsoft Ads (from API):', msAds);

  // Get yesterday's contacts
  const contacts = [];

  // Add calls
  const uniqueCallers = new Map();
  yesterdayCalls.forEach(call => {
    const phone = call.from_number;
    if (!uniqueCallers.has(phone) || new Date(call.start_time) > new Date(uniqueCallers.get(phone).start_time)) {
      uniqueCallers.set(phone, call);
    }
  });
  uniqueCallers.forEach(call => {
    contacts.push({
      source: 'phone',
      name: call.from_name || 'Unknown Caller',
      phone: formatPhone(call.from_number),
      email: '',
      vehicle: '',
      time: formatTime(call.start_time),
      timestamp: new Date(call.start_time)
    });
  });

  // Add leads
  yesterdayLeads.forEach(lead => {
    const vehicleInfo = lead.vehicle_info ||
      (lead.vehicle_year && lead.vehicle_make && lead.vehicle_model
        ? `${lead.vehicle_year} ${lead.vehicle_make} ${lead.vehicle_model}`
        : '');
    contacts.push({
      source: 'quote',
      name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Anonymous',
      phone: formatPhone(lead.phone_e164 || lead.phone || ''),
      email: lead.email || '',
      vehicle: vehicleInfo,
      time: formatTime(lead.created_at),
      timestamp: new Date(lead.created_at)
    });
  });

  // Add click events (deduplicated)
  const yesterdayClicks = conversionEvents.filter(e => {
    const d = new Date(e.created_at);
    return d >= yesterdayStartUTC && d < todayStartUTC;
  });
  yesterdayClicks.forEach(event => {
    contacts.push({
      source: event.event_type === 'phone_click' ? 'click-call' : 'click-text',
      name: 'Website Visitor',
      phone: '',
      email: '',
      vehicle: '',
      time: formatTime(event.created_at),
      timestamp: new Date(event.created_at),
      location: event.button_location || ''
    });
  });

  // Sort contacts by time
  contacts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const totalLeads = phoneCalls + quoteRequests + clickToCalls + clickToTexts;

  // Generate HTML
  const html = generateHTML({
    phoneCalls,
    quoteRequests,
    clickToCalls,
    clickToTexts,
    totalLeads,
    googleAds,
    msAds,
    contacts,
    yesterdayDate: yesterdayMT
  });

  // Output HTML to stdout
  console.log(html);
}

function getSourceStyle(source) {
  switch (source) {
    case 'phone': return { label: 'Phone Call', color: '#3b82f6' };
    case 'quote': return { label: 'Quote Request', color: '#10b981' };
    case 'click-call': return { label: 'Click to Call', color: '#8b5cf6' };
    case 'click-text': return { label: 'Click to Text', color: '#f59e0b' };
    default: return { label: 'Lead', color: '#6b7280' };
  }
}

function generateHTML(data) {
  const { phoneCalls, quoteRequests, clickToCalls, clickToTexts, totalLeads, googleAds, msAds, contacts, yesterdayDate } = data;

  const dateStr = yesterdayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Business Report</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 420px; margin: 20px auto; background-color: white; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #E91E63 0%, #C2185B 100%); padding: 18px 16px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 20px; font-weight: 600;">Daily Business Report</h1>
      <p style="margin: 4px 0 0 0; color: rgba(255,255,255,0.9); font-size: 12px;">${dateStr}</p>
    </div>

    <!-- Lead Sources Summary -->
    <div style="padding: 16px 16px 8px 16px;">
      <h2 style="margin: 0 0 12px 0; font-size: 13px; color: #333;">Lead Sources (${totalLeads} total)</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div style="background: #eff6ff; padding: 10px; border-radius: 6px; border-left: 3px solid #3b82f6;">
          <div style="font-size: 10px; color: #1e40af; margin-bottom: 1px;">Phone Calls</div>
          <div style="font-size: 18px; font-weight: 600; color: #1e3a8a;">${phoneCalls}</div>
        </div>
        <div style="background: #ecfdf5; padding: 10px; border-radius: 6px; border-left: 3px solid #10b981;">
          <div style="font-size: 10px; color: #065f46; margin-bottom: 1px;">Quote Requests</div>
          <div style="font-size: 18px; font-weight: 600; color: #064e3b;">${quoteRequests}</div>
        </div>
        <div style="background: #f5f3ff; padding: 10px; border-radius: 6px; border-left: 3px solid #8b5cf6;">
          <div style="font-size: 10px; color: #5b21b6; margin-bottom: 1px;">Click to Call</div>
          <div style="font-size: 18px; font-weight: 600; color: #4c1d95;">${clickToCalls}</div>
        </div>
        <div style="background: #fffbeb; padding: 10px; border-radius: 6px; border-left: 3px solid #f59e0b;">
          <div style="font-size: 10px; color: #92400e; margin-bottom: 1px;">Click to Text</div>
          <div style="font-size: 18px; font-weight: 600; color: #78350f;">${clickToTexts}</div>
        </div>
      </div>
    </div>

    <!-- Google Ads Performance -->
    <div style="padding: 12px 16px 16px 16px;">
      <h2 style="margin: 0 0 12px 0; font-size: 13px; color: #333;">Google Ads Performance</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div style="background: #f8f9fa; padding: 10px; border-radius: 6px;">
          <div style="font-size: 10px; color: #666; margin-bottom: 1px;">Impressions</div>
          <div style="font-size: 18px; font-weight: 600; color: #333;">${googleAds.impressions.toLocaleString()}</div>
        </div>
        <div style="background: #f8f9fa; padding: 10px; border-radius: 6px;">
          <div style="font-size: 10px; color: #666; margin-bottom: 1px;">Ad Clicks</div>
          <div style="font-size: 18px; font-weight: 600; color: #333;">${googleAds.clicks.toLocaleString()}</div>
        </div>
        <div style="background: #f8f9fa; padding: 10px; border-radius: 6px;">
          <div style="font-size: 10px; color: #666; margin-bottom: 1px;">Ad Spend</div>
          <div style="font-size: 18px; font-weight: 600; color: #333;">$${googleAds.spend.toFixed(2)}</div>
        </div>
        <div style="background: #f8f9fa; padding: 10px; border-radius: 6px;">
          <div style="font-size: 10px; color: #666; margin-bottom: 1px;">Conversions</div>
          <div style="font-size: 18px; font-weight: 600; color: #333;">${googleAds.conversions.toFixed(0)}</div>
        </div>
      </div>
    </div>

    <!-- Microsoft Ads Performance -->
    <div style="padding: 0 16px 16px 16px;">
      <h2 style="margin: 0 0 12px 0; font-size: 13px; color: #333;">Microsoft Ads Performance</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <div style="background: #eff6ff; padding: 10px; border-radius: 6px; border-left: 3px solid #0078d4;">
          <div style="font-size: 10px; color: #1e40af; margin-bottom: 1px;">Impressions</div>
          <div style="font-size: 18px; font-weight: 600; color: #1e3a8a;">${msAds.impressions.toLocaleString()}</div>
        </div>
        <div style="background: #eff6ff; padding: 10px; border-radius: 6px; border-left: 3px solid #0078d4;">
          <div style="font-size: 10px; color: #1e40af; margin-bottom: 1px;">Ad Clicks</div>
          <div style="font-size: 18px; font-weight: 600; color: #1e3a8a;">${msAds.clicks.toLocaleString()}</div>
        </div>
        <div style="background: #eff6ff; padding: 10px; border-radius: 6px; border-left: 3px solid #0078d4;">
          <div style="font-size: 10px; color: #1e40af; margin-bottom: 1px;">Ad Spend</div>
          <div style="font-size: 18px; font-weight: 600; color: #1e3a8a;">$${msAds.spend.toFixed(2)}</div>
        </div>
        <div style="background: #eff6ff; padding: 10px; border-radius: 6px; border-left: 3px solid #0078d4;">
          <div style="font-size: 10px; color: #1e40af; margin-bottom: 1px;">Conversions</div>
          <div style="font-size: 18px; font-weight: 600; color: #1e3a8a;">${msAds.conversions.toFixed(0)}</div>
        </div>
      </div>
    </div>

    ${contacts.length > 0 ? `
    <!-- Yesterday's Activity -->
    <div style="padding: 0 16px 16px 16px;">
      <h2 style="margin: 0 0 10px 0; font-size: 13px; color: #333;">Yesterday's Activity (${contacts.length})</h2>
      ${contacts.slice(0, 10).map(contact => {
        const style = getSourceStyle(contact.source);
        return `
        <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; margin-bottom: 2px;">
            <span style="background: ${style.color}; color: white; padding: 1px 6px; border-radius: 3px; font-size: 9px; margin-right: 6px;">${style.label}</span>
            <strong style="color: #333; font-size: 11px;">${contact.name}</strong>
            <span style="margin-left: auto; color: #666; font-size: 10px;">${contact.time}</span>
          </div>
          ${contact.phone || contact.email ? `
          <div style="font-size: 10px; color: #666;">
            ${contact.phone ? `📞 ${contact.phone}` : ''}
            ${contact.email ? ` • ✉️ ${contact.email}` : ''}
          </div>
          ` : ''}
          ${contact.vehicle ? `<div style="font-size: 10px; color: #666; margin-top: 2px;">🚗 ${contact.vehicle}</div>` : ''}
        </div>
      `;}).join('')}
      ${contacts.length > 10 ? `<div style="text-align: center; color: #666; font-size: 10px; margin-top: 8px;">+ ${contacts.length - 10} more activities</div>` : ''}
    </div>
    ` : ''}

    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 12px 16px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0; color: #666; font-size: 10px;">Pink Auto Glass Daily Report</p>
      <p style="margin: 4px 0 0 0; color: #999; font-size: 9px;">Automated daily business metrics</p>
    </div>

  </div>
</body>
</html>
`;
}

generateReport().catch(console.error);
