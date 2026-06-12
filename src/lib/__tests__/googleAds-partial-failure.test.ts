/**
 * Regression test for the partial-failure result-ordering bug (Codex review
 * of PR #55, finding 1): the old implementation pushed failed results FIRST
 * and successes after, so results[i] did not correspond to conversions[i]
 * whenever any conversion failed. syncPlatform stamps bookkeeping by index —
 * misordered results stamped a failed candidate as uploaded and retried a
 * succeeded one.
 */

import { describe, it, expect } from 'vitest';
import { mapPartialFailureResults, type OfflineConversion } from '../googleAds';

const conversions: OfflineConversion[] = [
  { gclid: 'gclid-A', conversionDateTime: '2026-06-11 10:00:00-07:00' },
  { gclid: 'gclid-B', conversionDateTime: '2026-06-11 11:00:00-07:00' },
  { gclid: 'gclid-C', conversionDateTime: '2026-06-11 12:00:00-07:00' },
];

function failureFor(index: number, message = 'CLICK_NOT_FOUND') {
  return {
    details: [
      {
        errors: [
          {
            message,
            location: {
              field_path_elements: [{ field_name: 'conversions', index }],
            },
          },
        ],
      },
    ],
  };
}

describe('mapPartialFailureResults', () => {
  it('keeps results input-ordered when a middle conversion fails ([success, failure, success])', () => {
    const { results, successCount, failureCount } = mapPartialFailureResults(
      conversions,
      failureFor(1)
    );

    expect(results.map((r) => r.gclid)).toEqual(['gclid-A', 'gclid-B', 'gclid-C']);
    expect(results.map((r) => r.success)).toEqual([true, false, true]);
    expect(results[1].error).toBe('CLICK_NOT_FOUND');
    expect(successCount).toBe(2);
    expect(failureCount).toBe(1);
  });

  it('returns all successes when there is no partial failure error', () => {
    const { results, successCount, failureCount } = mapPartialFailureResults(conversions, null);
    expect(results.map((r) => r.success)).toEqual([true, true, true]);
    expect(successCount).toBe(3);
    expect(failureCount).toBe(0);
  });

  it('collapses multiple errors on the same index to one failed result', () => {
    const twoErrorsSameIndex = {
      details: [
        { errors: [failureFor(0).details[0].errors[0], failureFor(0, 'second message').details[0].errors[0]] },
      ],
    };
    const { results, failureCount } = mapPartialFailureResults(conversions, twoErrorsSameIndex);
    expect(results).toHaveLength(3);
    expect(failureCount).toBe(1);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toBe('CLICK_NOT_FOUND');
  });

  it('ignores out-of-range failure indices', () => {
    const { results, failureCount } = mapPartialFailureResults(conversions, failureFor(99));
    expect(results.map((r) => r.success)).toEqual([true, true, true]);
    expect(failureCount).toBe(0);
  });
});
