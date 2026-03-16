import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMountainDayBounds, type DateFilter } from '@/lib/dateUtils';

// Force dynamic rendering - prevents static analysis during build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Create Supabase client function to avoid build-time initialization
function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Helper function to parse traffic source from referrer and landing page
function parseSourceFromReferrer(
  referrer: string | null,
  utmSource?: string | null,
  landingPage?: string | null
): string {
  // If UTM source exists, use it
  if (utmSource) return utmSource;

  // Check for ad platform auto-tagging in landing page
  if (landingPage) {
    // Google Ads: gclid, gad_source, or gbraid
    if (landingPage.includes('gclid') || landingPage.includes('gad_source') || landingPage.includes('gbraid')) {
      return 'google-ads';
    }
    // Microsoft Ads (Bing): msclkid
    if (landingPage.includes('msclkid')) {
      return 'microsoft-ads';
    }
    // Facebook: fbclid
    if (landingPage.includes('fbclid')) {
      return 'facebook-ads';
    }
  }

  // If no referrer, check if it's likely organic search with stripped referrer
  if (!referrer) {
    // Heuristic: Landing on specific deep pages without referrer = likely Google organic
    // (Privacy features strip referrers, especially on mobile)
    if (landingPage) {
      const cleanPath = landingPage.split('?')[0]; // Remove query params

      // If landing on deep page (not homepage or common pages), likely organic search
      const isDeepPage = cleanPath !== '/' &&
                         cleanPath !== '' &&
                         !cleanPath.startsWith('/admin') &&
                         !cleanPath.startsWith('/test');

      if (isDeepPage) {
        return 'google-organic'; // Most likely Google with stripped referrer
      }
    }

    return 'direct'; // True direct traffic (homepage, bookmarks, typed URL)
  }

  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();

    // Parse common search engines and social media
    if (hostname.includes('google')) return 'google-organic';
    if (hostname.includes('bing')) return 'bing';
    if (hostname.includes('yahoo')) return 'yahoo';
    if (hostname.includes('duckduckgo')) return 'duckduckgo';
    if (hostname.includes('facebook')) return 'facebook';
    if (hostname.includes('instagram')) return 'instagram';
    if (hostname.includes('twitter') || hostname.includes('t.co')) return 'twitter';
    if (hostname.includes('linkedin')) return 'linkedin';
    if (hostname.includes('youtube')) return 'youtube';
    if (hostname.includes('tiktok')) return 'tiktok';
    if (hostname.includes('pinterest')) return 'pinterest';
    if (hostname.includes('reddit')) return 'reddit';

    // If it's from your own domain, it's direct
    if (hostname.includes('pinkautoglass.com') || hostname.includes('localhost')) return 'direct';

    // Otherwise, use the domain name as referral
    return hostname.replace('www.', '');
  } catch (e) {
    return 'direct';
  }
}

export async function GET(req: NextRequest) {
  // Protected by HTTP Basic Auth in middleware - no additional API key needed
  try {
    const { searchParams } = new URL(req.url);
    const dateRange = searchParams.get('range') || '7days';
    const metric = searchParams.get('metric');

    // Map range param to DateFilter for Mountain Time boundaries
    const periodMap: Record<string, DateFilter> = {
      today: 'today', yesterday: 'yesterday',
      '7days': '7days', '30days': '30days', '90days': '30days',
      all: 'all',
    };
    const bounds = getMountainDayBounds(periodMap[dateRange] || '7days');
    // For 90days, override the start
    const startDate = dateRange === '90days'
      ? new Date(new Date().getTime() - 90 * 86400000)
      : new Date(bounds.startUTC);

    // Fetch different metrics based on request
    switch (metric) {
      case 'overview':
        return await getOverviewMetrics(startDate);
      case 'traffic_sources':
        return await getTrafficSources(startDate);
      case 'traffic_detail':
        return await getTrafficDetail(startDate);
      case 'conversions':
        return await getConversions(startDate);
      case 'conversions_detail':
        return await getConversionsDetail(startDate);
      case 'page_performance':
        return await getPagePerformance(startDate);
      case 'pages':
        return await getTopPages(startDate);
      case 'sessions':
        return await getSessions(startDate);
      default:
        return await getOverviewMetrics(startDate);
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getOverviewMetrics(startDate: Date) {
  const supabase = getSupabaseClient();
  const [sessionsResult, pageViewsResult, conversionsResult] = await Promise.all([
    supabase
      .from('user_sessions')
      .select('*', { count: 'exact' })
      .gte('started_at', startDate.toISOString()),
    supabase
      .from('page_views')
      .select('*', { count: 'exact' })
      .gte('created_at', startDate.toISOString())
      .not('page_path', 'like', '/admin%')
      .not('page_path', 'like', '/test%'),
    supabase
      .from('conversion_events')
      .select('*', { count: 'exact' })
      .gte('created_at', startDate.toISOString())
      .not('page_path', 'like', '/admin%')
      .not('page_path', 'like', '/test%'),
  ]);

  return NextResponse.json({
    ok: true,
    data: {
      total_visitors: sessionsResult.count || 0,
      total_page_views: pageViewsResult.count || 0,
      total_conversions: conversionsResult.count || 0,
      conversion_rate: sessionsResult.count
        ? ((conversionsResult.count || 0) / sessionsResult.count) * 100
        : 0,
    },
  });
}

async function getTrafficSources(startDate: Date) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_sessions')
    .select('utm_source, utm_medium, utm_campaign, referrer, landing_page')
    .gte('started_at', startDate.toISOString());

  if (error) throw error;

  // Group by source (parse from referrer and gclid if utm_source is missing)
  const sourceCounts: Record<string, number> = {};
  data?.forEach((session: any) => {
    const source = parseSourceFromReferrer(session.referrer, session.utm_source, session.landing_page);
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  return NextResponse.json({
    ok: true,
    data: Object.entries(sourceCounts).map(([source, count]) => ({
      source,
      visitors: count,
    })),
  });
}

async function getConversions(startDate: Date) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('conversion_events')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .not('page_path', 'like', '/admin%')
    .not('page_path', 'like', '/test%')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Group by type
  const typeCounts: Record<string, number> = {};
  data?.forEach((conversion: any) => {
    typeCounts[conversion.event_type] = (typeCounts[conversion.event_type] || 0) + 1;
  });

  return NextResponse.json({
    ok: true,
    data: {
      conversions: data,
      by_type: typeCounts,
    },
  });
}

async function getTopPages(startDate: Date) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('page_views')
    .select('page_path')
    .gte('created_at', startDate.toISOString())
    .not('page_path', 'like', '/admin%')
    .not('page_path', 'like', '/test%');

  if (error) throw error;

  // Count page views
  const pageCounts: Record<string, number> = {};
  data?.forEach((view: any) => {
    pageCounts[view.page_path] = (pageCounts[view.page_path] || 0) + 1;
  });

  const topPages = Object.entries(pageCounts)
    .map(([path, count]) => ({ path, views: count }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return NextResponse.json({
    ok: true,
    data: topPages,
  });
}

async function getSessions(startDate: Date) {
  const supabase = getSupabaseClient();
  // Get all sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('user_sessions')
    .select('*')
    .gte('started_at', startDate.toISOString())
    .order('started_at', { ascending: false })
    .limit(100);

  if (sessionsError) throw sessionsError;

  // Get conversion counts per session
  const { data: conversions, error: conversionsError } = await supabase
    .from('conversion_events')
    .select('session_id')
    .gte('created_at', startDate.toISOString());

  if (conversionsError) throw conversionsError;

  // Count conversions per session
  const conversionCounts = conversions?.reduce((acc, conv) => {
    acc[conv.session_id] = (acc[conv.session_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Add conversion counts to sessions
  const sessionsWithConversions = sessions?.map(session => ({
    ...session,
    conversions: conversionCounts[session.session_id] || 0,
  }));

  return NextResponse.json({
    ok: true,
    data: sessionsWithConversions || [],
  });
}

// Get detailed traffic sources with conversions
async function getTrafficDetail(startDate: Date) {
  const supabase = getSupabaseClient();
  // Get all sessions with their conversions
  const { data: sessions, error: sessionsError } = await supabase
    .from('user_sessions')
    .select('session_id, utm_source, utm_medium, utm_campaign, referrer, landing_page')
    .gte('started_at', startDate.toISOString());

  if (sessionsError) throw sessionsError;

  // Get ACTUAL page views from page_views table - exclude admin and test pages
  const { data: pageViews, error: pageViewsError } = await supabase
    .from('page_views')
    .select('session_id')
    .gte('created_at', startDate.toISOString())
    .not('page_path', 'like', '/admin%')
    .not('page_path', 'like', '/test%');

  if (pageViewsError) throw pageViewsError;

  // Get all conversions - exclude admin and test pages
  const { data: conversions, error: conversionsError } = await supabase
    .from('conversion_events')
    .select('session_id, utm_source, page_path')
    .gte('created_at', startDate.toISOString())
    .not('page_path', 'like', '/admin%')
    .not('page_path', 'like', '/test%');

  if (conversionsError) throw conversionsError;

  // Count page views per session
  const sessionPageViewsCount = new Map();
  pageViews?.forEach((pv) => {
    sessionPageViewsCount.set(pv.session_id, (sessionPageViewsCount.get(pv.session_id) || 0) + 1);
  });

  // Group by source (parse from referrer and gclid if utm_source is missing)
  const sourceMap = new Map();

  sessions?.forEach((session) => {
    const source = parseSourceFromReferrer(session.referrer, session.utm_source, session.landing_page);
    if (!sourceMap.has(source)) {
      sourceMap.set(source, {
        source,
        visitors: 0,
        page_views: 0,
        conversions: 0,
        conversion_rate: 0,
      });
    }

    const sourceData = sourceMap.get(source);
    sourceData.visitors += 1;
    // Use actual page view count from page_views table
    sourceData.page_views += sessionPageViewsCount.get(session.session_id) || 0;
  });

  conversions?.forEach((conversion) => {
    // Find the session for this conversion to get the correct source
    const session = sessions?.find((s: any) => s.session_id === conversion.session_id);
    if (session) {
      const source = parseSourceFromReferrer(session.referrer, session.utm_source, session.landing_page);
      if (sourceMap.has(source)) {
        sourceMap.get(source).conversions += 1;
      }
    } else {
      // Orphan conversion - no matching session, attribute to 'unknown'
      if (!sourceMap.has('unknown')) {
        sourceMap.set('unknown', {
          source: 'unknown',
          visitors: 0,
          page_views: 0,
          conversions: 0,
          conversion_rate: 0,
        });
      }
      sourceMap.get('unknown').conversions += 1;
    }
  });

  // Calculate conversion rates
  const results = Array.from(sourceMap.values()).map((item) => ({
    ...item,
    conversion_rate: item.visitors > 0 ? (item.conversions / item.visitors) * 100 : 0,
  }));

  return NextResponse.json({
    ok: true,
    data: results,
  });
}

// Get detailed conversions with session context
async function getConversionsDetail(startDate: Date) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('conversion_events')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .not('page_path', 'like', '/admin%')
    .not('page_path', 'like', '/test%')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return NextResponse.json({
    ok: true,
    data: data || [],
  });
}

// Get page performance metrics
async function getPagePerformance(startDate: Date) {
  const supabase = getSupabaseClient();
  // Get all page views - exclude admin and test pages
  const { data: pageViews, error: pageViewsError } = await supabase
    .from('page_views')
    .select('page_path, session_id, visitor_id')
    .gte('created_at', startDate.toISOString())
    .not('page_path', 'like', '/admin%')
    .not('page_path', 'like', '/test%');

  if (pageViewsError) throw pageViewsError;

  // Get all conversions - exclude admin and test pages
  const { data: conversions, error: conversionsError } = await supabase
    .from('conversion_events')
    .select('page_path, session_id')
    .gte('created_at', startDate.toISOString())
    .not('page_path', 'like', '/admin%')
    .not('page_path', 'like', '/test%');

  if (conversionsError) throw conversionsError;

  // Note: entry_page and exit_page columns may not exist yet
  // We'll calculate entry/exit based on page_views instead

  // Build page performance map
  const pageMap = new Map<string, {
    views: number;
    visitors: Set<string>;
    conversions: number;
    entry_count: number;
    exit_count: number;
  }>();

  // Count page views and unique visitors
  pageViews?.forEach((view) => {
    if (!pageMap.has(view.page_path)) {
      pageMap.set(view.page_path, {
        views: 0,
        visitors: new Set(),
        conversions: 0,
        entry_count: 0,
        exit_count: 0,
      });
    }

    const pageData = pageMap.get(view.page_path)!;
    pageData.views += 1;
    pageData.visitors.add(view.visitor_id);
  });

  // Count conversions per page
  conversions?.forEach((conversion) => {
    if (pageMap.has(conversion.page_path)) {
      pageMap.get(conversion.page_path)!.conversions += 1;
    }
  });

  // Entry/exit counts would require tracking first/last pages per session
  // For now, we'll leave these at 0

  // Convert to array and calculate rates
  const results = Array.from(pageMap.entries()).map(([path, data]) => ({
    page_path: path,
    views: data.views,
    unique_visitors: data.visitors.size,
    conversions: data.conversions,
    conversion_rate: data.views > 0 ? (data.conversions / data.views) * 100 : 0,
    entry_count: data.entry_count,
    exit_count: data.exit_count,
    exit_rate: data.views > 0 ? (data.exit_count / data.views) * 100 : 0,
  }));

  return NextResponse.json({
    ok: true,
    data: results,
  });
}
