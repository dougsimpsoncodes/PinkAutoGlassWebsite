/**
 * Centralized Attribution Logic
 *
 * Single source of truth for:
 * - Platform label types (TypeScript union)
 * - Click ID normalization
 * - Platform derivation with precedence rules
 * - camelCase → snake_case field mapping
 *
 * TRUST BOUNDARY: ad_platform is NEVER trusted from client.
 * It's derived server-side from click ID presence.
 *
 * PRECEDENCE: gclid > msclkid > known utm_source
 * SOURCE OF TRUTH: Session lookup > body values (prevent spoofing)
 */

import { isKnownUtmSource, type KnownUtmSource } from './validation';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

/**
 * Valid ad_platform values.
 * Must match database constraint: check_leads_ad_platform
 *
 * Paid traffic (has click ID):
 *   - 'google'    : Google Ads (gclid present)
 *   - 'microsoft' : Microsoft/Bing Ads (msclkid present)
 *
 * Organic traffic (utm_source, no click ID):
 *   - 'google_organic'    : utm_source=google, no gclid
 *   - 'microsoft_organic' : utm_source=bing, no msclkid
 *   - 'facebook'          : utm_source=facebook
 *
 * Legacy (kept for backwards compat):
 *   - 'organic' : Generic organic
 *   - 'direct'  : Direct traffic
 *   - 'unknown' : Unknown source
 */
export const AD_PLATFORMS = [
  'google',
  'microsoft',
  'google_organic',
  'microsoft_organic',
  'facebook',
  'organic',
  'direct',
  'unknown',
] as const;

export type AdPlatform = typeof AD_PLATFORMS[number];

/**
 * Raw attribution input (from session lookup or request body)
 * Uses camelCase (TypeScript convention)
 */
export interface AttributionInput {
  // Click IDs (from lookup or body)
  lookupGclid?: string | null;
  lookupMsclkid?: string | null;
  bodyGclid?: string | null;
  bodyMsclkid?: string | null;

  // UTM parameters (from lookup)
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  utmContent?: string | null;
}

/**
 * Finalized attribution output (for RPC payload)
 * Uses snake_case (database convention)
 */
export interface AttributionOutput {
  gclid: string | null;
  msclkid: string | null;
  ad_platform: AdPlatform | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Normalize click ID: empty/whitespace strings become null
 * Prevents storing "" in database when we want NULL
 */
export function normalizeClickId(value: string | null | undefined): string | null {
  if (!value || value.trim() === '') return null;
  return value.trim();
}

/**
 * Derive ad_platform from click IDs and UTM source
 *
 * PRECEDENCE (highest to lowest):
 * 1. gclid present → 'google' (paid Google Ads)
 * 2. msclkid present → 'microsoft' (paid Microsoft Ads)
 * 3. utm_source mapping (organic traffic):
 *    - 'google' → 'google_organic'
 *    - 'bing' → 'microsoft_organic'
 *    - 'facebook' → 'facebook'
 * 4. null (unknown/direct)
 *
 * NOTE: email, referral, direct, twitter, linkedin, instagram → null
 * These are valid traffic sources but not "ad platforms"
 */
export function deriveAdPlatform(
  gclid: string | null,
  msclkid: string | null,
  utmSource: string | null | undefined
): AdPlatform | null {
  // Paid traffic takes precedence
  if (gclid) return 'google';
  if (msclkid) return 'microsoft';

  // Organic traffic mapping (only for known sources)
  if (utmSource) {
    const src = utmSource.toLowerCase();
    if (isKnownUtmSource(src)) {
      switch (src) {
        case 'google': return 'google_organic';
        case 'bing': return 'microsoft_organic';
        case 'facebook': return 'facebook';
        // email, referral, direct, twitter, linkedin, instagram → null
        // These are traffic sources, not ad platforms
      }
    }
  }

  return null;
}

/**
 * Build finalized attribution from raw inputs
 *
 * SOURCE OF TRUTH ORDER:
 * 1. Session lookup (recorded at landing, can't be spoofed)
 * 2. Request body (fallback if lookup returns null)
 *
 * This prevents clients from spoofing attribution by sending
 * fake gclid/msclkid when the session already has different values.
 */
export function buildAttribution(input: AttributionInput): AttributionOutput {
  // Normalize and apply source-of-truth precedence
  // Lookup wins over body (prevents spoofing)
  const finalGclid = normalizeClickId(input.lookupGclid) ?? normalizeClickId(input.bodyGclid);
  const finalMsclkid = normalizeClickId(input.lookupMsclkid) ?? normalizeClickId(input.bodyMsclkid);

  // Derive platform from finalized click IDs
  const adPlatform = deriveAdPlatform(finalGclid, finalMsclkid, input.utmSource);

  return {
    gclid: finalGclid,
    msclkid: finalMsclkid,
    ad_platform: adPlatform,
    utm_source: input.utmSource ?? null,
    utm_medium: input.utmMedium ?? null,
    utm_campaign: input.utmCampaign ?? null,
    utm_term: input.utmTerm ?? null,
    utm_content: input.utmContent ?? null,
  };
}

/**
 * Type guard to check if a string is a valid AdPlatform
 */
export function isValidAdPlatform(value: string): value is AdPlatform {
  return AD_PLATFORMS.includes(value as AdPlatform);
}
