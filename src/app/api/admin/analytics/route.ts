import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {

  try {
    const { searchParams } = new URL(req.url);
    const dateRange = searchParams.get('range') || '7days';
    const metric = searchParams.get('metric');

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'yesterday':
        startDate = new Date(now.setDate(now.getDate() - 1));
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30days':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90days':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

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
  const { data, error } = await supabase
    .from('user_sessions')
    .select('utm_source, utm_medium, utm_campaign')
    .gte('started_at', startDate.toISOString());

  if (error) throw error;

  // Group by source
  const sourceCounts: Record<string, number> = {};
  data?.forEach((session: any) => {
    const source = session.utm_source || 'direct';
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
  // Get all sessions with their conversions
  const { data: sessions, error: sessionsError } = await supabase
    .from('user_sessions')
    .select('session_id, utm_source, utm_medium, utm_campaign, page_views_count')
    .gte('started_at', startDate.toISOString());

  if (sessionsError) throw sessionsError;

  // Get all conversions - exclude admin and test pages
  const { data: conversions, error: conversionsError } = await supabase
    .from('conversion_events')
    .select('session_id, utm_source')
    .gte('created_at', startDate.toISOString())
    .not('page_path', 'like', '/admin%')
    .not('page_path', 'like', '/test%');

  if (conversionsError) throw conversionsError;

  // Group by source
  const sourceMap = new Map();

  sessions?.forEach((session) => {
    const source = session.utm_source || 'direct';
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
    sourceData.page_views += session.page_views_count || 0;
  });

  conversions?.forEach((conversion) => {
    const source = conversion.utm_source || 'direct';
    if (sourceMap.has(source)) {
      sourceMap.get(source).conversions += 1;
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
