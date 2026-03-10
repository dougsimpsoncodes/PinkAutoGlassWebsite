'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '@/components/admin/DashboardLayout';

// ── Types ────────────────────────────────────────────────────────────────────

interface NodeResult {
  row: number | string;
  col: number | string;
  lat: number;
  lng: number;
  rank: number | null;
  competitors: { name: string; rank: number; placeId: string }[];
  row_index?: number;
  col_index?: number;
}

interface ScanSummary {
  solvPct: number;
  avgRank: number | null;
  nodeCount: number;
  rankedNodes: number;
  top3Nodes: number;
}

interface ScanRecord {
  id: string;
  city: string;
  keyword: string;
  grid_size: number;
  solv_pct: number;
  avg_rank: number | null;
  node_count: number;
  created_at: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const KEYWORDS = [
  'windshield replacement',
  'auto glass repair',
  'mobile windshield replacement',
  '$0 deductible windshield',
];

const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  phoenix: { lat: 33.4484, lng: -112.074 },
  denver: { lat: 39.7128, lng: -104.99 },
};

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// ── Rank color helpers ───────────────────────────────────────────────────────

function rankColor(rank: number | null): { bg: string; text: string } {
  if (rank === null) return { bg: '#374151', text: '#d1d5db' };
  if (rank === 1) return { bg: '#166534', text: '#fff' };
  if (rank <= 3) return { bg: '#22c55e', text: '#fff' };
  if (rank <= 5) return { bg: '#a3e635', text: '#365314' };
  if (rank <= 7) return { bg: '#facc15', text: '#713f12' };
  if (rank <= 9) return { bg: '#f97316', text: '#fff' };
  return { bg: '#dc2626', text: '#fff' };
}

function makeSvgIcon(label: string, bg: string, textColor: string): string {
  const fs = label.length > 1 ? 11 : 13;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <circle cx="18" cy="18" r="16" fill="${bg}" stroke="rgba(255,255,255,0.95)" stroke-width="2.5"
              style="filter:drop-shadow(0 2px 4px rgba(0,0,0,0.45))"/>
      <text x="18" y="${18 + fs * 0.38}" text-anchor="middle" font-size="${fs}" font-weight="700"
            fill="${textColor}" font-family="-apple-system,sans-serif">${label}</text>
    </svg>`,
  )}`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function GridScopePage() {
  const [city, setCity] = useState<'phoenix' | 'denver'>('phoenix');
  const [keyword, setKeyword] = useState(KEYWORDS[0]);
  const [gridSize, setGridSize] = useState(7);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<NodeResult[]>([]);
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [recentScans, setRecentScans] = useState<ScanRecord[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [mapError, setMapError] = useState('');

  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<any[]>([]);

  // ── Load Google Maps via script tag ─────────────────────────────────────────

  useEffect(() => {
    // Auth failure callback — fires when Maps JS rejects the key.
    // Only treat as fatal if the map hasn't already rendered (Google can
    // fire this late during background tile-auth even when tiles loaded).
    (window as any).gm_authFailure = () => {
      if (!googleMapRef.current) {
        setMapError('gm_authFailure triggered (Maps JS rejected the key).');
        setMapStatus('error');
      } else {
        console.warn('[GridScope] gm_authFailure fired after map initialized — ignoring.');
      }
    };

    // Already loaded (e.g. HMR)
    if (typeof google !== 'undefined' && google.maps && mapRef.current) {
      googleMapRef.current = new google.maps.Map(mapRef.current, {
        center: CITY_CENTERS[city], zoom: 11, mapTypeId: 'roadmap',
        mapTypeControl: false, streetViewControl: false,
        fullscreenControl: true, gestureHandling: 'cooperative',
      });
      setMapStatus('ready');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!mapRef.current) { setMapError('Map container not found'); setMapStatus('error'); return; }
      try {
        googleMapRef.current = new google.maps.Map(mapRef.current, {
          center: CITY_CENTERS[city], zoom: 11, mapTypeId: 'roadmap',
          mapTypeControl: false, streetViewControl: false,
          fullscreenControl: true, gestureHandling: 'cooperative',
        });
        setMapStatus('ready');
      } catch (e) {
        setMapError(`Map init failed: ${e}`);
        setMapStatus('error');
      }
    };
    script.onerror = () => { setMapError('Google Maps script failed to load'); setMapStatus('error'); };
    document.head.appendChild(script);

    return () => {
      delete (window as any).gm_authFailure;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Re-render map when tab regains focus (browser suspends inactive tabs) ──

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && googleMapRef.current) {
        google.maps.event.trigger(googleMapRef.current, 'resize');
        googleMapRef.current.setCenter(CITY_CENTERS[city]);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [city]);

  // ── Re-center map when city changes ──────────────────────────────────────

  useEffect(() => {
    if (googleMapRef.current) {
      googleMapRef.current.setCenter(CITY_CENTERS[city]);
    }
  }, [city]);

  // ── Draw markers from results ────────────────────────────────────────────

  const drawMarkers = useCallback((nodes: NodeResult[]) => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (!googleMapRef.current) return;

    for (const node of nodes) {
      const rank = node.rank;
      const { bg, text } = rankColor(rank);
      const label = rank === null ? 'NR' : String(rank);

      const marker = new google.maps.Marker({
        position: { lat: node.lat, lng: node.lng },
        map: googleMapRef.current,
        icon: {
          url: makeSvgIcon(label, bg, text),
          scaledSize: new google.maps.Size(36, 36),
          anchor: new google.maps.Point(18, 18),
        },
        title: rank === null ? 'Not ranked' : `Rank #${rank}`,
      });

      const info = new google.maps.InfoWindow({
        content: `
          <div style="font-size:13px;font-weight:600;margin-bottom:4px;">
            ${rank === null ? 'Not Ranked' : `Rank #${rank}`}
          </div>
          <div style="font-size:11px;color:#6b7280;">${keyword}</div>
          ${node.competitors?.length ? `
            <div style="margin-top:6px;font-size:11px;color:#374151;">
              <strong>Top competitors:</strong><br/>
              ${node.competitors.slice(0, 3).map((c) => `#${c.rank} ${c.name}`).join('<br/>')}
            </div>
          ` : ''}
        `,
      });
      marker.addListener('click', () => info.open(googleMapRef.current!, marker));

      markersRef.current.push(marker);
    }
  }, [keyword]);

  // ── Fetch recent scans ─────────────────────────────────────────────────────

  const fetchRecentScans = useCallback(async () => {
    try {
      const params = new URLSearchParams({ city, keyword, limit: '20' });
      const res = await fetch(`/api/admin/gridscope/scans?${params}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok) {
        setRecentScans(json.scans);
        if (json.scans.length > 0 && !selectedScanId) {
          loadScan(json.scans[0].id, json.scans[0]);
        }
      }
    } catch {
      // silently ignore — scans list is non-critical
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, keyword]);

  useEffect(() => {
    fetchRecentScans();
  }, [fetchRecentScans]);

  // ── Load a specific scan ─────────────────────────────────────────────────

  const loadScan = async (scanId: string, scanMeta?: ScanRecord) => {
    try {
      setSelectedScanId(scanId);
      const res = await fetch(`/api/admin/gridscope/results?scan_id=${scanId}`);
      if (!res.ok) return;
      const json = await res.json();
      if (json.ok) {
        const nodes: NodeResult[] = json.results.map((r: NodeResult) => ({
          ...r,
          row: r.row_index ?? r.row,
          col: r.col_index ?? r.col,
        }));
        setResults(nodes);
        drawMarkers(nodes);

        if (scanMeta) {
          setSummary({
            solvPct: scanMeta.solv_pct,
            avgRank: scanMeta.avg_rank,
            nodeCount: scanMeta.node_count,
            rankedNodes: nodes.filter((n) => n.rank !== null).length,
            top3Nodes: nodes.filter((n) => n.rank !== null && n.rank <= 3).length,
          });
          setLastScanTime(new Date(scanMeta.created_at).toLocaleString());
        }
      }
    } catch {
      // silently ignore
    }
  };

  // ── Run a new scan ───────────────────────────────────────────────────────

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/admin/gridscope/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, keyword, gridSize }),
      });
      if (!res.ok) {
        const text = await res.text();
        alert(`Scan failed (${res.status}): ${text}`);
        return;
      }
      const json = await res.json();
      if (json.ok) {
        setResults(json.results);
        setSummary(json.summary);
        setSelectedScanId(json.scanId);
        setLastScanTime(new Date().toLocaleString());
        drawMarkers(json.results);
        fetchRecentScans();
      } else {
        alert(`Scan failed: ${json.error}`);
      }
    } catch (err) {
      alert(`Scan error: ${err}`);
    } finally {
      setScanning(false);
    }
  };

  // ── Aggregate competitors across all nodes ───────────────────────────────

  const competitorStats = (() => {
    if (!results.length) return [];
    const map = new Map<string, { name: string; appearances: number; totalRank: number; placeId: string }>();
    for (const node of results) {
      for (const c of node.competitors || []) {
        const existing = map.get(c.name);
        if (existing) {
          existing.appearances++;
          existing.totalRank += c.rank;
        } else {
          map.set(c.name, { name: c.name, appearances: 1, totalRank: c.rank, placeId: c.placeId });
        }
      }
    }
    return Array.from(map.values())
      .map((c) => ({ ...c, avgRank: Math.round((c.totalRank / c.appearances) * 10) / 10 }))
      .sort((a, b) => b.appearances - a.appearances)
      .slice(0, 10);
  })();

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GridScope</h1>
          <p className="text-sm text-gray-500">Local rank tracking — Pink Auto Glass</p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['phoenix', 'denver'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition ${
                  city === c ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </button>
            ))}
          </div>

          <select
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
          >
            {KEYWORDS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>

          <select
            value={gridSize}
            onChange={(e) => setGridSize(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
          >
            <option value={7}>7x7 Grid</option>
            <option value={9}>9x9 Grid</option>
          </select>

          <button
            onClick={runScan}
            disabled={scanning}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white
              bg-gradient-to-r from-pink-600 to-blue-600 shadow-md
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanning ? 'Scanning...' : '\u25B6 Run Scan'}
          </button>

          {recentScans.length > 0 && (
            <select
              value={selectedScanId || ''}
              onChange={(e) => {
                const scan = recentScans.find((s) => s.id === e.target.value);
                if (scan) loadScan(scan.id, scan);
              }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white"
            >
              {recentScans.map((s) => (
                <option key={s.id} value={s.id}>
                  {new Date(s.created_at).toLocaleDateString()} — SoLV {s.solv_pct}%
                </option>
              ))}
            </select>
          )}

          {lastScanTime && (
            <span className="text-xs text-gray-400 ml-auto">
              Last scan: {lastScanTime} &middot; {results.length} nodes
            </span>
          )}
        </div>

        {/* Metric Cards */}
        {summary && (
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">SoLV Score</div>
              <div className="text-3xl font-extrabold text-green-600">{summary.solvPct}%</div>
              <div className="text-xs text-gray-500">{summary.top3Nodes}/{summary.nodeCount} nodes in top 3</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Avg Rank</div>
              <div className="text-3xl font-extrabold text-blue-600">{summary.avgRank ?? '\u2014'}</div>
              <div className="text-xs text-gray-500">Across ranked nodes</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Competitors</div>
              <div className="text-3xl font-extrabold text-gray-900">{competitorStats.length}</div>
              <div className="text-xs text-gray-500">Appeared on this grid</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Coverage Gap</div>
              <div className="text-3xl font-extrabold text-amber-600">
                {summary.nodeCount - summary.top3Nodes}
              </div>
              <div className="text-xs text-gray-500">Nodes not ranked top 3</div>
            </div>
          </div>
        )}

        {/* Map + Sidebar */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-900">
              {city.charAt(0).toUpperCase() + city.slice(1)} Metro &mdash; &ldquo;{keyword}&rdquo;
            </h2>
            <span className="text-xs text-gray-400">
              {gridSize}x{gridSize} grid &middot; ~{gridSize * 5} mile radius
            </span>
          </div>

          <div className="flex gap-5">
            <div className="flex-1">
              <div className="relative w-full rounded-lg overflow-hidden bg-gray-100" style={{ height: 480 }}>
                {/* Map container — no React children; Google Maps owns this div */}
                <div ref={mapRef} className="absolute inset-0" />
                {/* Loading overlay — rendered on top, removed when map is ready */}
                {mapStatus === 'loading' && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm bg-gray-100 z-10">Loading map...</div>
                )}
                {mapStatus === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm bg-red-50 z-10">Map error: {mapError}</div>
                )}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mt-3">
                {[
                  { label: 'Rank 1', color: '#166534' },
                  { label: '2\u20133', color: '#22c55e' },
                  { label: '4\u20135', color: '#a3e635' },
                  { label: '6\u20137', color: '#facc15' },
                  { label: '8\u20139', color: '#f97316' },
                  { label: '10+', color: '#dc2626' },
                  { label: 'Not Ranked', color: '#374151' },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar stats */}
            {summary && (
              <div className="w-52 flex flex-col gap-2.5 shrink-0">
                <div className="bg-white rounded-xl shadow-sm border p-4 text-center">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">SoLV</div>
                  <div className="text-4xl font-extrabold text-green-600">{summary.solvPct}%</div>
                  <div className="text-xs text-gray-500">Share of Local Voice</div>
                </div>
                {[
                  { label: 'Avg Rank', value: summary.avgRank ?? '\u2014' },
                  { label: 'Ranked Nodes', value: `${summary.rankedNodes} / ${summary.nodeCount}` },
                  { label: 'Top-3 Nodes', value: summary.top3Nodes, color: 'text-green-600' },
                  { label: 'Rank 8+ Nodes', value: results.filter((r) => r.rank !== null && r.rank >= 8).length, color: 'text-red-600' },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-lg shadow-sm border px-3 py-2.5 flex justify-between items-center">
                    <span className="text-xs text-gray-500">{s.label}</span>
                    <span className={`text-lg font-bold ${s.color || 'text-gray-900'}`}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Competitor Table */}
        {competitorStats.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Competitor Overview — All Nodes</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide border-b">
                  <th className="text-left py-2 px-3">Business</th>
                  <th className="text-left py-2 px-3">Avg Rank</th>
                  <th className="text-left py-2 px-3">Appearances</th>
                  <th className="text-left py-2 px-3">SoLV Est.</th>
                </tr>
              </thead>
              <tbody>
                {competitorStats.map((c) => (
                  <tr key={c.name} className="border-b border-gray-50 hover:bg-pink-50">
                    <td className="py-2.5 px-3 font-medium text-gray-900">{c.name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center justify-center w-8 rounded text-xs font-bold ${
                        c.avgRank <= 3 ? 'bg-green-100 text-green-800'
                        : c.avgRank <= 7 ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                        {c.avgRank}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">{c.appearances} / {results.length}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                        c.avgRank <= 3 ? 'bg-green-100 text-green-800'
                        : c.avgRank <= 7 ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                        {Math.round((c.appearances / results.length) * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!results.length && !scanning && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-4xl mb-3">📡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No scans yet</h3>
            <p className="text-sm text-gray-500 mb-4">
              Click &ldquo;Run Scan&rdquo; to check where Pink Auto Glass ranks across the {city.charAt(0).toUpperCase() + city.slice(1)} metro area.
            </p>
          </div>
        )}

        {scanning && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin text-4xl mb-3">📡</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Scanning {gridSize * gridSize} nodes...</h3>
            <p className="text-sm text-gray-500">
              Checking each grid point for &ldquo;{keyword}&rdquo; via Google Places API. This takes 20-40 seconds.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
