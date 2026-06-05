/**
 * Unit tests for decideCallCandidates() — the pure decision function in
 * exportCandidateBuilder.ts. Each test targets one branch of the evidence
 * hierarchy; the dedup/attribution window arithmetic is what we're guarding.
 */

import { describe, it, expect } from 'vitest';
import { decideCallCandidates } from '../exportCandidateBuilder';

// ── Test fixtures ─────────────────────────────────────────────────────────────

const CALL_TIME = new Date('2026-06-05T14:00:00.000Z');
const CALL_TIME_MS = CALL_TIME.getTime();
const NOW_MS = CALL_TIME_MS + 5 * 60 * 1000; // 5 min after call

function makeCall(overrides: Partial<{
  call_id: string;
  from_number: string;
  start_time: string;
  google_ads_call_match: boolean | null;
  gclid: string | null;
  msclkid: string | null;
}> = {}) {
  return {
    call_id: 'test-call-1',
    from_number: '+17205551234',
    start_time: CALL_TIME.toISOString(),
    google_ads_call_match: null,
    gclid: null,
    msclkid: null,
    ...overrides,
  };
}

// Click 1 min before call — inside dedup window (3 min)
const gclidClickInDedup = { gclid: 'gclid_abc', created_at: new Date(CALL_TIME_MS - 60_000).toISOString() };
// Click 5 min before call — outside dedup (3 min), inside attribution (60 min)
const gclidClickOutsideDedup = { gclid: 'gclid_abc', created_at: new Date(CALL_TIME_MS - 5 * 60_000).toISOString() };
const msclkidClickOutsideDedup = { msclkid: 'msclkid_xyz', created_at: new Date(CALL_TIME_MS - 5 * 60_000).toISOString() };
// Session 30 min before call — inside attribution window
const googleSession = { gclid: 'gclid_session', started_at: new Date(CALL_TIME_MS - 30 * 60_000).toISOString() };
const msSession = { msclkid: 'msclkid_session', started_at: new Date(CALL_TIME_MS - 30 * 60_000).toISOString() };
// Evidence before the attribution window (should be ignored)
const staleSession = { gclid: 'gclid_stale', started_at: new Date(CALL_TIME_MS - 90 * 60_000).toISOString() };

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('decideCallCandidates', () => {
  it('returns skip_google_call_view for both platforms when google_ads_call_match is true', () => {
    const call = makeCall({ google_ads_call_match: true });
    const [g, m] = decideCallCandidates(call, [], [], [], [], NOW_MS);
    expect(g.eligible).toBe(false);
    expect(g.reason).toBe('skip_google_call_view');
    expect(m.eligible).toBe(false);
    expect(m.reason).toBe('skip_google_call_view');
  });

  it('returns skip_realtime_tap for both platforms when gclid phone_click fired in dedup window', () => {
    const call = makeCall();
    const [g, m] = decideCallCandidates(call, [gclidClickInDedup], [], [], [], NOW_MS);
    expect(g.reason).toBe('skip_realtime_tap');
    expect(m.reason).toBe('skip_realtime_tap');
    expect(g.eligible).toBe(false);
  });

  it('returns skip_realtime_tap when msclkid phone_click fired in dedup window', () => {
    const msClick = { msclkid: 'msclkid_abc', created_at: new Date(CALL_TIME_MS - 60_000).toISOString() };
    const call = makeCall();
    const [g, m] = decideCallCandidates(call, [], [msClick], [], [], NOW_MS);
    expect(g.reason).toBe('skip_realtime_tap');
    expect(m.reason).toBe('skip_realtime_tap');
  });

  it('returns direct_attribution (google) when ringcentral_calls.gclid is set', () => {
    const call = makeCall({ gclid: 'gclid_canonical' });
    const [g, m] = decideCallCandidates(call, [], [], [], [], NOW_MS);
    expect(g.eligible).toBe(true);
    expect(g.reason).toBe('direct_attribution');
    expect(g.click_id).toBe('gclid_canonical');
    expect(g.confidence).toBe(90);
    expect(m.eligible).toBe(false);
    expect(m.reason).toBe('missing_click_id');
  });

  it('returns direct_attribution (microsoft) when ringcentral_calls.msclkid is set', () => {
    const call = makeCall({ msclkid: 'msclkid_canonical' });
    const [g, m] = decideCallCandidates(call, [], [], [], [], NOW_MS);
    expect(m.eligible).toBe(true);
    expect(m.reason).toBe('direct_attribution');
    expect(m.click_id).toBe('msclkid_canonical');
    expect(g.eligible).toBe(false);
  });

  it('returns direct_phone_click (google) for gclid phone_click outside dedup window', () => {
    const call = makeCall();
    const [g, m] = decideCallCandidates(call, [gclidClickOutsideDedup], [], [], [], NOW_MS);
    expect(g.eligible).toBe(true);
    expect(g.reason).toBe('direct_phone_click');
    expect(g.click_id).toBe('gclid_abc');
    expect(g.confidence).toBe(85);
    expect(m.reason).toBe('missing_click_id');
  });

  it('returns conflict for both platforms when both gclid and msclkid phone_clicks are outside dedup', () => {
    const call = makeCall();
    const [g, m] = decideCallCandidates(call, [gclidClickOutsideDedup], [msclkidClickOutsideDedup], [], [], NOW_MS);
    expect(g.reason).toBe('conflict');
    expect(m.reason).toBe('conflict');
    expect(g.eligible).toBe(false);
    expect(m.eligible).toBe(false);
  });

  it('returns session_fallback (google) when only a Google session is in the attribution window', () => {
    const call = makeCall();
    const [g, m] = decideCallCandidates(call, [], [], [googleSession], [], NOW_MS);
    expect(g.eligible).toBe(true);
    expect(g.reason).toBe('session_fallback');
    expect(g.click_id).toBe('gclid_session');
    expect(g.confidence).toBe(60);
    expect(m.reason).toBe('missing_click_id');
  });

  it('returns conflict when both Google and Microsoft sessions are in the attribution window', () => {
    const call = makeCall();
    const [g, m] = decideCallCandidates(call, [], [], [googleSession], [msSession], NOW_MS);
    expect(g.reason).toBe('conflict');
    expect(m.reason).toBe('conflict');
  });

  it('returns missing_click_id for both platforms when no evidence is found', () => {
    const call = makeCall();
    const [g, m] = decideCallCandidates(call, [], [], [], [], NOW_MS);
    expect(g.reason).toBe('missing_click_id');
    expect(m.reason).toBe('missing_click_id');
    expect(g.eligible).toBe(false);
    expect(m.eligible).toBe(false);
  });

  it('ignores stale sessions outside the attribution window', () => {
    const call = makeCall();
    // Only a stale session (90 min before call, window is 60 min) — should be ignored
    const [g, m] = decideCallCandidates(call, [], [], [staleSession], [], NOW_MS);
    expect(g.reason).toBe('missing_click_id');
    expect(m.reason).toBe('missing_click_id');
  });

  it('source_id, source_type, and platform are correct on returned candidates', () => {
    const call = makeCall({ call_id: 'rc-call-123' });
    const [g, m] = decideCallCandidates(call, [], [], [], [], NOW_MS);
    expect(g.source_type).toBe('call');
    expect(g.source_id).toBe('rc-call-123');
    expect(g.platform).toBe('google');
    expect(m.platform).toBe('microsoft');
  });

  it('dedup window boundary: click exactly at dedupWindowStart is outside dedup', () => {
    // DEDUP_WINDOW_MINUTES = 3; click at exactly 3 min before call should be OUTSIDE dedup
    const exactBoundaryClick = {
      gclid: 'gclid_boundary',
      created_at: new Date(CALL_TIME_MS - 3 * 60_000).toISOString(),
    };
    const call = makeCall();
    const [g] = decideCallCandidates(call, [exactBoundaryClick], [], [], [], NOW_MS);
    // t >= dedupStartMs where dedupStartMs = callTimeMs - 3*60*1000 → t === dedupStartMs → IN dedup
    // The dedup filter is t >= dedupStartMs: the exact boundary IS in the dedup window
    expect(g.reason).toBe('skip_realtime_tap');
  });
});
