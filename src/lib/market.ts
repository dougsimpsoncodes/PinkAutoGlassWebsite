export type Market = 'arizona' | 'colorado';
export type MarketFilter = Market | 'all';

export const COLORADO_PHONE = '+17209187465';
export const ARIZONA_PHONE = '+14807127465';

export const COLORADO_SATELLITE_SOURCES = [
  'windshieldcostcalculator',
  'windshielddenver',
  'chiprepairdenver',
  'chiprepairboulder',
  'aurorawindshield',
  'mobilewindshielddenver',
  'cheapestwindshield',
  'newwindshieldcost',
  'getawindshieldquote',
  'newwindshieldnearme',
  'windshieldpricecompare',
  'coloradospringswindshield',
  'autoglasscoloradosprings',
  'mobilewindshieldcoloradosprings',
  'windshieldreplacementfortcollins',
] as const;

export const ARIZONA_SATELLITE_SOURCES = [
  'chiprepairmesa',
  'chiprepairphoenix',
  'chiprepairscottsdale',
  'chiprepairtempe',
  'windshieldcostphoenix',
  'mobilewindshieldphoenix',
] as const;

const COLORADO_PHONE_DIGITS = '17209187465';
const ARIZONA_PHONE_DIGITS = '14807127465';

// Full CO zip prefix range: 800-816 (Denver metro through mountain towns, Pueblo, Grand Junction)
const COLORADO_ZIP_PREFIXES = new Set([
  '800', '801', '802', '803', '804', '805', '806', '807', '808', '809',
  '810', '811', '812', '813', '814', '815', '816',
]);
// Full AZ zip prefix range: 850-865 (Phoenix metro through Tucson, Flagstaff, eastern AZ)
const ARIZONA_ZIP_PREFIXES = new Set([
  '850', '851', '852', '853', '854', '855', '856', '857',
  '859', '860', '863', '864', '865',
]);

const COLORADO_CAMPAIGN_PATTERNS = [
  /\bdenver\b/i,
  /\bboulder\b/i,
  /\baurora\b/i,
  /\bfort collins\b/i,
  /\bcolorado\b/i, // covers "colorado springs" too — no need for a separate pattern
  /\bco\b/i,
];

const ARIZONA_CAMPAIGN_PATTERNS = [
  /\bphoenix\b/i,
  /\bscottsdale\b/i,
  /\bmesa\b/i,
  /\btempe\b/i,
  /\barizona\b/i,
  /\baz\b/i,
];

function normalizeZipPrefix(zip?: string | null): string | null {
  if (!zip) return null;
  const digits = zip.replace(/\D/g, '');
  if (digits.length < 3) return null;
  return digits.slice(0, 3);
}

export function normalizePhoneDigits(value?: string | null): string | null {
  if (!value) return null;

  const digits = value.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10) return `1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return digits;

  return digits;
}

export function isMarketFilter(value: string | null | undefined): value is MarketFilter {
  return value === 'all' || value === 'arizona' || value === 'colorado';
}

export function getMarketFromPath(pathname: string | null | undefined): Market | null {
  if (!pathname) return null;

  const path = pathname.toLowerCase();
  if (path.includes('/phoenix') || path.includes('-az') || path.includes('/arizona')) return 'arizona';
  if (
    path.includes('/denver') ||
    path.includes('/boulder') ||
    path.includes('/aurora') ||
    path.includes('/colorado-springs') ||
    path.includes('/colorado') ||
    path.includes('-co')
  ) {
    return 'colorado';
  }

  return null;
}

export function resolveMarket(pathname?: string | null): Market {
  return getMarketFromPath(pathname) || 'colorado';
}

export function getPhoneForMarket(market: Market) {
  if (market === 'arizona') {
    return {
      phoneNumber: '4807127465',
      phoneE164: ARIZONA_PHONE,
      displayPhone: '(480) 712-7465',
    };
  }

  return {
    phoneNumber: '7209187465',
    phoneE164: COLORADO_PHONE,
    displayPhone: '(720) 918-7465',
  };
}

export function classifyLeadMarket(lead: {
  state?: string | null;
  zip?: string | null;
  utm_source?: string | null;
}): Market | null {
  const state = lead.state?.trim().toUpperCase();
  // Handle both abbreviations and full state names
  if (state === 'CO' || state === 'COLORADO') return 'colorado';
  if (state === 'AZ' || state === 'ARIZONA') return 'arizona';

  const zipPrefix = normalizeZipPrefix(lead.zip);
  if (zipPrefix && COLORADO_ZIP_PREFIXES.has(zipPrefix)) return 'colorado';
  if (zipPrefix && ARIZONA_ZIP_PREFIXES.has(zipPrefix)) return 'arizona';

  const utmSource = lead.utm_source?.trim().toLowerCase();
  if (!utmSource) return null;
  if (COLORADO_SATELLITE_SOURCES.some(source => utmSource.includes(source))) return 'colorado';
  if (ARIZONA_SATELLITE_SOURCES.some(source => utmSource.includes(source))) return 'arizona';

  return null;
}

export function classifyCallMarket(toNumber?: string | null): Market | null {
  const digits = normalizePhoneDigits(toNumber);
  if (digits === COLORADO_PHONE_DIGITS) return 'colorado';
  if (digits === ARIZONA_PHONE_DIGITS) return 'arizona';
  return null;
}

export function classifyCampaignMarket(campaignName?: string | null): Market | null {
  if (!campaignName) return null;

  const isColorado = COLORADO_CAMPAIGN_PATTERNS.some(pattern => pattern.test(campaignName));
  const isArizona = ARIZONA_CAMPAIGN_PATTERNS.some(pattern => pattern.test(campaignName));

  // Dual-market match → unclassified (excluded from market-specific spend)
  if (isColorado && isArizona) {
    console.warn(`[market] Campaign "${campaignName}" matches both CO and AZ patterns — excluded from market-specific spend`);
    return null;
  }
  // No explicit market match → default to Colorado (Denver)
  // All current campaigns are Denver-only; Phoenix campaigns will be named with "phoenix" when created
  if (!isColorado && !isArizona) return 'colorado';
  return isColorado ? 'colorado' : 'arizona';
}

function normalizeHostname(value?: string | null): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return parsed.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}

function matchSatelliteHost(host: string): Market | null {
  if (COLORADO_SATELLITE_SOURCES.some(s => host.includes(s))) return 'colorado';
  if (ARIZONA_SATELLITE_SOURCES.some(s => host.includes(s))) return 'arizona';
  return null;
}

function matchSatelliteSource(value: string): Market | null {
  if (COLORADO_SATELLITE_SOURCES.some(s => value.includes(s))) return 'colorado';
  if (ARIZONA_SATELLITE_SOURCES.some(s => value.includes(s))) return 'arizona';
  return null;
}

/**
 * Classify which market produced a website session.
 * Used by /api/admin/analytics to filter session/page-view/conversion data
 * by market when the admin toggle is set.
 *
 * Precedence (strongest signal first):
 *   1. utm_campaign via classifyCampaignMarket() — paid attribution authoritative when present
 *   2. utm_source matches a known satellite source — explicit satellite traffic
 *   3. referrer hostname matches a known satellite host — organic-from-satellite
 *   4. landing_page via getMarketFromPath() — content/SEO market signal
 *
 * Returns null when no signal classifies the session (paid traffic without a
 * market-bearing campaign name, generic organic searches, ChatGPT, direct, etc).
 * Callers should hide null-market sessions when a specific market is selected,
 * and bucket them under their computed source name when "all" is selected.
 *
 * Note: this is a content-vs-acquisition signal mix. Landing page reflects
 * which content the visitor saw, not which market they came from. For
 * pure-acquisition analytics, prefer the campaign / utm / referrer signals.
 */
export function classifySessionMarket(session: {
  utm_campaign?: string | null;
  utm_source?: string | null;
  referrer?: string | null;
  landing_page?: string | null;
}): Market | null {
  // 1. utm_campaign — paid attribution wins when explicitly market-bearing
  const utmCampaign = session.utm_campaign?.trim();
  if (utmCampaign) {
    // Use a stricter regex check here than classifyCampaignMarket's
    // "default to colorado" behavior, which is appropriate for ad-spend
    // attribution but would over-claim Denver for organic sessions.
    const isColorado = COLORADO_CAMPAIGN_PATTERNS.some(p => p.test(utmCampaign));
    const isArizona = ARIZONA_CAMPAIGN_PATTERNS.some(p => p.test(utmCampaign));
    if (isColorado && !isArizona) return 'colorado';
    if (isArizona && !isColorado) return 'arizona';
    // Dual or no match → fall through to next signal
  }

  // 2. utm_source — explicit satellite tagging
  const utmSource = session.utm_source?.trim().toLowerCase();
  if (utmSource) {
    const m = matchSatelliteSource(utmSource);
    if (m) return m;
  }

  // 3. Referrer hostname — organic-from-satellite click-throughs
  const referrerHost = normalizeHostname(session.referrer);
  if (referrerHost) {
    const m = matchSatelliteHost(referrerHost);
    if (m) return m;
  }

  // 4. Landing page path — content-market signal (organic, direct)
  const fromPath = getMarketFromPath(session.landing_page);
  if (fromPath) return fromPath;

  return null;
}
