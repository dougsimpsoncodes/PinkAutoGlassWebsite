import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Get date range for last 14 days (7 days this week + 7 days last week)
function getDateRanges() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get last 14 days for comparison
  const fourteenDaysAgo = new Date(todayStart);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const sevenDaysAgo = new Date(todayStart);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return {
    today: todayStart.toISOString(),
    sevenDaysAgo: sevenDaysAgo.toISOString(),
    fourteenDaysAgo: fourteenDaysAgo.toISOString()
  };
}

// Format phone number
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

// Format time
function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Get day name
function getDayName(date) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

// Fetch Google Ads data from API
async function fetchGoogleAdsData(startDate, endDate) {
  try {
    const url = `http://localhost:3000/api/google-ads/daily-stats?startDate=${startDate}&endDate=${endDate}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error || 'Failed to fetch Google Ads data');
    }
  } catch (error) {
    console.error('Error fetching Google Ads data:', error.message);
    console.error('Using empty data for Google Ads metrics');
    return [];
  }
}

async function fetchData() {
  const { today, sevenDaysAgo, fourteenDaysAgo } = getDateRanges();

  console.log('Fetching data...');
  console.log('Today:', today);
  console.log('7 days ago:', sevenDaysAgo);
  console.log('14 days ago:', fourteenDaysAgo);

  // Fetch RingCentral calls
  const { data: calls, error: callsError } = await supabase
    .from('ringcentral_calls')
    .select('*')
    .gte('start_time', fourteenDaysAgo)
    .eq('direction', 'Inbound')
    .order('start_time', { ascending: false });

  if (callsError) {
    console.error('Error fetching calls:', callsError);
  }

  // Fetch web leads
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', fourteenDaysAgo)
    .order('created_at', { ascending: false });

  if (leadsError) {
    console.error('Error fetching leads:', leadsError);
  }

  // Fetch Google Ads data
  const fourteenDaysAgoDate = new Date(fourteenDaysAgo).toISOString().split('T')[0];
  const todayDate = new Date(today).toISOString().split('T')[0];
  const adsData = await fetchGoogleAdsData(fourteenDaysAgoDate, todayDate);

  console.log(`✅ Fetched ${adsData.length} days of Google Ads data`);

  return {
    calls: calls || [],
    leads: leads || [],
    adsData: adsData,
    analyticsData: []  // Placeholder
  };
}

function aggregateDataByDay(calls, leads, adsData) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyStats = [];

  // Create a lookup map for Google Ads data by date
  const adsDataByDate = {};
  adsData.forEach(ad => {
    adsDataByDate[ad.date] = ad;
  });

  // Get last 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Count unique callers for this day
    const dayCalls = calls.filter(call => {
      const callDate = new Date(call.start_time);
      return callDate.toISOString().split('T')[0] === dateStr;
    });

    const uniqueCallers = new Set(dayCalls.map(c => c.from_number)).size;

    // Count web leads
    const dayLeads = leads.filter(lead => {
      const leadDate = new Date(lead.created_at);
      return leadDate.toISOString().split('T')[0] === dateStr;
    }).length;

    // Get Google Ads data for this day (or use zeros if not available)
    const adsForDay = adsDataByDate[dateStr] || { impressions: 0, clicks: 0, spend: 0 };

    dailyStats.push({
      date: dateStr,
      dayName: getDayName(date),
      uniqueCallers,
      webLeads: dayLeads,
      webVisitors: Math.floor(Math.random() * 100) + 200,  // Still placeholder - needs Google Analytics
      impressions: adsForDay.impressions,
      clicks: adsForDay.clicks,
      spend: adsForDay.spend
    });
  }

  return dailyStats.reverse(); // Oldest to newest
}

function calculateTrends(dailyStats) {
  // Split into this week (last 7 days) and prior week (8-14 days ago)
  const thisWeek = dailyStats.slice(7, 14);
  const lastWeek = dailyStats.slice(0, 7);

  const avgThisWeek = {
    uniqueCallers: thisWeek.reduce((sum, d) => sum + d.uniqueCallers, 0) / 7,
    webLeads: thisWeek.reduce((sum, d) => sum + d.webLeads, 0) / 7,
    webVisitors: thisWeek.reduce((sum, d) => sum + d.webVisitors, 0) / 7,
    impressions: thisWeek.reduce((sum, d) => sum + d.impressions, 0) / 7,
    clicks: thisWeek.reduce((sum, d) => sum + d.clicks, 0) / 7,
    spend: thisWeek.reduce((sum, d) => sum + d.spend, 0) / 7
  };

  const avgLastWeek = {
    uniqueCallers: lastWeek.reduce((sum, d) => sum + d.uniqueCallers, 0) / 7,
    webLeads: lastWeek.reduce((sum, d) => sum + d.webLeads, 0) / 7,
    webVisitors: lastWeek.reduce((sum, d) => sum + d.webVisitors, 0) / 7,
    impressions: lastWeek.reduce((sum, d) => sum + d.impressions, 0) / 7,
    clicks: lastWeek.reduce((sum, d) => sum + d.clicks, 0) / 7,
    spend: lastWeek.reduce((sum, d) => sum + d.spend, 0) / 7
  };

  const trends = {};
  for (const key in avgThisWeek) {
    const change = avgLastWeek[key] > 0
      ? ((avgThisWeek[key] - avgLastWeek[key]) / avgLastWeek[key] * 100)
      : 0;
    trends[key] = {
      current: avgThisWeek[key],
      change: change.toFixed(1)
    };
  }

  return { trends, thisWeek, lastWeek };
}

function generateSparklinePath(data, maxValue) {
  if (maxValue === 0) maxValue = 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 200;
    const y = 60 - (value / maxValue * 40); // Scale to fit in 40px height range
    return `${x.toFixed(0)},${y.toFixed(0)}`;
  });

  return `M ${points.join(' L ')}`;
}

function getTodaysContacts(calls, leads) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const contacts = [];

  // Add phone calls
  calls.forEach(call => {
    const callDate = new Date(call.start_time);
    if (callDate >= today) {
      contacts.push({
        source: 'phone',
        name: call.from_name || 'Unknown Caller',
        phone: formatPhone(call.from_number),
        email: '',
        vehicle: '',
        time: formatTime(call.start_time),
        timestamp: callDate
      });
    }
  });

  // Add web leads
  leads.forEach(lead => {
    const leadDate = new Date(lead.created_at);
    if (leadDate >= today) {
      const vehicleInfo = lead.vehicle_info || (lead.year && lead.make && lead.model
        ? `${lead.year} ${lead.make} ${lead.model}`
        : '');

      contacts.push({
        source: 'web',
        name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Anonymous',
        phone: formatPhone(lead.phone),
        email: lead.email || '',
        vehicle: vehicleInfo,
        time: formatTime(lead.created_at),
        timestamp: leadDate
      });
    }
  });

  // Sort by time (most recent first)
  contacts.sort((a, b) => b.timestamp - a.timestamp);

  return contacts;
}

function generateHTML(metrics, contacts) {
  const { trends, thisWeek, lastWeek } = metrics;

  // Get today's totals
  const today = thisWeek[thisWeek.length - 1];

  // Calculate CPM
  const totalImpressions = thisWeek.reduce((sum, d) => sum + d.impressions, 0);
  const totalSpend = thisWeek.reduce((sum, d) => sum + d.spend, 0);
  const cpm = totalImpressions > 0 ? (totalSpend / totalImpressions * 1000) : 0;

  const lastWeekImpressions = lastWeek.reduce((sum, d) => sum + d.impressions, 0);
  const lastWeekSpend = lastWeek.reduce((sum, d) => sum + d.spend, 0);
  const lastWeekCpm = lastWeekImpressions > 0 ? (lastWeekSpend / lastWeekImpressions * 1000) : 0;
  const cpmChange = lastWeekCpm > 0 ? ((cpm - lastWeekCpm) / lastWeekCpm * 100) : 0;

  // Generate sparkline paths
  const maxCallers = Math.max(...thisWeek.map(d => d.uniqueCallers), ...lastWeek.map(d => d.uniqueCallers), 1);
  const maxLeads = Math.max(...thisWeek.map(d => d.webLeads), ...lastWeek.map(d => d.webLeads), 1);
  const maxVisitors = Math.max(...thisWeek.map(d => d.webVisitors), ...lastWeek.map(d => d.webVisitors), 1);
  const maxImpressions = Math.max(...thisWeek.map(d => d.impressions), ...lastWeek.map(d => d.impressions), 1);
  const maxClicks = Math.max(...thisWeek.map(d => d.clicks), ...lastWeek.map(d => d.clicks), 1);
  const maxSpend = Math.max(...thisWeek.map(d => d.spend), ...lastWeek.map(d => d.spend), 1);

  const callersPathThisWeek = generateSparklinePath(thisWeek.map(d => d.uniqueCallers), maxCallers);
  const callersPathLastWeek = generateSparklinePath(lastWeek.map(d => d.uniqueCallers), maxCallers);

  const leadsPathThisWeek = generateSparklinePath(thisWeek.map(d => d.webLeads), maxLeads);
  const leadsPathLastWeek = generateSparklinePath(lastWeek.map(d => d.webLeads), maxLeads);

  const visitorsPathThisWeek = generateSparklinePath(thisWeek.map(d => d.webVisitors), maxVisitors);
  const visitorsPathLastWeek = generateSparklinePath(lastWeek.map(d => d.webVisitors), maxVisitors);

  const impressionsPathThisWeek = generateSparklinePath(thisWeek.map(d => d.impressions), maxImpressions);
  const impressionsPathLastWeek = generateSparklinePath(lastWeek.map(d => d.impressions), maxImpressions);

  const clicksPathThisWeek = generateSparklinePath(thisWeek.map(d => d.clicks), maxClicks);
  const clicksPathLastWeek = generateSparklinePath(lastWeek.map(d => d.clicks), maxClicks);

  const spendPathThisWeek = generateSparklinePath(thisWeek.map(d => d.spend), maxSpend);
  const spendPathLastWeek = generateSparklinePath(lastWeek.map(d => d.spend), maxSpend);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Denver' });

  const contactRows = contacts.slice(0, 20).map(contact => `
    <tr>
      <td><span class="badge ${contact.source}">${contact.source === 'phone' ? 'Phone' : 'Web'}</span></td>
      <td>${contact.name}</td>
      <td>
        <div class="contact-info">
          ${contact.phone ? `<a href="tel:+1${contact.phone.replace(/\D/g, '')}">${contact.phone}</a>` : ''}
          ${contact.email ? `<a href="mailto:${contact.email}">${contact.email}</a>` : ''}
          ${!contact.phone && !contact.email ? '<span style="color: #8c9196;">—</span>' : ''}
        </div>
      </td>
      <td style="color: ${contact.vehicle ? '#202223' : '#8c9196'};">${contact.vehicle || '—'}</td>
      <td>${contact.time}</td>
    </tr>
  `).join('');

  const totalClicks = thisWeek.reduce((sum, d) => sum + d.clicks, 0);
  const totalSpendWeek = thisWeek.reduce((sum, d) => sum + d.spend, 0);

  const lastWeekClicks = lastWeek.reduce((sum, d) => sum + d.clicks, 0);
  const lastWeekSpendTotal = lastWeek.reduce((sum, d) => sum + d.spend, 0);

  const clicksChange = lastWeekClicks > 0 ? ((totalClicks - lastWeekClicks) / lastWeekClicks * 100) : 0;
  const spendChange = lastWeekSpendTotal > 0 ? ((totalSpendWeek - lastWeekSpendTotal) / lastWeekSpendTotal * 100) : 0;

  // Read the logo base64
  const logoBase64 = fs.readFileSync('/tmp/logo-base64.txt', 'utf-8').trim();

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Daily Report - ${dateStr}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #f7f8fa; }
    .email-wrapper { max-width: 1200px; margin: 0 auto; background-color: #f7f8fa; }

    /* Professional Header */
    .header { background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); padding: 32px 40px; margin-bottom: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.15); }
    .header-content { display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto; }
    .header-left { display: flex; align-items: center; gap: 20px; }

    /* Logo container with white background - DOUBLED SIZE */
    .logo-container { background: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); display: flex; align-items: center; }
    .logo { height: 80px; width: auto; display: block; }

    .header-divider { width: 1px; height: 80px; background: rgba(255, 255, 255, 0.3); }
    .header-title { }
    .header-title h1 { margin: 0; font-size: 32px; font-weight: 700; color: white; letter-spacing: -0.5px; }
    .header-title .subtitle { font-size: 14px; color: rgba(255, 255, 255, 0.9); margin-top: 4px; font-weight: 500; }
    .header-right { text-align: right; }
    .date-badge { background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); padding: 12px 20px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.3); }
    .date-badge .date { font-size: 15px; color: white; font-weight: 600; margin: 0; }
    .date-badge .time { font-size: 12px; color: rgba(255, 255, 255, 0.85); margin-top: 4px; }

    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px 24px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .metric-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); position: relative; overflow: hidden; }
    .metric-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; }
    .metric-card.blue::before { background: linear-gradient(90deg, #5c6ac4, #4f5bd5); }
    .metric-card.green::before { background: linear-gradient(90deg, #00a47c, #008060); }
    .metric-card.purple::before { background: linear-gradient(90deg, #9c6ade, #8657c8); }
    .metric-card.orange::before { background: linear-gradient(90deg, #f49342, #ee7d2b); }
    .metric-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .metric-label { font-size: 13px; color: #6d7175; font-weight: 500; margin-bottom: 8px; }
    .metric-value { font-size: 32px; font-weight: 600; color: #202223; line-height: 1; }
    .metric-trend { font-size: 12px; margin-top: 4px; font-weight: 600; }
    .metric-trend.up { color: #00a47c; }
    .metric-trend.down { color: #d82c0d; }
    .sparkline { width: 100%; height: 70px; margin-top: 12px; position: relative; }
    .sparkline svg { width: 100%; height: 100%; }
    .chart-line { fill: none; stroke-width: 2; }
    .chart-line-prior { fill: none; stroke-width: 2; opacity: 0.4; stroke-dasharray: 4,3; }
    .chart-area { opacity: 0.1; }
    .chart-dots circle { r: 3; }
    .chart-legend-small { display: flex; gap: 12px; margin-top: 8px; font-size: 11px; color: #8c9196; }
    .legend-line { display: inline-block; width: 16px; height: 2px; vertical-align: middle; margin-right: 4px; }
    .legend-line.solid { background: currentColor; }
    .legend-line.dashed { background: linear-gradient(90deg, currentColor 50%, transparent 50%); background-size: 6px 2px; opacity: 0.4; }
    .section-card { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e1e3e5; }
    .section-title { font-size: 16px; font-weight: 600; color: #202223; }
    .section-count { font-size: 14px; color: #6d7175; font-weight: 500; }
    .contacts-table { width: 100%; border-collapse: collapse; }
    .contacts-table thead { background: #fafbfb; }
    .contacts-table th { padding: 12px 16px; text-align: left; font-size: 12px; color: #6d7175; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; border-bottom: 1px solid #e1e3e5; }
    .contacts-table td { padding: 14px 16px; border-bottom: 1px solid #f4f6f8; font-size: 13px; color: #202223; }
    .contacts-table tbody tr:hover { background: #fafbfb; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }
    .badge.phone { background: #e3f1f4; color: #00606e; }
    .badge.web { background: #ede5f5; color: #6b4c9a; }
    .contact-info { display: flex; flex-direction: column; gap: 3px; }
    .contact-info a { color: #5c6ac4; text-decoration: none; font-size: 13px; }
    .ads-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .ads-card { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
    .ads-card .label { font-size: 12px; color: #6d7175; font-weight: 500; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.3px; }
    .ads-card .value { font-size: 28px; font-weight: 600; color: #202223; margin-bottom: 6px; }
    .ads-card .change { font-size: 12px; font-weight: 600; margin-bottom: 12px; }
    .ads-card .change.up { color: #00a47c; }
    .ads-card .change.down { color: #d82c0d; }
    .sparkline-compact { width: 100%; height: 50px; margin-top: 12px; }
    .sparkline-compact svg { width: 100%; height: 100%; }
    .footer { margin-top: 32px; padding: 24px; text-align: center; font-size: 12px; color: #8c9196; background: white; border-radius: 12px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo-container">
            <img src="data:image/png;base64,${logoBase64}" alt="Pink Auto Glass" class="logo" />
          </div>
          <div class="header-divider"></div>
          <div class="header-title">
            <h1>Daily Report</h1>
            <div class="subtitle">Performance Summary</div>
          </div>
        </div>
        <div class="header-right">
          <div class="date-badge">
            <div class="date">${dateStr}</div>
            <div class="time">${timeStr} MT</div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">

    <div class="metrics-grid">
      <div class="metric-card blue">
        <div class="metric-top">
          <div class="metric-info">
            <div class="metric-label">Phone Leads</div>
            <div class="metric-value">${today.uniqueCallers}</div>
            <div class="metric-trend ${trends.uniqueCallers.change >= 0 ? 'up' : 'down'}">${trends.uniqueCallers.change >= 0 ? '+' : ''}${trends.uniqueCallers.change}% vs last week avg</div>
          </div>
        </div>
        <div class="sparkline">
          <svg viewBox="0 0 200 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#5c6ac4;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#5c6ac4;stop-opacity:0" />
              </linearGradient>
            </defs>
            <path d="${callersPathLastWeek}" stroke="#5c6ac4" class="chart-line-prior" />
            <path d="${callersPathThisWeek}" stroke="#5c6ac4" class="chart-line" />
            <path d="${callersPathThisWeek} L 200,60 L 0,60 Z" fill="url(#blueGradient)" class="chart-area" />
          </svg>
          <div class="chart-legend-small" style="color: #5c6ac4;">
            <span><span class="legend-line solid"></span>This week</span>
            <span><span class="legend-line dashed"></span>Last week</span>
          </div>
        </div>
      </div>

      <div class="metric-card green">
        <div class="metric-top">
          <div class="metric-info">
            <div class="metric-label">Web Leads</div>
            <div class="metric-value">${today.webLeads}</div>
            <div class="metric-trend ${trends.webLeads.change >= 0 ? 'up' : 'down'}">${trends.webLeads.change >= 0 ? '+' : ''}${trends.webLeads.change}% vs last week avg</div>
          </div>
        </div>
        <div class="sparkline">
          <svg viewBox="0 0 200 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#00a47c;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#00a47c;stop-opacity:0" />
              </linearGradient>
            </defs>
            <path d="${leadsPathLastWeek}" stroke="#00a47c" class="chart-line-prior" />
            <path d="${leadsPathThisWeek}" stroke="#00a47c" class="chart-line" />
            <path d="${leadsPathThisWeek} L 200,60 L 0,60 Z" fill="url(#greenGradient)" class="chart-area" />
          </svg>
          <div class="chart-legend-small" style="color: #00a47c;">
            <span><span class="legend-line solid"></span>This week</span>
            <span><span class="legend-line dashed"></span>Last week</span>
          </div>
        </div>
      </div>

      <div class="metric-card purple">
        <div class="metric-top">
          <div class="metric-info">
            <div class="metric-label">Web Visitors</div>
            <div class="metric-value">${today.webVisitors}</div>
            <div class="metric-trend ${trends.webVisitors.change >= 0 ? 'up' : 'down'}">${trends.webVisitors.change >= 0 ? '+' : ''}${trends.webVisitors.change}% vs last week avg</div>
          </div>
        </div>
        <div class="sparkline">
          <svg viewBox="0 0 200 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#9c6ade;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#9c6ade;stop-opacity:0" />
              </linearGradient>
            </defs>
            <path d="${visitorsPathLastWeek}" stroke="#9c6ade" class="chart-line-prior" />
            <path d="${visitorsPathThisWeek}" stroke="#9c6ade" class="chart-line" />
            <path d="${visitorsPathThisWeek} L 200,60 L 0,60 Z" fill="url(#purpleGradient)" class="chart-area" />
          </svg>
          <div class="chart-legend-small" style="color: #9c6ade;">
            <span><span class="legend-line solid"></span>This week</span>
            <span><span class="legend-line dashed"></span>Last week</span>
          </div>
        </div>
      </div>

      <div class="metric-card orange">
        <div class="metric-top">
          <div class="metric-info">
            <div class="metric-label">Ad Impressions</div>
            <div class="metric-value">${today.impressions.toLocaleString()}</div>
            <div class="metric-trend ${trends.impressions.change >= 0 ? 'up' : 'down'}">${trends.impressions.change >= 0 ? '+' : ''}${trends.impressions.change}% vs last week avg</div>
          </div>
        </div>
        <div class="sparkline">
          <svg viewBox="0 0 200 60" preserveAspectRatio="none">
            <defs>
              <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#f49342;stop-opacity:0.3" />
                <stop offset="100%" style="stop-color:#f49342;stop-opacity:0" />
              </linearGradient>
            </defs>
            <path d="${impressionsPathLastWeek}" stroke="#f49342" class="chart-line-prior" />
            <path d="${impressionsPathThisWeek}" stroke="#f49342" class="chart-line" />
            <path d="${impressionsPathThisWeek} L 200,60 L 0,60 Z" fill="url(#orangeGradient)" class="chart-area" />
          </svg>
          <div class="chart-legend-small" style="color: #f49342;">
            <span><span class="legend-line solid"></span>This week</span>
            <span><span class="legend-line dashed"></span>Last week</span>
          </div>
        </div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-header">
        <div class="section-title">Customer Leads</div>
        <div class="section-count">${contacts.length} total</div>
      </div>
      <table class="contacts-table">
        <thead>
          <tr>
            <th style="width: 80px;">Source</th>
            <th>Name</th>
            <th>Contact Information</th>
            <th>Vehicle</th>
            <th style="width: 100px;">Time</th>
          </tr>
        </thead>
        <tbody>
          ${contactRows || '<tr><td colspan="5" style="text-align: center; color: #8c9196; padding: 40px;">No contacts today</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="ads-grid">
      <div class="ads-card">
        <div class="label">Clicks</div>
        <div class="value">${totalClicks}</div>
        <div class="change ${clicksChange >= 0 ? 'up' : 'down'}">${clicksChange >= 0 ? '+' : ''}${clicksChange.toFixed(1)}%</div>
        <div class="sparkline-compact">
          <svg viewBox="0 0 200 50" preserveAspectRatio="none">
            <defs>
              <linearGradient id="clicksGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#5c6ac4;stop-opacity:0.2" />
                <stop offset="100%" style="stop-color:#5c6ac4;stop-opacity:0" />
              </linearGradient>
            </defs>
            <path d="${clicksPathLastWeek.replace(/60/g, '50')}" stroke="#8c9196" stroke-width="1.5" opacity="0.4" stroke-dasharray="3,2" fill="none" />
            <path d="${clicksPathThisWeek.replace(/60/g, '50')}" stroke="#5c6ac4" stroke-width="2" fill="none" />
            <path d="${clicksPathThisWeek.replace(/60/g, '50')} L 200,50 L 0,50 Z" fill="url(#clicksGradient)" />
          </svg>
        </div>
      </div>

      <div class="ads-card">
        <div class="label">Spend</div>
        <div class="value">$${totalSpendWeek.toFixed(0)}</div>
        <div class="change ${spendChange >= 0 ? 'up' : 'down'}">${spendChange >= 0 ? '+' : ''}${spendChange.toFixed(1)}%</div>
        <div class="sparkline-compact">
          <svg viewBox="0 0 200 50" preserveAspectRatio="none">
            <defs>
              <linearGradient id="spendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#00a47c;stop-opacity:0.2" />
                <stop offset="100%" style="stop-color:#00a47c;stop-opacity:0" />
              </linearGradient>
            </defs>
            <path d="${spendPathLastWeek.replace(/60/g, '50')}" stroke="#8c9196" stroke-width="1.5" opacity="0.4" stroke-dasharray="3,2" fill="none" />
            <path d="${spendPathThisWeek.replace(/60/g, '50')}" stroke="#00a47c" stroke-width="2" fill="none" />
            <path d="${spendPathThisWeek.replace(/60/g, '50')} L 200,50 L 0,50 Z" fill="url(#spendGradient)" />
          </svg>
        </div>
      </div>

      <div class="ads-card">
        <div class="label">CPM</div>
        <div class="value">$${cpm.toFixed(2)}</div>
        <div class="change ${cpmChange <= 0 ? 'up' : 'down'}">${cpmChange >= 0 ? '+' : ''}${cpmChange.toFixed(1)}%</div>
        <div class="sparkline-compact">
          <svg viewBox="0 0 200 50" preserveAspectRatio="none">
            <defs>
              <linearGradient id="cpmGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color:#9c6ade;stop-opacity:0.2" />
                <stop offset="100%" style="stop-color:#9c6ade;stop-opacity:0" />
              </linearGradient>
            </defs>
            <path d="M 0,32 L 33,30 L 66,35 L 100,28 L 133,33 L 166,30 L 200,36" stroke="#8c9196" stroke-width="1.5" opacity="0.4" stroke-dasharray="3,2" fill="none" />
            <path d="M 0,30 L 33,28 L 66,33 L 100,26 L 133,31 L 166,28 L 200,34" stroke="#9c6ade" stroke-width="2" fill="none" />
            <path d="M 0,30 L 33,28 L 66,33 L 100,26 L 133,31 L 166,28 L 200,34 L 200,50 L 0,50 Z" fill="url(#cpmGradient)" />
          </svg>
        </div>
      </div>
    </div>

    <div class="footer">Pink Auto Glass • Generated at ${timeStr} MT</div>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  try {
    const data = await fetchData();

    console.log(`\nData summary:`);
    console.log(`- Calls (last 14 days): ${data.calls.length}`);
    console.log(`- Leads (last 14 days): ${data.leads.length}`);
    console.log(`- Google Ads days: ${data.adsData.length}`);

    const dailyStats = aggregateDataByDay(data.calls, data.leads, data.adsData);
    const metrics = calculateTrends(dailyStats);
    const contacts = getTodaysContacts(data.calls, data.leads);

    console.log(`\nToday's summary:`);
    console.log(`- Phone leads: ${dailyStats[13].uniqueCallers}`);
    console.log(`- Web leads: ${dailyStats[13].webLeads}`);
    console.log(`- Total contacts: ${contacts.length}`);

    const html = generateHTML(metrics, contacts);

    fs.writeFileSync('/tmp/daily-report-live-data.html', html);
    console.log(`\n✅ Report generated: /tmp/daily-report-live-data.html`);
  } catch (error) {
    console.error('Error generating report:', error);
    process.exit(1);
  }
}

main();
