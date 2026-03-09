#!/usr/bin/env node
require('dotenv').config({ path: '.env.local', quiet: true });
const { createClient } = require('@supabase/supabase-js');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
};

const DEFAULT_PLACE_URL =
  'https://www.google.com/maps/place/Pink+Auto+Glass/@39.6700653,-106.2157665,8z/data=!3m1!4b1!4m6!3m5!1s0x6587cd12fed014a3:0xd0b210c48f4d989d!8m2!3d39.6775295!4d-104.8964855!16s%2Fg%2F11y19h096l?entry=ttu';

async function getPlaceId() {
  const res = await fetch(DEFAULT_PLACE_URL, { headers: HEADERS });
  const html = await res.text();
  const m = html.match(/<link href="([^"]*\/maps\/preview\/place\?[^"]+)" as="fetch"/i);
  if (!m) return null;
  const previewUrl = new URL(m[1].replace(/&amp;/g, '&'), 'https://www.google.com').toString();
  const r2 = await fetch(previewUrl, { headers: HEADERS });
  const raw = await r2.text();
  const pm = raw.match(/"(ChIJ[^"]+)"/);
  return pm ? pm[1] : null;
}

async function main() {
  console.log('1. Scraping Place ID from Google Maps...');
  const placeId = await getPlaceId();
  console.log('   Place ID:', placeId);
  if (!placeId) { console.error('Failed to get Place ID'); process.exit(1); }

  console.log('2. Calling Places API (New)...');
  const apiKey = process.env.GOOGLE_PLACES_SERVER_KEY;
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'displayName,rating,userRatingCount,reviews',
    },
  });

  if (!res.ok) {
    console.error('Places API error:', res.status, await res.text());
    process.exit(1);
  }

  const data = await res.json();
  console.log('   Business:', data.displayName?.text);
  console.log('   Rating:', data.rating);
  console.log('   Total reviews on Google:', data.userRatingCount);
  console.log('   Verbatims returned:', (data.reviews || []).length);
  (data.reviews || []).forEach((r, i) => {
    console.log(`   ${i+1}. ${r.authorAttribution?.displayName} — ${r.rating}★`);
  });

  console.log('3. Upserting to Supabase...');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const reviews = (data.reviews || []).map((r, idx) => ({
    review_id: String(r.name || `places-${placeId}-${idx}`),
    reviewer_name: String(r.authorAttribution?.displayName || 'Google User'),
    rating: Number(r.rating || 0),
    comment: String(r.originalText?.text || r.text?.text || '').trim(),
    published_at: String(r.publishTime || '').slice(0, 10) || null,
    synced_at: new Date().toISOString(),
    source: 'google_places_api',
  })).filter(r => r.comment);

  if (reviews.length > 0) {
    const { error } = await supabase.from('google_reviews').upsert(reviews, { onConflict: 'review_id' });
    if (error) { console.error('   Upsert error:', error.message); process.exit(1); }
    console.log(`   Stored ${reviews.length} verbatims`);
  }

  const { error: metaErr } = await supabase.from('google_reviews_meta').insert({
    user_rating_count: data.userRatingCount,
    average_rating: data.rating,
    place_id: placeId,
    synced_at: new Date().toISOString(),
  });
  if (metaErr) { console.error('   Meta insert error:', metaErr.message); process.exit(1); }
  console.log('   Meta stored');
  console.log('\nDone. Dashboard will now show', data.userRatingCount, 'reviews.');
}

main().catch(console.error);
