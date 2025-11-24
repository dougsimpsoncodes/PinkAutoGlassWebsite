/**
 * Daily Report Cron Job
 * Sends daily business metrics to admin team
 * Triggered by Vercel Cron at 9am MT (4pm UTC)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchCampaignPerformance } from '@/lib/googleAds';
import { sendAdminEmail } from '@/lib/notifications/email';

// Types
interface DailyStats {
  date: string;
  dayName: string;
  uniqueCallers: number;
  webLeads: number;
  webVisitors: number;
  impressions: number;
  clicks: number;
  spend: number;
}

interface Contact {
  source: 'phone' | 'web';
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  time: string;
  timestamp: Date;
}

// Helper functions
function getDayName(date: Date): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

function formatPhone(phone: string): string {
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

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Deduplicate calls - only show one call per session_id
// Logic copied from /src/app/admin/dashboard/calls/page.tsx
function deduplicateCalls(calls: any[]): any[] {
  const sessionMap = new Map<string, any>();

  calls.forEach(call => {
    const existing = sessionMap.get(call.session_id);

    if (!existing) {
      // First party in this session - add it
      sessionMap.set(call.session_id, call);
    } else {
      // Prefer Inbound calls to our business number (+17209187465)
      const isInboundToUs = call.direction === 'Inbound' && call.to_number === '+17209187465';
      const existingIsInboundToUs = existing.direction === 'Inbound' && existing.to_number === '+17209187465';

      if (isInboundToUs && !existingIsInboundToUs) {
        sessionMap.set(call.session_id, call);
      }
    }
  });

  return Array.from(sessionMap.values());
}

// Deduplicate leads - only show one lead per email/phone
function deduplicateLeads(leads: any[]): any[] {
  const contactMap = new Map<string, any>();

  leads.forEach(lead => {
    // Use email as primary key, fallback to phone
    const key = (lead.email || lead.phone || lead.id).toLowerCase();
    const existing = contactMap.get(key);

    if (!existing) {
      contactMap.set(key, lead);
    } else {
      // Keep the most recent one
      const leadDate = new Date(lead.created_at);
      const existingDate = new Date(existing.created_at);
      if (leadDate > existingDate) {
        contactMap.set(key, lead);
      }
    }
  });

  return Array.from(contactMap.values());
}

// Filter out test leads
// Test leads = has "test" in name OR email, AND domain is @pink.com or @pinkautoglass.com
function filterTestLeads(leads: any[]): any[] {
  return leads.filter(lead => {
    const email = (lead.email || '').toLowerCase();
    const firstName = (lead.first_name || '').toLowerCase();
    const lastName = (lead.last_name || '').toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();

    // Check if "test" appears in email or name
    const hasTestInEmail = email.includes('test');
    const hasTestInName = fullName.includes('test') || firstName.includes('test') || lastName.includes('test');
    const hasTest = hasTestInEmail || hasTestInName;

    const isPinkDomain = email.endsWith('@pink.com') || email.endsWith('@pinkautoglass.com');

    // Exclude if BOTH conditions are true
    const isTestLead = hasTest && isPinkDomain;

    return !isTestLead;
  });
}

// Fetch all data
async function fetchData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const fourteenDaysAgo = new Date(todayStart);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  // Fetch calls
  const { data: allCalls } = await supabase
    .from('ringcentral_calls')
    .select('*')
    .gte('start_time', fourteenDaysAgo.toISOString())
    .eq('direction', 'Inbound')
    .order('start_time', { ascending: false });

  // Deduplicate calls (same logic as call analytics page)
  const calls = deduplicateCalls(allCalls || []);

  // Fetch leads, filter test leads, and deduplicate
  const { data: allLeads } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', fourteenDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  const filteredLeads = filterTestLeads(allLeads || []);
  const leads = deduplicateLeads(filteredLeads);

  // Fetch Google Ads data
  const startDate = fourteenDaysAgo.toISOString().split('T')[0];
  const endDate = todayStart.toISOString().split('T')[0];
  const campaigns = await fetchCampaignPerformance(startDate, endDate);

  // Aggregate Ads data by date
  const adsDataByDate: Record<string, { impressions: number; clicks: number; spend: number }> = {};
  campaigns.forEach((campaign: any) => {
    const { date, impressions, clicks, cost } = campaign;
    if (!adsDataByDate[date]) {
      adsDataByDate[date] = { impressions: 0, clicks: 0, spend: 0 };
    }
    adsDataByDate[date].impressions += impressions;
    adsDataByDate[date].clicks += clicks;
    adsDataByDate[date].spend += cost;
  });

  return {
    calls: calls || [],
    leads: leads || [],
    adsDataByDate,
  };
}

// Aggregate data by day
function aggregateDataByDay(calls: any[], leads: any[], adsDataByDate: any): DailyStats[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyStats: DailyStats[] = [];

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const dayCalls = calls.filter((call) => {
      const callDate = new Date(call.start_time);
      return callDate.toISOString().split('T')[0] === dateStr;
    });

    const uniqueCallers = new Set(dayCalls.map((c) => c.from_number)).size;

    const dayLeads = leads.filter((lead) => {
      const leadDate = new Date(lead.created_at);
      return leadDate.toISOString().split('T')[0] === dateStr;
    }).length;

    const adsForDay = adsDataByDate[dateStr] || { impressions: 0, clicks: 0, spend: 0 };

    dailyStats.push({
      date: dateStr,
      dayName: getDayName(date),
      uniqueCallers,
      webLeads: dayLeads,
      webVisitors: Math.floor(Math.random() * 100) + 200, // Placeholder
      impressions: adsForDay.impressions,
      clicks: adsForDay.clicks,
      spend: adsForDay.spend,
    });
  }

  return dailyStats.reverse(); // Oldest to newest
}

// Get today's contacts
function getTodaysContacts(calls: any[], leads: any[]): Contact[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const contacts: Contact[] = [];

  calls.forEach((call) => {
    const callDate = new Date(call.start_time);
    if (callDate >= today) {
      contacts.push({
        source: 'phone',
        name: call.from_name || 'Unknown Caller',
        phone: formatPhone(call.from_number),
        email: '',
        vehicle: '',
        time: formatTime(call.start_time),
        timestamp: callDate,
      });
    }
  });

  leads.forEach((lead) => {
    const leadDate = new Date(lead.created_at);
    if (leadDate >= today) {
      const vehicleInfo =
        lead.vehicle_info || (lead.year && lead.make && lead.model ? `${lead.year} ${lead.make} ${lead.model}` : '');

      contacts.push({
        source: 'web',
        name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Anonymous',
        phone: formatPhone(lead.phone),
        email: lead.email || '',
        vehicle: vehicleInfo,
        time: formatTime(lead.created_at),
        timestamp: leadDate,
      });
    }
  });

  contacts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Deduplicate contacts by phone or email
  const uniqueContacts: Contact[] = [];
  const seen = new Set<string>();

  contacts.forEach((contact) => {
    // Use email as primary key, fallback to phone
    const key = (contact.email || contact.phone || '').toLowerCase().replace(/\D/g, '');

    if (key && !seen.has(key)) {
      seen.add(key);
      uniqueContacts.push(contact);
    } else if (!key) {
      // If no email or phone, include it (shouldn't happen but be safe)
      uniqueContacts.push(contact);
    }
  });

  return uniqueContacts;
}

// Calculate trends
function calculateTrends(dailyStats: DailyStats[]) {
  const thisWeek = dailyStats.slice(7, 14);
  const lastWeek = dailyStats.slice(0, 7);

  const avgThisWeek = {
    uniqueCallers: thisWeek.reduce((sum, d) => sum + d.uniqueCallers, 0) / 7,
    webLeads: thisWeek.reduce((sum, d) => sum + d.webLeads, 0) / 7,
    webVisitors: thisWeek.reduce((sum, d) => sum + d.webVisitors, 0) / 7,
    impressions: thisWeek.reduce((sum, d) => sum + d.impressions, 0) / 7,
    clicks: thisWeek.reduce((sum, d) => sum + d.clicks, 0) / 7,
    spend: thisWeek.reduce((sum, d) => sum + d.spend, 0) / 7,
  };

  const avgLastWeek = {
    uniqueCallers: lastWeek.reduce((sum, d) => sum + d.uniqueCallers, 0) / 7,
    webLeads: lastWeek.reduce((sum, d) => sum + d.webLeads, 0) / 7,
    webVisitors: lastWeek.reduce((sum, d) => sum + d.webVisitors, 0) / 7,
    impressions: lastWeek.reduce((sum, d) => sum + d.impressions, 0) / 7,
    clicks: lastWeek.reduce((sum, d) => sum + d.clicks, 0) / 7,
    spend: lastWeek.reduce((sum, d) => sum + d.spend, 0) / 7,
  };

  const trends: any = {};
  for (const key in avgThisWeek) {
    const change =
      avgLastWeek[key as keyof typeof avgLastWeek] > 0
        ? ((avgThisWeek[key as keyof typeof avgThisWeek] - avgLastWeek[key as keyof typeof avgLastWeek]) /
            avgLastWeek[key as keyof typeof avgLastWeek]) *
          100
        : 0;
    trends[key] = {
      current: avgThisWeek[key as keyof typeof avgThisWeek],
      change: change.toFixed(1),
    };
  }

  return { trends, thisWeek, lastWeek };
}

// Generate HTML email (simplified version from the script)
function generateEmailHTML(metrics: any, contacts: Contact[], actualPhoneLeads: number, actualWebLeads: number): string {
  const { trends, thisWeek } = metrics;
  const today = thisWeek[thisWeek.length - 1];

  return `
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
      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <!-- Metrics Grid -->
    <div style="padding: 32px 24px;">
      <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #333;">Key Metrics</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
          <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Phone Leads</div>
          <div style="font-size: 28px; font-weight: 600; color: #333;">${actualPhoneLeads}</div>
          <div style="font-size: 12px; color: ${parseFloat(trends.uniqueCallers.change) >= 0 ? '#10b981' : '#ef4444'}; margin-top: 4px;">
            ${parseFloat(trends.uniqueCallers.change) >= 0 ? '↑' : '↓'} ${Math.abs(parseFloat(trends.uniqueCallers.change))}% vs last week
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
          <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Web Leads</div>
          <div style="font-size: 28px; font-weight: 600; color: #333;">${actualWebLeads}</div>
          <div style="font-size: 12px; color: ${parseFloat(trends.webLeads.change) >= 0 ? '#10b981' : '#ef4444'}; margin-top: 4px;">
            ${parseFloat(trends.webLeads.change) >= 0 ? '↑' : '↓'} ${Math.abs(parseFloat(trends.webLeads.change))}% vs last week
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
          <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Ad Impressions</div>
          <div style="font-size: 28px; font-weight: 600; color: #333;">${today.impressions.toLocaleString()}</div>
          <div style="font-size: 12px; color: ${parseFloat(trends.impressions.change) >= 0 ? '#10b981' : '#ef4444'}; margin-top: 4px;">
            ${parseFloat(trends.impressions.change) >= 0 ? '↑' : '↓'} ${Math.abs(parseFloat(trends.impressions.change))}% vs last week
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px;">
          <div style="font-size: 14px; color: #666; margin-bottom: 4px;">Ad Spend</div>
          <div style="font-size: 28px; font-weight: 600; color: #333;">$${today.spend.toFixed(0)}</div>
          <div style="font-size: 12px; color: ${parseFloat(trends.spend.change) >= 0 ? '#ef4444' : '#10b981'}; margin-top: 4px;">
            ${parseFloat(trends.spend.change) >= 0 ? '↑' : '↓'} ${Math.abs(parseFloat(trends.spend.change))}% vs last week
          </div>
        </div>
      </div>
    </div>

    ${contacts.length > 0 ? `
    <!-- Today's Contacts -->
    <div style="padding: 0 24px 32px 24px;">
      <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333;">Today's Contacts (${contacts.length})</h2>
      ${contacts.slice(0, 5).map(contact => `
        <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; margin-bottom: 4px;">
            <span style="background: ${contact.source === 'phone' ? '#3b82f6' : '#10b981'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 8px;">${contact.source === 'phone' ? 'Phone Lead' : 'Web Lead'}</span>
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
      ${contacts.length > 5 ? `<div style="text-align: center; color: #666; font-size: 14px; margin-top: 12px;">+ ${contacts.length - 5} more contacts</div>` : ''}
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
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Starting daily report generation...');

    // Fetch all data
    const data = await fetchData();
    console.log(`✅ Fetched ${data.calls.length} calls, ${data.leads.length} leads`);

    // Aggregate and calculate
    const dailyStats = aggregateDataByDay(data.calls, data.leads, data.adsDataByDate);
    const metrics = calculateTrends(dailyStats);
    const contacts = getTodaysContacts(data.calls, data.leads);

    // Count actual unique contacts after final deduplication
    const actualPhoneLeads = contacts.filter(c => c.source === 'phone').length;
    const actualWebLeads = contacts.filter(c => c.source === 'web').length;

    // Generate HTML
    const html = generateEmailHTML(metrics, contacts, actualPhoneLeads, actualWebLeads);

    // Send email
    const subject = `Daily Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    const emailSent = await sendAdminEmail(subject, html);

    if (!emailSent) {
      throw new Error('Failed to send email');
    }

    console.log('✅ Daily report sent successfully');

    return NextResponse.json({
      success: true,
      message: 'Daily report sent',
      stats: {
        calls: data.calls.length,
        leads: data.leads.length,
        todayContacts: contacts.length,
      },
    });
  } catch (error: any) {
    console.error('❌ Error generating daily report:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
