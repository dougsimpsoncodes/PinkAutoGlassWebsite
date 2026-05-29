/**
 * ZIP → city resolver for booking enrichment.
 *
 * Auto-quoter customers enter street + ZIP. The booking flow uses this to
 * populate `install_city` server-side so the customer never has to type it
 * (one less form field, less abandonment) and operator-facing surfaces
 * (team alerts, admin dashboard, technician dispatch) get a real city name
 * instead of just "AZ 85258".
 *
 * Uses zippopotam.us — free, no API key, US-ZIP friendly. Originally
 * targeted Google Geocoding via GOOGLE_MAPS_API_KEY but that requires
 * enabling the Geocoding API on the GCP project; zippopotam removes the
 * Cloud Console dependency entirely.
 *
 * Results are cached in-process (Map) since ZIP→city is stable. The
 * function NEVER throws — on any error (timeout, network, ambiguous
 * response) it returns null and the caller falls back to a blank city.
 *
 * Council reco 2026-05-28 (Codex + Gemini unanimous): reverse-lookup,
 * not a manual City field. Don't add form friction; derive server-side.
 */

const cache = new Map<string, string | null>();
const LOOKUP_TIMEOUT_MS = 2500;

function timeout<T>(ms: number, p: Promise<T>): Promise<T | null> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      () => { clearTimeout(t); resolve(null); }
    );
  });
}

interface ZippopotamPlace {
  'place name'?: string;
  'state abbreviation'?: string;
}

interface ZippopotamResponse {
  'post code'?: string;
  places?: ZippopotamPlace[];
}

/**
 * Return the city name for a US ZIP code, or null if it can't be resolved.
 * 5-digit ZIPs are normalized first (anything after a hyphen is dropped).
 */
export async function lookupCityFromZip(zip: string | null | undefined): Promise<string | null> {
  if (!zip) return null;
  const normalized = zip.trim().split('-')[0];
  if (!/^\d{5}$/.test(normalized)) return null;

  if (cache.has(normalized)) return cache.get(normalized) ?? null;

  const url = `https://api.zippopotam.us/us/${normalized}`;

  try {
    const result = await timeout(LOOKUP_TIMEOUT_MS, (async () => {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      // 404 = ZIP not found; everything else short-circuits to null below.
      if (!res.ok) return null;
      const body = (await res.json()) as ZippopotamResponse;
      const first = body.places?.[0];
      const name = first?.['place name'];
      return name && typeof name === 'string' ? name : null;
    })());

    cache.set(normalized, result);
    return result;
  } catch {
    cache.set(normalized, null);
    return null;
  }
}
