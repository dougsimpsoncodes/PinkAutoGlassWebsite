/**
 * Daily Report Cron Job
 * Sends daily business metrics to admin team
 * Triggered by Vercel Cron at 6am MT (1pm UTC)
 *
 * IMPORTANT: This report summarizes YESTERDAY's data, not today's.
 * Since it runs early morning, today has barely started - we want
 * the previous day's complete activity.
 *
 * 5 Lead Sources:
 * 1. Phone Calls - RingCentral inbound calls
 * 2. Quick Quote Requests - Website form submissions (leads table)
 * 3. Click to Call - Website phone click tracking (conversion_events)
 * 4. Click to Text - Website text click tracking (conversion_events)
 * 5. Google Ads - Impressions, clicks, spend, conversions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchCampaignPerformance } from '@/lib/googleAds';
import { fetchAccountPerformance as fetchMicrosoftAdsPerformance } from '@/lib/microsoftAds';
import { sendAdminEmail } from '@/lib/notifications/email';
import { getRingCentralClient } from '@/lib/notifications/sms';
import { BUSINESS_PHONE_NUMBER } from '@/lib/constants';

// Types
interface DailyStats {
  date: string;
  dayName: string;
  // Lead sources
  phoneCalls: number;        // RingCentral unique callers
  quoteRequests: number;     // Form submissions
  clickToCalls: number;      // Website phone clicks
  clickToTexts: number;      // Website text clicks
  // Google Ads
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  // Microsoft Ads
  msImpressions: number;
  msClicks: number;
  msSpend: number;
  msConversions: number;
}

interface Contact {
  source: 'phone' | 'quote' | 'click-call' | 'click-text';
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  time: string;
  timestamp: Date;
  location?: string;
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
      // Prefer Inbound calls to our business number
      const isInboundToUs = call.direction === 'Inbound' && call.to_number === BUSINESS_PHONE_NUMBER;
      const existingIsInboundToUs = existing.direction === 'Inbound' && existing.to_number === BUSINESS_PHONE_NUMBER;

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

// Deduplicate conversion events - only show one click per session_id per event type
// This reduces noise from users clicking the same button multiple times
function deduplicateConversionEvents(events: any[]): any[] {
  const sessionMap = new Map<string, any>();

  events.forEach(event => {
    // Create unique key: session_id + event_type (so phone_click and text_click are separate)
    const key = `${event.session_id || event.id}_${event.event_type}`;
    const existing = sessionMap.get(key);

    if (!existing) {
      // First click in this session - add it
      sessionMap.set(key, event);
    } else {
      // Keep the earliest click (first intent signal)
      const eventDate = new Date(event.created_at);
      const existingDate = new Date(existing.created_at);
      if (eventDate < existingDate) {
        sessionMap.set(key, event);
      }
    }
  });

  return Array.from(sessionMap.values());
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

// Fetch all data from all 5 sources
async function fetchData() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Use Mountain Time for date boundaries
  const mtOffset = -7 * 60;
  const now = new Date();
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
  const mtNow = new Date(utcNow + (mtOffset * 60000));

  const todayMT = new Date(mtNow);
  todayMT.setHours(0, 0, 0, 0);
  const todayStartUTC = new Date(todayMT.getTime() - (mtOffset * 60000));

  const fourteenDaysAgoMT = new Date(todayMT);
  fourteenDaysAgoMT.setDate(fourteenDaysAgoMT.getDate() - 14);
  const fourteenDaysAgoUTC = new Date(fourteenDaysAgoMT.getTime() - (mtOffset * 60000));

  // 1. Fetch RingCentral phone calls
  const { data: allCalls } = await supabase
    .from('ringcentral_calls')
    .select('*')
    .gte('start_time', fourteenDaysAgoUTC.toISOString())
    .eq('direction', 'Inbound')
    .order('start_time', { ascending: false });

  // Deduplicate calls (same logic as call analytics page)
  const calls = deduplicateCalls(allCalls || []);

  // 2. Fetch Quick Quote form submissions (leads table)
  const { data: allLeads } = await supabase
    .from('leads')
    .select('*')
    .gte('created_at', fourteenDaysAgoUTC.toISOString())
    .order('created_at', { ascending: false });

  const filteredLeads = filterTestLeads(allLeads || []);
  const leads = deduplicateLeads(filteredLeads);

  // 3 & 4. Fetch conversion events (click-to-call and click-to-text)
  const { data: allConversionEvents } = await supabase
    .from('conversion_events')
    .select('*')
    .gte('created_at', fourteenDaysAgoUTC.toISOString())
    .in('event_type', ['phone_click', 'text_click'])
    .order('created_at', { ascending: false });

  // Deduplicate clicks - only count one per session per event type
  const conversionEvents = deduplicateConversionEvents(allConversionEvents || []);

  // 5. Fetch Google Ads data with improved error handling
  const startDate = fourteenDaysAgoMT.toISOString().split('T')[0];
  const endDate = todayMT.toISOString().split('T')[0];
  let campaigns: any[] = [];
  try {
    console.log(`🔄 Fetching Google Ads data for ${startDate} to ${endDate}...`);
    campaigns = await fetchCampaignPerformance(startDate, endDate);
    console.log(`✅ Google Ads: Fetched ${campaigns.length} campaign records`);
  } catch (error: any) {
    console.error('❌ Error fetching Google Ads data:', error.message);
    
    // Check if it's a credential/auth issue
    if (error.message.includes('credentials') || error.message.includes('token') || error.message.includes('authentication')) {
      console.error('🔑 Google Ads authentication issue detected - check credentials and refresh tokens');
    }
    
    // Continue without ads data but log for debugging
    campaigns = [];
  }

  // Aggregate Google Ads data by date
  const adsDataByDate: Record<string, { impressions: number; clicks: number; spend: number; conversions: number }> = {};
  campaigns.forEach((campaign: any) => {
    const { date, impressions, clicks, cost, conversions } = campaign;
    if (!adsDataByDate[date]) {
      adsDataByDate[date] = { impressions: 0, clicks: 0, spend: 0, conversions: 0 };
    }
    adsDataByDate[date].impressions += impressions || 0;
    adsDataByDate[date].clicks += clicks || 0;
    adsDataByDate[date].spend += cost || 0;
    adsDataByDate[date].conversions += conversions || 0;
  });

  // 6. Fetch Microsoft Ads data with improved error handling and retry logic
  const msAdsDataByDate: Record<string, { impressions: number; clicks: number; spend: number; conversions: number }> = {};
  try {
    // Get yesterday's date (the day the report is about)
    const yesterdayMT = new Date(todayMT);
    yesterdayMT.setDate(yesterdayMT.getDate() - 1);
    const yesterdayStr = yesterdayMT.toISOString().split('T')[0];

    console.log(`🔄 Fetching Microsoft Ads for ${yesterdayStr}...`);
    
    // Retry Microsoft Ads API call up to 3 times with backoff
    let msPerformance = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`   Attempt ${attempt}/3 for Microsoft Ads...`);
        msPerformance = await fetchMicrosoftAdsPerformance(yesterdayStr, yesterdayStr);
        if (msPerformance) break;
        
        if (attempt < 3) {
          console.log(`   No data on attempt ${attempt}, waiting 5 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (attemptError: any) {
        console.error(`   Attempt ${attempt} failed:`, attemptError.message);
        if (attempt === 3) throw attemptError;
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    if (msPerformance && (msPerformance.impressions > 0 || msPerformance.clicks > 0 || msPerformance.spend > 0)) {
      msAdsDataByDate[yesterdayStr] = {
        impressions: msPerformance.impressions,
        clicks: msPerformance.clicks,
        spend: msPerformance.spend,
        conversions: msPerformance.conversions,
      };
      console.log(`✅ Microsoft Ads for ${yesterdayStr}:`, msAdsDataByDate[yesterdayStr]);
    } else {
      console.log(`⚠️ Microsoft Ads: No valid data returned for ${yesterdayStr}`);
      // Add note to email about missing data
      msAdsDataByDate[yesterdayStr] = { impressions: 0, clicks: 0, spend: 0, conversions: 0 };
    }
  } catch (error: any) {
    console.error('❌ Error fetching Microsoft Ads data:', error.message);
    // Add error indicator to report
    const yesterdayMT = new Date(todayMT);
    yesterdayMT.setDate(yesterdayMT.getDate() - 1);
    const yesterdayStr = yesterdayMT.toISOString().split('T')[0];
    msAdsDataByDate[yesterdayStr] = { impressions: 0, clicks: 0, spend: 0, conversions: 0 };
  }

  return {
    calls: calls || [],
    leads: leads || [],
    conversionEvents: conversionEvents || [],
    adsDataByDate,
    msAdsDataByDate,
    campaigns: campaigns || [],
  };
}

// Aggregate data by day from all 6 sources
// Note: We use YESTERDAY as the "current" day since the report runs early morning
// IMPORTANT: Use Mountain Time (UTC-7) for date boundaries since that's the business timezone
function aggregateDataByDay(
  calls: any[],
  leads: any[],
  conversionEvents: any[],
  adsDataByDate: any,
  msAdsDataByDate: any
): DailyStats[] {
  // Mountain Time is UTC-7
  const mtOffset = -7 * 60; // Mountain Time offset in minutes
  const now = new Date();
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
  const mtNow = new Date(utcNow + (mtOffset * 60000));

  // Yesterday in MT
  const yesterdayMT = new Date(mtNow);
  yesterdayMT.setDate(yesterdayMT.getDate() - 1);
  yesterdayMT.setHours(0, 0, 0, 0);

  const dailyStats: DailyStats[] = [];

  for (let i = 0; i < 14; i++) {
    const dateMT = new Date(yesterdayMT);
    dateMT.setDate(dateMT.getDate() - i);
    const dateStr = dateMT.toISOString().split('T')[0];

    // Calculate UTC boundaries for this MT day
    const dayStartUTC = new Date(dateMT.getTime() - (mtOffset * 60000));
    const nextDayMT = new Date(dateMT);
    nextDayMT.setDate(nextDayMT.getDate() + 1);
    const dayEndUTC = new Date(nextDayMT.getTime() - (mtOffset * 60000));

    // 1. Phone Calls (RingCentral) - unique callers
    const dayCalls = calls.filter((call) => {
      const callDate = new Date(call.start_time);
      return callDate >= dayStartUTC && callDate < dayEndUTC;
    });
    const phoneCalls = new Set(dayCalls.map((c) => c.from_number)).size;

    // 2. Quick Quote Requests (form submissions)
    const quoteRequests = leads.filter((lead) => {
      const leadDate = new Date(lead.created_at);
      return leadDate >= dayStartUTC && leadDate < dayEndUTC;
    }).length;

    // 3. Click to Call events
    const clickToCalls = conversionEvents.filter((event) => {
      const eventDate = new Date(event.created_at);
      return event.event_type === 'phone_click' && eventDate >= dayStartUTC && eventDate < dayEndUTC;
    }).length;

    // 4. Click to Text events
    const clickToTexts = conversionEvents.filter((event) => {
      const eventDate = new Date(event.created_at);
      return event.event_type === 'text_click' && eventDate >= dayStartUTC && eventDate < dayEndUTC;
    }).length;

    // 5. Google Ads data
    const adsForDay = adsDataByDate[dateStr] || { impressions: 0, clicks: 0, spend: 0, conversions: 0 };

    // 6. Microsoft Ads data (same pattern as Google Ads - by date)
    const msAdsForDay = msAdsDataByDate[dateStr] || { impressions: 0, clicks: 0, spend: 0, conversions: 0 };

    dailyStats.push({
      date: dateStr,
      dayName: getDayName(dateMT),
      phoneCalls,
      quoteRequests,
      clickToCalls,
      clickToTexts,
      impressions: adsForDay.impressions,
      clicks: adsForDay.clicks,
      spend: adsForDay.spend,
      conversions: adsForDay.conversions,
      msImpressions: msAdsForDay.impressions,
      msClicks: msAdsForDay.clicks,
      msSpend: msAdsForDay.spend,
      msConversions: msAdsForDay.conversions,
    });
  }

  return dailyStats.reverse(); // Oldest to newest
}

// Get yesterday's contacts from all sources
// IMPORTANT: Use Mountain Time (UTC-7) for date boundaries since that's the business timezone
function getYesterdaysContacts(
  calls: any[],
  leads: any[],
  conversionEvents: any[]
): Contact[] {
  const now = new Date();
  const mtOffset = -7 * 60;
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

  const contacts: Contact[] = [];

  // 1. Phone Calls (RingCentral) - deduplicate by phone number, keep most recent
  const yesterdayCalls = calls.filter((call) => {
    const callDate = new Date(call.start_time);
    return callDate >= yesterdayStartUTC && callDate < todayStartUTC;
  });

  const uniqueCallers = new Map<string, any>();
  yesterdayCalls.forEach((call) => {
    const phone = call.from_number;
    const existing = uniqueCallers.get(phone);
    if (!existing || new Date(call.start_time) > new Date(existing.start_time)) {
      uniqueCallers.set(phone, call);
    }
  });

  uniqueCallers.forEach((call) => {
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

  // 2. Quick Quote Requests (form submissions)
  leads.forEach((lead) => {
    const leadDate = new Date(lead.created_at);
    if (leadDate >= yesterdayStartUTC && leadDate < todayStartUTC) {
      const vehicleInfo =
        lead.vehicle_info ||
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
        timestamp: leadDate,
      });
    }
  });

  // 3 & 4. Click to Call and Click to Text events
  conversionEvents.forEach((event) => {
    const eventDate = new Date(event.created_at);
    if (eventDate >= yesterdayStartUTC && eventDate < todayStartUTC) {
      contacts.push({
        source: event.event_type === 'phone_click' ? 'click-call' : 'click-text',
        name: 'Website Visitor',
        phone: '',
        email: '',
        vehicle: '',
        time: formatTime(event.created_at),
        timestamp: eventDate,
        location: event.button_location || '',
      });
    }
  });

  // Sort by time (most recent first)
  contacts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return contacts;
}

// Calculate trends for all metrics
function calculateTrends(dailyStats: DailyStats[]) {
  const thisWeek = dailyStats.slice(7, 14);
  const lastWeek = dailyStats.slice(0, 7);

  const avgThisWeek = {
    phoneCalls: thisWeek.reduce((sum, d) => sum + d.phoneCalls, 0) / 7,
    quoteRequests: thisWeek.reduce((sum, d) => sum + d.quoteRequests, 0) / 7,
    clickToCalls: thisWeek.reduce((sum, d) => sum + d.clickToCalls, 0) / 7,
    clickToTexts: thisWeek.reduce((sum, d) => sum + d.clickToTexts, 0) / 7,
    impressions: thisWeek.reduce((sum, d) => sum + d.impressions, 0) / 7,
    clicks: thisWeek.reduce((sum, d) => sum + d.clicks, 0) / 7,
    spend: thisWeek.reduce((sum, d) => sum + d.spend, 0) / 7,
    conversions: thisWeek.reduce((sum, d) => sum + d.conversions, 0) / 7,
  };

  const avgLastWeek = {
    phoneCalls: lastWeek.reduce((sum, d) => sum + d.phoneCalls, 0) / 7,
    quoteRequests: lastWeek.reduce((sum, d) => sum + d.quoteRequests, 0) / 7,
    clickToCalls: lastWeek.reduce((sum, d) => sum + d.clickToCalls, 0) / 7,
    clickToTexts: lastWeek.reduce((sum, d) => sum + d.clickToTexts, 0) / 7,
    impressions: lastWeek.reduce((sum, d) => sum + d.impressions, 0) / 7,
    clicks: lastWeek.reduce((sum, d) => sum + d.clicks, 0) / 7,
    spend: lastWeek.reduce((sum, d) => sum + d.spend, 0) / 7,
    conversions: lastWeek.reduce((sum, d) => sum + d.conversions, 0) / 7,
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

// Helper to get source label and color
function getSourceStyle(source: Contact['source']): { label: string; color: string } {
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

// Generate HTML email with all 5 lead sources
function generateEmailHTML(
  metrics: any,
  contacts: Contact[],
  reportDay: DailyStats,
  dataStatus?: {
    googleAdsWorking: boolean;
    msAdsWorking: boolean;
    totalCampaigns: number;
  }
): string {
  const { trends } = metrics;

  // Get yesterday's date for the header (in Mountain Time)
  const mtOffset = -7 * 60;
  const now = new Date();
  const utcNow = now.getTime() + (now.getTimezoneOffset() * 60000);
  const mtNow = new Date(utcNow + (mtOffset * 60000));
  const yesterday = new Date(mtNow);
  yesterday.setDate(yesterday.getDate() - 1);

  // Calculate total leads
  const totalLeads = reportDay.phoneCalls + reportDay.quoteRequests + reportDay.clickToCalls + reportDay.clickToTexts;

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
      <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">${yesterday.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <!-- Lead Sources Summary -->
    <div style="padding: 32px 24px 16px 24px;">
      <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #333;">Lead Sources (${totalLeads} total)</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #eff6ff; padding: 14px; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <div style="font-size: 13px; color: #1e40af; margin-bottom: 2px;">Phone Calls</div>
          <div style="font-size: 24px; font-weight: 600; color: #1e3a8a;">${reportDay.phoneCalls}</div>
          <div style="font-size: 11px; color: ${parseFloat(trends.phoneCalls?.change || '0') >= 0 ? '#10b981' : '#ef4444'};">
            ${parseFloat(trends.phoneCalls?.change || '0') >= 0 ? '↑' : '↓'} ${Math.abs(parseFloat(trends.phoneCalls?.change || '0'))}% vs last week
          </div>
        </div>
        <div style="background: #ecfdf5; padding: 14px; border-radius: 8px; border-left: 4px solid #10b981;">
          <div style="font-size: 13px; color: #065f46; margin-bottom: 2px;">Quote Requests</div>
          <div style="font-size: 24px; font-weight: 600; color: #064e3b;">${reportDay.quoteRequests}</div>
          <div style="font-size: 11px; color: ${parseFloat(trends.quoteRequests?.change || '0') >= 0 ? '#10b981' : '#ef4444'};">
            ${parseFloat(trends.quoteRequests?.change || '0') >= 0 ? '↑' : '↓'} ${Math.abs(parseFloat(trends.quoteRequests?.change || '0'))}% vs last week
          </div>
        </div>
        <div style="background: #f5f3ff; padding: 14px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
          <div style="font-size: 13px; color: #5b21b6; margin-bottom: 2px;">Click to Call</div>
          <div style="font-size: 24px; font-weight: 600; color: #4c1d95;">${reportDay.clickToCalls}</div>
          <div style="font-size: 11px; color: ${parseFloat(trends.clickToCalls?.change || '0') >= 0 ? '#10b981' : '#ef4444'};">
            ${parseFloat(trends.clickToCalls?.change || '0') >= 0 ? '↑' : '↓'} ${Math.abs(parseFloat(trends.clickToCalls?.change || '0'))}% vs last week
          </div>
        </div>
        <div style="background: #fffbeb; padding: 14px; border-radius: 8px; border-left: 4px solid #f59e0b;">
          <div style="font-size: 13px; color: #92400e; margin-bottom: 2px;">Click to Text</div>
          <div style="font-size: 24px; font-weight: 600; color: #78350f;">${reportDay.clickToTexts}</div>
          <div style="font-size: 11px; color: ${parseFloat(trends.clickToTexts?.change || '0') >= 0 ? '#10b981' : '#ef4444'};">
            ${parseFloat(trends.clickToTexts?.change || '0') >= 0 ? '↑' : '↓'} ${Math.abs(parseFloat(trends.clickToTexts?.change || '0'))}% vs last week
          </div>
        </div>
      </div>
    </div>

    <!-- Google Ads Performance -->
    <div style="padding: 16px 24px 32px 24px;">
      <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #333;">
        Google Ads Performance 
        ${!dataStatus?.googleAdsWorking ? '<span style="color: #ef4444; font-size: 14px;">⚠️ Data Issue</span>' : ''}
      </h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #f8f9fa; padding: 14px; border-radius: 8px;">
          <div style="font-size: 13px; color: #666; margin-bottom: 2px;">Impressions</div>
          <div style="font-size: 24px; font-weight: 600; color: #333;">${reportDay.impressions.toLocaleString()}</div>
          <div style="font-size: 11px; color: ${parseFloat(trends.impressions?.change || '0') >= 0 ? '#10b981' : '#ef4444'};">
            ${parseFloat(trends.impressions?.change || '0') >= 0 ? '↑' : '↓'} ${Math.abs(parseFloat(trends.impressions?.change || '0'))}% vs last week
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 14px; border-radius: 8px;">
          <div style="font-size: 13px; color: #666; margin-bottom: 2px;">Ad Clicks</div>
          <div style="font-size: 24px; font-weight: 600; color: #333;">${reportDay.clicks.toLocaleString()}</div>
          <div style="font-size: 11px; color: ${parseFloat(trends.clicks?.change || '0') >= 0 ? '#10b981' : '#ef4444'};">
            ${parseFloat(trends.clicks?.change || '0') >= 0 ? '↑' : '↓'} ${Math.abs(parseFloat(trends.clicks?.change || '0'))}% vs last week
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 14px; border-radius: 8px;">
          <div style="font-size: 13px; color: #666; margin-bottom: 2px;">Ad Spend</div>
          <div style="font-size: 24px; font-weight: 600; color: #333;">$${reportDay.spend.toFixed(2)}</div>
          <div style="font-size: 11px; color: ${parseFloat(trends.spend?.change || '0') >= 0 ? '#ef4444' : '#10b981'};">
            ${parseFloat(trends.spend?.change || '0') >= 0 ? '↑' : '↓'} ${Math.abs(parseFloat(trends.spend?.change || '0'))}% vs last week
          </div>
        </div>
        <div style="background: #f8f9fa; padding: 14px; border-radius: 8px;">
          <div style="font-size: 13px; color: #666; margin-bottom: 2px;">Conversions</div>
          <div style="font-size: 24px; font-weight: 600; color: #333;">${reportDay.conversions.toFixed(0)}</div>
          <div style="font-size: 11px; color: ${parseFloat(trends.conversions?.change || '0') >= 0 ? '#10b981' : '#ef4444'};">
            ${parseFloat(trends.conversions?.change || '0') >= 0 ? '↑' : '↓'} ${Math.abs(parseFloat(trends.conversions?.change || '0'))}% vs last week
          </div>
        </div>
      </div>
    </div>

    <!-- Microsoft Ads Performance -->
    <div style="padding: 0 24px 32px 24px;">
      <h2 style="margin: 0 0 20px 0; font-size: 18px; color: #333;">
        Microsoft Ads Performance
        ${!dataStatus?.msAdsWorking ? '<span style="color: #ef4444; font-size: 14px;">⚠️ Data Issue</span>' : ''}
      </h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #eff6ff; padding: 14px; border-radius: 8px; border-left: 4px solid #0078d4;">
          <div style="font-size: 13px; color: #1e40af; margin-bottom: 2px;">Impressions</div>
          <div style="font-size: 24px; font-weight: 600; color: #1e3a8a;">${reportDay.msImpressions.toLocaleString()}</div>
        </div>
        <div style="background: #eff6ff; padding: 14px; border-radius: 8px; border-left: 4px solid #0078d4;">
          <div style="font-size: 13px; color: #1e40af; margin-bottom: 2px;">Ad Clicks</div>
          <div style="font-size: 24px; font-weight: 600; color: #1e3a8a;">${reportDay.msClicks.toLocaleString()}</div>
        </div>
        <div style="background: #eff6ff; padding: 14px; border-radius: 8px; border-left: 4px solid #0078d4;">
          <div style="font-size: 13px; color: #1e40af; margin-bottom: 2px;">Ad Spend</div>
          <div style="font-size: 24px; font-weight: 600; color: #1e3a8a;">$${reportDay.msSpend.toFixed(2)}</div>
        </div>
        <div style="background: #eff6ff; padding: 14px; border-radius: 8px; border-left: 4px solid #0078d4;">
          <div style="font-size: 13px; color: #1e40af; margin-bottom: 2px;">Conversions</div>
          <div style="font-size: 24px; font-weight: 600; color: #1e3a8a;">${reportDay.msConversions.toFixed(0)}</div>
        </div>
      </div>
    </div>

    ${contacts.length > 0 ? `
    <!-- Yesterday's Activity -->
    <div style="padding: 0 24px 32px 24px;">
      <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333;">Yesterday's Activity (${contacts.length})</h2>
      ${contacts.slice(0, 10).map(contact => {
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
      ${contacts.length > 10 ? `<div style="text-align: center; color: #666; font-size: 14px; margin-top: 12px;">+ ${contacts.length - 10} more activities</div>` : ''}
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

    // Fetch all data from all 6 sources
    const data = await fetchData();
    console.log(`✅ Fetched ${data.calls.length} calls, ${data.leads.length} leads, ${data.conversionEvents.length} conversion events (deduplicated by session)`);
    // Log Microsoft Ads data
    const msAdsDates = Object.keys(data.msAdsDataByDate);
    if (msAdsDates.length > 0) {
      const totalMsSpend = msAdsDates.reduce((sum, d) => sum + (data.msAdsDataByDate[d]?.spend || 0), 0);
      console.log(`✅ Microsoft Ads: ${msAdsDates.length} days of data, $${totalMsSpend.toFixed(2)} total spend`);
    }

    // Aggregate and calculate
    const dailyStats = aggregateDataByDay(data.calls, data.leads, data.conversionEvents, data.adsDataByDate, data.msAdsDataByDate);
    const metrics = calculateTrends(dailyStats);
    const contacts = getYesterdaysContacts(data.calls, data.leads, data.conversionEvents);

    // Get yesterday's stats (last item in the array)
    const reportDay = dailyStats[dailyStats.length - 1];

    // =============================================================================
    // CRITICAL ALERTS: Data gap and zero activity detection
    // Expanded after Jan 2026 incident where 41-hour outage went undetected
    // =============================================================================
    const totalActivity = reportDay.phoneCalls + reportDay.quoteRequests + reportDay.clickToCalls + reportDay.clickToTexts;
    const isWeekday = ![0, 6].includes(new Date(reportDay.date).getDay()); // 0=Sun, 6=Sat

    // ALERT 1: Complete data gap (zero everything) - highest severity
    if (totalActivity === 0) {
      console.error('🚨 CRITICAL: Complete data gap yesterday - zero activity across ALL sources!');

      const alertHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #450a0a; border: 3px solid #dc2626; border-radius: 8px; padding: 24px;">
    <h1 style="color: #fca5a5; margin: 0 0 16px 0;">🚨 CRITICAL: Complete Data Gap</h1>
    <p style="color: #fecaca; font-size: 18px; margin: 0 0 16px 0;">
      <strong>ZERO activity was recorded yesterday across ALL sources:</strong>
    </p>
    <ul style="color: #fecaca; margin: 0 0 16px 0; font-size: 16px;">
      <li>Phone Calls: 0</li>
      <li>Quote Requests: 0</li>
      <li>Click to Call: 0</li>
      <li>Click to Text: 0</li>
    </ul>
    <p style="color: #fca5a5; margin: 0 0 16px 0; font-size: 16px;">
      This indicates a <strong>system outage</strong>, not a quiet day. Possible causes:
    </p>
    <ul style="color: #fecaca; margin: 0 0 16px 0;">
      <li>Website/Vercel deployment issue</li>
      <li>Supabase database connection failure</li>
      <li>RingCentral sync job failure</li>
      <li>Environment variable issue</li>
    </ul>
    <div style="background: #7f1d1d; padding: 16px; border-radius: 4px; margin-top: 16px;">
      <p style="color: #fecaca; margin: 0; font-size: 14px;">
        <strong>Immediate Actions:</strong><br>
        1. Check <a href="https://pinkautoglass.com" style="color: #fca5a5;">pinkautoglass.com</a> is loading<br>
        2. Submit a test quote form<br>
        3. Make a test call to verify RingCentral<br>
        4. Check Vercel deployment status<br>
        5. Check Supabase dashboard for errors
      </p>
    </div>
  </div>
</body>
</html>`;

      await sendAdminEmail('🚨 CRITICAL: Complete Data Gap - Zero Activity Yesterday', alertHtml);
      console.log('📧 Critical data gap alert email sent');
    }
    // ALERT 2: Zero quote requests specifically (form may be broken)
    else if (reportDay.quoteRequests === 0) {
      console.warn('⚠️ ALERT: Zero quote requests yesterday - possible form issue!');

      const alertHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fef2f2; border: 2px solid #ef4444; border-radius: 8px; padding: 24px;">
    <h1 style="color: #dc2626; margin: 0 0 16px 0;">⚠️ URGENT: Zero Quote Requests</h1>
    <p style="color: #991b1b; font-size: 16px; margin: 0 0 16px 0;">
      <strong>No quote form submissions were recorded yesterday.</strong>
    </p>
    <p style="color: #666; margin: 0 0 16px 0;">
      Other activity was recorded (${reportDay.phoneCalls} calls, ${reportDay.clickToCalls} click-to-calls),
      so the website is working but the quote form may be broken.
    </p>
    <ul style="color: #7f1d1d; margin: 0 0 16px 0;">
      <li>The quote form may be broken</li>
      <li>Database insert function may be failing</li>
      <li>A migration may have broken lead capture</li>
    </ul>
    <p style="color: #7f1d1d; margin: 0 0 16px 0;">
      <strong>Action Required:</strong> Test the quote form at <a href="https://pinkautoglass.com/#quote-form" style="color: #dc2626;">pinkautoglass.com</a> immediately.
    </p>
  </div>
</body>
</html>`;

      await sendAdminEmail('🚨 URGENT: Zero Quote Requests Yesterday', alertHtml);
      console.log('📧 Zero quote requests alert email sent');
    }
    // ALERT 3: Zero phone calls on a weekday (RingCentral sync may be broken)
    else if (reportDay.phoneCalls === 0 && isWeekday) {
      console.warn('⚠️ WARNING: Zero phone calls on a weekday - RingCentral sync may be broken');

      const alertHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #fffbeb; border: 2px solid #f59e0b; border-radius: 8px; padding: 24px;">
    <h1 style="color: #b45309; margin: 0 0 16px 0;">⚠️ Warning: Zero Phone Calls</h1>
    <p style="color: #92400e; font-size: 16px; margin: 0 0 16px 0;">
      <strong>No phone calls were recorded yesterday (a weekday).</strong>
    </p>
    <p style="color: #666; margin: 0 0 16px 0;">
      Website activity was normal (${reportDay.quoteRequests} quotes, ${reportDay.clickToCalls} click-to-calls),
      but zero calls is unusual for a weekday.
    </p>
    <ul style="color: #92400e; margin: 0 0 16px 0;">
      <li>RingCentral sync job may have failed</li>
      <li>RingCentral API credentials may have expired</li>
      <li>Phone lines may be down</li>
    </ul>
    <p style="color: #92400e; margin: 0 0 16px 0;">
      <strong>Action:</strong> Check RingCentral dashboard and verify the sync is running.
    </p>
  </div>
</body>
</html>`;

      await sendAdminEmail('⚠️ Warning: Zero Phone Calls Yesterday', alertHtml);
      console.log('📧 Zero phone calls warning email sent');
    }

    // Determine data status for quality indicators
    const dataStatus = {
      googleAdsWorking: data.campaigns.length > 0,
      msAdsWorking: Object.values(data.msAdsDataByDate).some(d => d.impressions > 0 || d.clicks > 0 || d.spend > 0),
      totalCampaigns: data.campaigns.length
    };

    // Generate HTML
    const html = generateEmailHTML(metrics, contacts, reportDay, dataStatus);

    // Send email - use yesterday's date (in Mountain Time)
    const mtOffset = -7 * 60;
    const nowForSubject = new Date();
    const utcNowForSubject = nowForSubject.getTime() + (nowForSubject.getTimezoneOffset() * 60000);
    const mtNowForSubject = new Date(utcNowForSubject + (mtOffset * 60000));
    const yesterdayMT = new Date(mtNowForSubject);
    yesterdayMT.setDate(yesterdayMT.getDate() - 1);
    const subject = `Daily Report - ${yesterdayMT.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    console.log(`📧 Attempting to send daily report: "${subject}"`);
    const emailSent = await sendAdminEmail(subject, html);

    if (!emailSent) {
      console.error('❌ Daily report email failed to send');
      throw new Error('Failed to send daily report email');
    }

    console.log('✅ Daily report sent successfully');
    console.log(`📊 Report summary: ${reportDay.phoneCalls} calls, ${reportDay.quoteRequests} quotes, ${reportDay.clickToCalls} click-calls, ${reportDay.clickToTexts} click-texts (${totalActivity} total)`);

    // --- Webhook subscription renewal check (non-fatal) ---
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
      const renewSupabase = createClient(supabaseUrl, supabaseKey);

      const { data: subs } = await renewSupabase
        .from('ringcentral_webhook_subscriptions')
        .select('subscription_id, expiration_time, status')
        .eq('status', 'Active')
        .limit(5);

      if (subs && subs.length > 0) {
        const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

        for (const sub of subs) {
          if (sub.expiration_time && new Date(sub.expiration_time) < twoDaysFromNow) {
            console.log(`Renewing webhook subscription ${sub.subscription_id} (expires ${sub.expiration_time})`);

            const rcClient = await getRingCentralClient();
            if (rcClient) {
              const platform = rcClient.platform();
              const renewResponse = await platform.put(`/restapi/v1.0/subscription/${sub.subscription_id}`, {
                eventFilters: ['/restapi/v1.0/account/~/extension/~/message-store/instant?type=SMS'],
                expiresIn: 604800,
              });
              const renewResult = await renewResponse.json();

              await renewSupabase
                .from('ringcentral_webhook_subscriptions')
                .update({
                  expiration_time: renewResult.expirationTime,
                  status: renewResult.status || 'Active',
                  last_updated: new Date().toISOString(),
                })
                .eq('subscription_id', sub.subscription_id);

              console.log(`Webhook subscription renewed, new expiry: ${renewResult.expirationTime}`);
            }
          }
        }
      }
    } catch (webhookErr: any) {
      // Non-fatal — never break the daily report
      console.warn('Webhook renewal check failed (non-fatal):', webhookErr.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Daily report sent',
      stats: {
        phoneCalls: reportDay.phoneCalls,
        quoteRequests: reportDay.quoteRequests,
        clickToCalls: reportDay.clickToCalls,
        clickToTexts: reportDay.clickToTexts,
        // Google Ads
        impressions: reportDay.impressions,
        clicks: reportDay.clicks,
        spend: reportDay.spend,
        conversions: reportDay.conversions,
        // Microsoft Ads
        msImpressions: reportDay.msImpressions,
        msClicks: reportDay.msClicks,
        msSpend: reportDay.msSpend,
        msConversions: reportDay.msConversions,
        totalContacts: contacts.length,
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
