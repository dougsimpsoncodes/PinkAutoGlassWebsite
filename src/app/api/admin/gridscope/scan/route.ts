import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const GRID_CONFIGS: Record<string, { lat: number; lng: number; latStep: number; lngStep: number }> = {
  phoenix: { lat: 33.4484, lng: -112.074, latStep: 0.08, lngStep: 0.1 },
  denver:  { lat: 39.7128, lng: -104.99,  latStep: 0.06, lngStep: 0.08 },
};

const OUR_BUSINESS_NAME = 'Pink Auto Glass';
const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';

interface PlaceResult {
  displayName?: { text?: string };
  id?: string;
}

async function searchNode(
  lat: number,
  lng: number,
  keyword: string,
  apiKey: string,
): Promise<{ rank: number | null; competitors: { name: string; rank: number; placeId: string }[] }> {
  const resp = await fetch(PLACES_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.displayName,places.id',
    },
    body: JSON.stringify({
      textQuery: keyword,
      locationBias: {
        circle: { center: { latitude: lat, longitude: lng }, radius: 2000 },
      },
      maxResultCount: 20,
    }),
  });

  if (!resp.ok) {
    console.error(`Places API error at ${lat},${lng}: ${resp.status}`);
    return { rank: null, competitors: [] };
  }

  const data = await resp.json();
  const places: PlaceResult[] = data.places || [];

  let rank: number | null = null;
  const competitors: { name: string; rank: number; placeId: string }[] = [];

  for (let i = 0; i < places.length; i++) {
    const name = places[i].displayName?.text || '';
    const placeId = places[i].id || '';

    if (name.toLowerCase().includes(OUR_BUSINESS_NAME.toLowerCase())) {
      rank = i + 1;
    } else if (competitors.length < 5) {
      competitors.push({ name, rank: i + 1, placeId });
    }
  }

  return { rank, competitors };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const city = (body.city || 'phoenix').toLowerCase();
    const keyword = body.keyword || 'windshield replacement';
    const gridSize = body.gridSize || 7;

    const config = GRID_CONFIGS[city];
    if (!config) {
      return NextResponse.json({ ok: false, error: `Unknown city: ${city}` }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'GOOGLE_MAPS_API_KEY not configured' }, { status: 500 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const half = Math.floor(gridSize / 2);
    const nodes: { row: number; col: number; lat: number; lng: number }[] = [];

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        nodes.push({
          row: r,
          col: c,
          lat: config.lat + (half - r) * config.latStep,
          lng: config.lng + (c - half) * config.lngStep,
        });
      }
    }

    // Run in batches of 10 to avoid rate limits
    const results: {
      row: number; col: number; lat: number; lng: number;
      rank: number | null; competitors: { name: string; rank: number; placeId: string }[];
    }[] = [];

    const BATCH_SIZE = 10;
    for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
      const batch = nodes.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map(async (node) => {
          const { rank, competitors } = await searchNode(node.lat, node.lng, keyword, apiKey);
          return { ...node, rank, competitors };
        }),
      );

      for (const r of batchResults) {
        if (r.status === 'fulfilled') {
          results.push(r.value);
        } else {
          const node = batch[batchResults.indexOf(r)];
          results.push({ ...node, rank: null, competitors: [] });
        }
      }
    }

    // Compute summary stats
    const ranked = results.filter((r) => r.rank !== null);
    const top3 = ranked.filter((r) => r.rank! <= 3);
    const solvPct = results.length > 0 ? Math.round((top3.length / results.length) * 100) : 0;
    const avgRank = ranked.length > 0
      ? Math.round((ranked.reduce((sum, r) => sum + r.rank!, 0) / ranked.length) * 10) / 10
      : null;

    // Insert scan
    const { data: scan, error: scanErr } = await supabase
      .from('gridscope_scans')
      .insert({
        city,
        keyword,
        grid_size: gridSize,
        lat_center: config.lat,
        lng_center: config.lng,
        lat_step: config.latStep,
        lng_step: config.lngStep,
        node_count: results.length,
        solv_pct: solvPct,
        avg_rank: avgRank,
      })
      .select('id')
      .single();

    if (scanErr) {
      return NextResponse.json({ ok: false, error: scanErr.message }, { status: 500 });
    }

    // Bulk insert results
    const rows = results.map((r) => ({
      scan_id: scan.id,
      row_index: r.row,
      col_index: r.col,
      lat: r.lat,
      lng: r.lng,
      rank: r.rank,
      competitors: r.competitors,
    }));

    const { error: resultsErr } = await supabase.from('gridscope_results').insert(rows);
    if (resultsErr) {
      return NextResponse.json({ ok: false, error: resultsErr.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      scanId: scan.id,
      summary: { solvPct, avgRank, nodeCount: results.length, rankedNodes: ranked.length, top3Nodes: top3.length },
      results: results.map((r) => ({
        row: r.row, col: r.col, lat: r.lat, lng: r.lng, rank: r.rank, competitors: r.competitors,
      })),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('GridScope scan error:', msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
