import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const DEFAULT_PLACE_URL =
  'https://www.google.com/maps/place/Pink+Auto+Glass/@39.6700653,-106.2157665,8z/data=!3m1!4b1!4m6!3m5!1s0x6587cd12fed014a3:0xd0b210c48f4d989d!8m2!3d39.6775295!4d-104.8964855!16s%2Fg%2F11y19h096l?entry=ttu';

const SCRAPE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
};

async function getPlaceId(): Promise<string | null> {
  const placeUrl = process.env.GOOGLE_MAPS_PLACE_URL || DEFAULT_PLACE_URL;
  const res = await fetch(placeUrl, { headers: SCRAPE_HEADERS, cache: 'no-store' });
  if (!res.ok) return null;
  const html = await res.text();

  const previewMatch = html.match(/<link href="([^"]*\/maps\/preview\/place\?[^"]+)" as="fetch"/i);
  if (!previewMatch) return null;

  const previewUrl = new URL(previewMatch[1].replace(/&amp;/g, '&'), 'https://www.google.com').toString();
  const previewRes = await fetch(previewUrl, { headers: SCRAPE_HEADERS, cache: 'no-store' });
  if (!previewRes.ok) return null;
  const raw = await previewRes.text();

  const placeIdMatch = raw.match(/"(ChIJ[^"]+)"/);
  return placeIdMatch ? placeIdMatch[1] : null;
}

async function fetchPlacesData(placeId: string) {
  const apiKey = process.env.GOOGLE_PLACES_SERVER_KEY;
  if (!apiKey) throw new Error('GOOGLE_PLACES_SERVER_KEY not set');

  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    cache: 'no-store',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Places API error ${res.status}: ${body.slice(0, 300)}`);
  }

  return res.json();
}

export async function POST() {
  const supabase = getSupabaseClient();

  try {
    const placeId = await getPlaceId();
    if (!placeId) {
      return NextResponse.json({ ok: false, error: 'Could not resolve Place ID from Google Maps' }, { status: 500 });
    }

    const data = await fetchPlacesData(placeId);
    const userRatingCount: number = data.userRatingCount ?? 0;
    const averageRating: number = data.rating ?? 0;

    // Upsert verbatim reviews (Places API returns max 5)
    const reviews = (data.reviews ?? []).map((r: any, idx: number) => ({
      review_id: String(r.name || `places-${placeId}-${idx}`),
      reviewer_name: String(r.authorAttribution?.displayName || 'Google User'),
      rating: Number(r.rating ?? 0),
      comment: String(r.originalText?.text || r.text?.text || '').trim(),
      published_at: String(r.publishTime || '').slice(0, 10) || null,
      synced_at: new Date().toISOString(),
      source: 'google_places_api',
    })).filter((r: any) => r.comment);

    if (reviews.length > 0) {
      const { error } = await supabase
        .from('google_reviews')
        .upsert(reviews, { onConflict: 'review_id' });
      if (error) throw new Error(`DB upsert error: ${error.message}`);
    }

    // Store aggregate meta (always insert a new row for history)
    await supabase.from('google_reviews_meta').insert({
      user_rating_count: userRatingCount,
      average_rating: averageRating,
      place_id: placeId,
      synced_at: new Date().toISOString(),
    });

    return NextResponse.json({
      ok: true,
      placeId,
      userRatingCount,
      averageRating,
      verbatimsStored: reviews.length,
    });
  } catch (error: any) {
    console.error('GBP reviews sync error:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const supabase = getSupabaseClient();
  const { data: meta } = await supabase
    .from('google_reviews_meta')
    .select('*')
    .order('synced_at', { ascending: false })
    .limit(1)
    .single();

  const { count } = await supabase
    .from('google_reviews')
    .select('*', { count: 'exact', head: true });

  return NextResponse.json({
    ok: true,
    lastSync: meta?.synced_at ?? null,
    userRatingCount: meta?.user_rating_count ?? null,
    averageRating: meta?.average_rating ?? null,
    verbatimsInDb: count ?? 0,
  });
}
