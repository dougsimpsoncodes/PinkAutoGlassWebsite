import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DateFilter, getMountainDateRange } from '@/lib/dashboardData';
import {
  googleReviews,
  GOOGLE_PROFILE_URL,
  GOOGLE_REVIEW_URL,
  type GoogleReview,
} from '@/data/reviews';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getReviewsFromDb(): Promise<{ reviews: ReviewRecord[]; meta: { userRatingCount: number | null; averageRating: number | null } }> {
  const supabase = getSupabaseClient();

  const [{ data: rows }, { data: meta }] = await Promise.all([
    supabase.from('google_reviews').select('*').order('published_at', { ascending: false }),
    supabase.from('google_reviews_meta').select('*').order('synced_at', { ascending: false }).limit(1).single(),
  ]);

  const reviews: ReviewRecord[] = (rows ?? []).map((r: any) => ({
    reviewId: r.review_id,
    reviewerName: r.reviewer_name,
    rating: r.rating,
    comment: r.comment ?? '',
    date: r.published_at ?? r.synced_at?.slice(0, 10) ?? '',
    source: 'google_places_api' as const,
  }));

  return {
    reviews,
    meta: {
      userRatingCount: meta?.user_rating_count ?? null,
      averageRating: meta?.average_rating ?? null,
    },
  };
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type ThemeKey =
  | 'speed'
  | 'professionalism'
  | 'mobileConvenience'
  | 'insuranceHelp'
  | 'communication'
  | 'pricingClarity'
  | 'quality';

interface ReviewRecord {
  reviewId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
  source: 'local_curated_repo' | 'google_places_api';
}

interface ThemeResult {
  key: ThemeKey;
  label: string;
  count: number;
  pct: number;
}

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  action: string;
  why: string;
}

interface PlacesReview {
  reviewId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

function toReviewRecord(review: GoogleReview, idx: number): ReviewRecord {
  return {
    reviewId: `local-${idx + 1}`,
    reviewerName: review.author,
    rating: review.rating,
    comment: review.text,
    date: review.date,
    source: 'local_curated_repo',
  };
}

function buildThemeResults(reviews: ReviewRecord[]): { strengths: ThemeResult[]; concerns: ThemeResult[] } {
  const rules: Array<{ key: ThemeKey; label: string; keywords: string[]; concern?: boolean }> = [
    { key: 'speed', label: 'Fast Scheduling / Turnaround', keywords: ['same day', 'fast', 'quick', 'hour', 'lunch'] },
    { key: 'professionalism', label: 'Technician Professionalism', keywords: ['professional', 'helpful', 'legit', 'great service'] },
    { key: 'mobileConvenience', label: 'Mobile Convenience', keywords: ['came to my', 'office', 'house', 'parking lot', 'driveway'] },
    { key: 'insuranceHelp', label: 'Insurance Handling', keywords: ['insurance', 'deductible', 'claim'] },
    { key: 'communication', label: 'Communication Clarity', keywords: ['communication', 'updated', 'explained'], concern: true },
    { key: 'pricingClarity', label: 'Price Clarity', keywords: ['price', 'affordable', 'best price', 'quote'], concern: true },
    { key: 'quality', label: 'Installation Quality', keywords: ['quality', 'looks perfect', 'brand new', 'calibration'] },
  ];

  const reviewCount = reviews.length || 1;
  const counts = new Map<ThemeKey, number>();
  for (const rule of rules) counts.set(rule.key, 0);

  for (const review of reviews) {
    const text = review.comment.toLowerCase();
    for (const rule of rules) {
      if (rule.keywords.some(keyword => text.includes(keyword))) {
        counts.set(rule.key, (counts.get(rule.key) || 0) + 1);
      }
    }
  }

  const all = rules.map(rule => ({
    key: rule.key,
    label: rule.label,
    count: counts.get(rule.key) || 0,
    pct: Number((((counts.get(rule.key) || 0) / reviewCount) * 100).toFixed(1)),
    concern: Boolean(rule.concern),
  }));

  const strengths = all
    .filter(t => !t.concern && t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map(({ concern: _c, ...rest }) => rest);

  const concerns = all
    .filter(t => t.concern && t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4)
    .map(({ concern: _c, ...rest }) => rest);

  return { strengths, concerns };
}

function buildRecommendations(params: {
  profileReviewCount: number | null;
  reviewsLast30: number;
  lowRatingPct: number;
  hasDirectGoogleApiCount: boolean;
}): Recommendation[] {
  const recs: Recommendation[] = [];

  if (!params.hasDirectGoogleApiCount) {
    recs.push({
      priority: 'high',
      title: 'Connect Google Reviews API',
      action: 'Add a Google Places API key (or GBP API OAuth scope) to ingest authoritative review count + verbatims.',
      why: 'Current dashboard can analyze local review corpus, but not full live Google inventory.',
    });
  }

  if ((params.profileReviewCount || 0) < 100) {
    recs.push({
      priority: 'high',
      title: 'Increase Review Volume',
      action: 'Keep same-day SMS + email ask after completed jobs and track weekly review velocity.',
      why: 'Competitive map pack visibility is strongly tied to review count, not rating alone.',
    });
  }

  if (params.reviewsLast30 < 5) {
    recs.push({
      priority: 'medium',
      title: 'Lift Monthly Velocity',
      action: 'Set a 30-day target of 8+ new reviews with technician scorecard accountability.',
      why: 'Low recent velocity reduces recency signal and slows local ranking momentum.',
    });
  }

  if (params.lowRatingPct > 5) {
    recs.push({
      priority: 'high',
      title: 'Service Recovery SLA',
      action: 'Respond to all low-star reviews in <1 business day and track closure status.',
      why: 'Fast response protects conversion and demonstrates active reputation management.',
    });
  } else {
    recs.push({
      priority: 'low',
      title: 'Preserve Quality Signal',
      action: 'Continue coaching on arrival communication, cleanup, and expectation-setting.',
      why: 'Strong quality signal should be defended while review volume scales.',
    });
  }

  return recs.slice(0, 4);
}

function parsePlacePageSnapshot(html: string) {
  const previewHrefMatch = html.match(/<link href="([^"]*\/maps\/preview\/place\?[^"]+)" as="fetch"/i);
  const previewHref = previewHrefMatch?.[1]?.replace(/&amp;/g, '&') || null;
  return { previewHref };
}

function parsePreviewPayload(raw: string) {
  const ratingMatch = raw.match(/\[null,null,null,null,null,null,null,([0-9.]+)\]/);
  const rating = ratingMatch ? Number(ratingMatch[1]) : null;

  const phoneMatch = raw.match(/\(\d{3}\)\s*\d{3}-\d{4}/);
  const phone = phoneMatch ? phoneMatch[0] : null;

  const placeIdMatch = raw.match(/"(ChIJ[^"]+)"/);
  const placeId = placeIdMatch ? placeIdMatch[1] : null;

  const mapsCidMatch = raw.match(/"(0x[0-9a-f]+:0x[0-9a-f]+)"/i);
  const mapsCid = mapsCidMatch ? mapsCidMatch[1] : null;

  return { rating, phone, placeId, mapsCid };
}

async function fetchPublicGoogleSnapshot() {
  const defaultPlaceUrl = 'https://www.google.com/maps/place/Pink+Auto+Glass/@39.6700653,-106.2157665,8z/data=!3m1!4b1!4m6!3m5!1s0x6587cd12fed014a3:0xd0b210c48f4d989d!8m2!3d39.6775295!4d-104.8964855!16s%2Fg%2F11y19h096l?entry=ttu';
  const placeUrl = process.env.GOOGLE_MAPS_PLACE_URL || defaultPlaceUrl;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  };

  const placeResp = await fetch(placeUrl, { headers, cache: 'no-store' });
  if (!placeResp.ok) return null;
  const html = await placeResp.text();
  const parsedPage = parsePlacePageSnapshot(html);
  if (!parsedPage.previewHref) return null;

  const previewUrl = new URL(parsedPage.previewHref, 'https://www.google.com').toString();
  const previewResp = await fetch(previewUrl, { headers, cache: 'no-store' });
  if (!previewResp.ok) return null;
  const previewRaw = await previewResp.text();
  const payload = parsePreviewPayload(previewRaw);

  return {
    ...payload,
    fetchedAt: new Date().toISOString(),
    placeUrl,
  };
}

async function fetchPlacesApiReviews(placeId: string | null): Promise<{
  ok: boolean;
  rating: number | null;
  userRatingCount: number | null;
  reviews: PlacesReview[];
  error?: string;
}> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey || !placeId) {
    return { ok: false, rating: null, userRatingCount: null, reviews: [], error: 'missing_api_key_or_place_id' };
  }

  const endpoint = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
  const resp = await fetch(endpoint, {
    cache: 'no-store',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews',
    },
  });

  if (!resp.ok) {
    const body = await resp.text();
    return { ok: false, rating: null, userRatingCount: null, reviews: [], error: body.slice(0, 500) };
  }

  const json = await resp.json();
  const reviews: PlacesReview[] = (json.reviews || []).map((r: any, idx: number) => ({
    reviewId: String(r.name || `places-${idx + 1}`),
    reviewerName: String(r.authorAttribution?.displayName || 'Google User'),
    rating: Number(r.rating || 0),
    comment: String(r.originalText?.text || r.text?.text || '').trim(),
    date: String(r.publishTime || '').slice(0, 10),
  })).filter((r: PlacesReview) => r.comment);

  return {
    ok: true,
    rating: Number(json.rating || 0) || null,
    userRatingCount: Number(json.userRatingCount || 0) || null,
    reviews,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get('period') || 'all') as DateFilter;
    const { start, end, display } = getMountainDateRange(period);

    // 1. Try Supabase (populated by /api/admin/sync/gbp-reviews)
    const db = await getReviewsFromDb().catch(() => ({ reviews: [], meta: { userRatingCount: null, averageRating: null } }));

    // 2. Fall back to local curated set only if DB is empty
    const fallbackReviews: ReviewRecord[] = googleReviews
      .map(toReviewRecord)
      .sort((a, b) => b.date.localeCompare(a.date));

    const allReviews = db.reviews.length > 0 ? db.reviews : fallbackReviews;
    const usingDb = db.reviews.length > 0;

    const filteredReviews = allReviews.filter(review => {
      if (!review.date) return true;
      const dt = new Date(`${review.date}T00:00:00`);
      return dt >= start && dt <= end;
    });

    const analysisPool = filteredReviews.length > 0 ? filteredReviews : allReviews;
    const total = analysisPool.length;
    const avgRating = total > 0
      ? Number((analysisPool.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(2))
      : 0;

    const lowRatings = analysisPool.filter(r => r.rating <= 3).length;
    const lowRatingPct = total > 0 ? Number(((lowRatings / total) * 100).toFixed(1)) : 0;
    const now = new Date();
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const reviewsLast30 = allReviews.filter(r => r.date && new Date(`${r.date}T00:00:00`) >= d30).length;
    const reviewsLast90 = allReviews.filter(r => r.date && new Date(`${r.date}T00:00:00`) >= d90).length;

    const distribution = [5, 4, 3, 2, 1].map(stars => {
      const count = analysisPool.filter(r => r.rating === stars).length;
      return {
        stars,
        count,
        pct: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
      };
    });

    const themes = buildThemeResults(analysisPool);
    const hasDirectGoogleApiCount = usingDb && db.meta.userRatingCount !== null;
    const profileReviewCount = db.meta.userRatingCount ?? (usingDb ? total : null);

    const recommendations = buildRecommendations({
      profileReviewCount,
      reviewsLast30,
      lowRatingPct,
      hasDirectGoogleApiCount,
    });

    const response = {
      dateRange: { period, start: start.toISOString(), end: end.toISOString(), display },
      source: {
        mode: usingDb ? 'google_places_api' : 'local_curated_repo',
        hasDirectGoogleApiCount,
        notes: [
          usingDb
            ? 'Live Google reviews synced via Places API.'
            : 'No synced reviews yet — run Sync All Data to connect live Google reviews.',
        ],
      },
      profile: {
        businessName: 'Pink Auto Glass',
        googleProfileUrl: GOOGLE_PROFILE_URL,
        googleReviewUrl: GOOGLE_REVIEW_URL,
        rating: db.meta.averageRating ?? avgRating,
        userRatingCount: profileReviewCount,
      },
      metrics: {
        datasetReviewCount: total,
        datasetAverageRating: avgRating,
        profileReviewCount: profileReviewCount ?? total,
        profileReviewCountScope: hasDirectGoogleApiCount ? 'google_profile_total' : 'connected_dataset_total',
        reviewsLast30,
        reviewsLast90,
        lowRatingPct,
      },
      distribution,
      themes,
      recommendations,
      reviews: analysisPool.slice(0, 50),
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in Google Reviews API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google reviews data' },
      { status: 500 }
    );
  }
}
