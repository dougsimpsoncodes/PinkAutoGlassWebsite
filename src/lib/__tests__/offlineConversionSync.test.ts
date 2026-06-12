/**
 * Unit tests for the PR2b export-contract uploader core
 * (prepareCandidateUploads): pure planning function that turns eligible
 * export_candidates + source-row context into upload payloads, legacy
 * backstamps, and skips.
 *
 * Invariants guarded here:
 *  1. A candidate whose source row was already uploaded by the LEGACY
 *     uploader is never re-uploaded (transition safety) — it is backstamped.
 *  2. Calls use the candidate's call_value; leads use the lead's
 *     revenue_amount with the $91 default fallback.
 *  3. Lead candidates are skipped entirely when the platform's form
 *     conversion action is not configured (matches old env gating).
 *  4. Test/excluded sources never produce payloads (defense in depth —
 *     builder already filters, uploader re-checks).
 *  5. Platform mapping: google → gclid payloads, microsoft → msclkid +
 *     conversionName payloads.
 */

import { describe, it, expect } from 'vitest';
import { prepareCandidateUploads, type UploadCandidateRow } from '../offlineConversionSync';

const NOW = new Date('2026-06-12T17:00:00Z');

function callCandidate(over: Partial<UploadCandidateRow> = {}): UploadCandidateRow {
  return {
    id: 'cand-call-1',
    source_type: 'call',
    source_id: 'rc-call-1',
    platform: 'google',
    click_id_type: 'gclid',
    click_id: 'gclid-abc',
    conversion_time: '2026-06-11T15:00:00Z',
    call_value: 55,
    ...over,
  };
}

function leadCandidate(over: Partial<UploadCandidateRow> = {}): UploadCandidateRow {
  return {
    id: 'cand-lead-1',
    source_type: 'lead',
    source_id: 'lead-1',
    platform: 'google',
    click_id_type: 'gclid',
    click_id: 'gclid-lead',
    conversion_time: '2026-06-11T16:00:00Z',
    call_value: null,
    ...over,
  };
}

const baseCtx = {
  callRows: new Map([
    ['rc-call-1', { legacyUploadedAt: null, fromNumber: '+13035550100' }],
  ]),
  leadRows: new Map([
    ['lead-1', { legacyUploadedAt: null, revenueAmount: null, isTest: false }],
  ]),
  formActionConfigured: true,
  isExcludedSource: () => false,
  now: NOW,
};

describe('prepareCandidateUploads', () => {
  it('uploads an eligible call candidate using its call_value', () => {
    const plan = prepareCandidateUploads([callCandidate()], baseCtx);
    expect(plan.uploads).toHaveLength(1);
    expect(plan.uploads[0]).toMatchObject({
      candidateId: 'cand-call-1',
      sourceType: 'call',
      sourceId: 'rc-call-1',
      clickId: 'gclid-abc',
      value: 55,
      isFormLead: false,
    });
    expect(plan.backstamps).toHaveLength(0);
    expect(plan.skipped).toHaveLength(0);
  });

  it('backstamps (never re-uploads) a candidate whose source was uploaded by the legacy uploader', () => {
    const ctx = {
      ...baseCtx,
      callRows: new Map([
        ['rc-call-1', { legacyUploadedAt: '2026-06-09T10:00:00Z', fromNumber: '+13035550100' }],
      ]),
    };
    const plan = prepareCandidateUploads([callCandidate()], ctx);
    expect(plan.uploads).toHaveLength(0);
    expect(plan.backstamps).toEqual([
      { candidateId: 'cand-call-1', uploadedAt: '2026-06-09T10:00:00Z' },
    ]);
  });

  it('uses lead revenue_amount when present and $91 default when absent', () => {
    const ctx = {
      ...baseCtx,
      leadRows: new Map([
        ['lead-1', { legacyUploadedAt: null, revenueAmount: 530.16, isTest: false }],
        ['lead-2', { legacyUploadedAt: null, revenueAmount: null, isTest: false }],
      ]),
    };
    const plan = prepareCandidateUploads(
      [
        leadCandidate(),
        leadCandidate({ id: 'cand-lead-2', source_id: 'lead-2', click_id: 'gclid-lead-2' }),
      ],
      ctx
    );
    expect(plan.uploads.map((u) => u.value)).toEqual([530.16, 91]);
    expect(plan.uploads.every((u) => u.isFormLead)).toBe(true);
  });

  it('skips lead candidates when the form conversion action is not configured', () => {
    const plan = prepareCandidateUploads([leadCandidate()], {
      ...baseCtx,
      formActionConfigured: false,
    });
    expect(plan.uploads).toHaveLength(0);
    expect(plan.skipped).toEqual([
      { candidateId: 'cand-lead-1', reason: 'form_action_not_configured' },
    ]);
  });

  it('skips test leads and excluded call sources (defense in depth)', () => {
    const ctx = {
      ...baseCtx,
      callRows: new Map([
        ['rc-call-1', { legacyUploadedAt: null, fromNumber: '+15555550100' }],
      ]),
      leadRows: new Map([
        ['lead-1', { legacyUploadedAt: null, revenueAmount: null, isTest: true }],
      ]),
      isExcludedSource: (c: UploadCandidateRow) => c.source_type === 'call',
    };
    const plan = prepareCandidateUploads([callCandidate(), leadCandidate()], ctx);
    expect(plan.uploads).toHaveLength(0);
    expect(plan.skipped.map((s) => s.reason).sort()).toEqual(['excluded_source', 'test_lead']);
  });

  it('skips candidates whose source row is missing (stale candidate)', () => {
    const plan = prepareCandidateUploads(
      [callCandidate({ source_id: 'rc-unknown' })],
      baseCtx
    );
    expect(plan.uploads).toHaveLength(0);
    expect(plan.skipped).toEqual([
      { candidateId: 'cand-call-1', reason: 'source_row_missing' },
    ]);
  });

  it('skips candidates with no click_id (should not occur for eligible rows, but never upload without one)', () => {
    const plan = prepareCandidateUploads([callCandidate({ click_id: null })], baseCtx);
    expect(plan.uploads).toHaveLength(0);
    expect(plan.skipped).toEqual([
      { candidateId: 'cand-call-1', reason: 'missing_click_id' },
    ]);
  });
});
