/**
 * NAGS interchangeable compatibility filter.
 *
 * AutoBolt returns a primary NAGS for a VIN plus a set of interchangeable
 * parts that fit the same vehicle. Most cheaper alternatives differ from
 * the OEM only in branding (logo in the third visor frit) — purely cosmetic.
 * Some legitimately differ in features that affect fitment: ADAS sensor
 * support, acoustic laminate, heated wiper park, solar coating, HUD.
 *
 * This module decides whether a candidate interchangeable can substitute
 * for the primary without downgrading the customer's actual driving
 * experience. Per the 2026-05-27 council review (Codex + Gemini both
 * voted (A) with the caveat: "interchangeables can hide real fitment
 * nuance"), we keep this conservative: only purely-cosmetic differences
 * are tolerated.
 */

export interface FeatureLike {
  name?: string;
}

/**
 * Feature names that AutoBolt returns which are purely cosmetic and can be
 * safely dropped on an interchangeable substitute. Matches case-insensitive
 * substring; covers any brand's logo/grille variant ("Jeep Grille in Third
 * Visor Frit", "Ford Logo in Third Visor Frit", etc.).
 *
 * Anything else is treated as FUNCTIONAL and must be preserved. This
 * direction (whitelist what's safe to drop) is intentionally conservative
 * — adding to the cosmetic list requires a deliberate decision; new
 * functional features default to "must be preserved" without code changes.
 */
const COSMETIC_FEATURE_PATTERNS = [
  /logo/i,
  /grille/i,
] as const;

export function isCosmeticFeature(name: string | undefined): boolean {
  if (!name) return false;
  return COSMETIC_FEATURE_PATTERNS.some(pattern => pattern.test(name));
}

/**
 * Pull the names of features that materially affect fitment from a raw
 * features array (drops cosmetic ones).
 */
export function getFunctionalFeatureNames(features: ReadonlyArray<FeatureLike> | undefined): string[] {
  if (!features || features.length === 0) return [];
  const out: string[] = [];
  for (const f of features) {
    if (!f?.name) continue;
    if (isCosmeticFeature(f.name)) continue;
    out.push(f.name);
  }
  return out;
}

export interface CompatibilityCheck {
  compatible: boolean;
  /** Features the primary needed that the candidate doesn't provide. Empty when compatible. */
  missingFunctionalFeatures: string[];
  /** Cosmetic features the candidate lacks. Informational; doesn't block. */
  missingCosmeticFeatures: string[];
}

/**
 * Returns true when a candidate's feature set is a functional superset of the
 * primary's. The candidate may have additional features (irrelevant) or lack
 * cosmetic features (intentionally tolerated). It must NOT lack any functional
 * feature the primary provides.
 *
 * Empty primary features → trivially compatible (no constraints to violate).
 */
export function checkCompatibility(
  primary: ReadonlyArray<FeatureLike> | undefined,
  candidate: ReadonlyArray<FeatureLike> | undefined
): CompatibilityCheck {
  const primaryFunctional = getFunctionalFeatureNames(primary);
  const candidateFunctionalSet = new Set(getFunctionalFeatureNames(candidate));
  const missingFunctionalFeatures = primaryFunctional.filter(f => !candidateFunctionalSet.has(f));

  const primaryCosmetic = (primary ?? []).map(f => f?.name).filter((n): n is string => !!n && isCosmeticFeature(n));
  const candidateCosmeticSet = new Set((candidate ?? []).map(f => f?.name).filter((n): n is string => !!n && isCosmeticFeature(n)));
  const missingCosmeticFeatures = primaryCosmetic.filter(f => !candidateCosmeticSet.has(f));

  return {
    compatible: missingFunctionalFeatures.length === 0,
    missingFunctionalFeatures,
    missingCosmeticFeatures,
  };
}

/**
 * Extracts a NAGS prefix/number pair from an AutoBolt amNumber string.
 * Format examples: "DW01881GTNN" → { prefix: "DW", number: "01881" }.
 * Strips trailing alpha tags (G, T, NN, GBNN, GTNN, etc.) — those identify
 * the manufacturer/feature variant within a NAGS, not the NAGS itself.
 *
 * Returns null when the amNumber doesn't match the expected NAGS pattern.
 */
export function parseAmNumberToNags(amNumber: string | undefined | null): { prefix: string; number: string } | null {
  if (!amNumber) return null;
  const cleaned = amNumber.trim().toUpperCase().replace(/[\s\-_]+/g, '');
  // NAGS pattern: 2-3 letter prefix + 4-6 digit number, optionally followed
  // by manufacturer/feature suffix codes (G, T, N, B, NN, etc.).
  const match = /^([A-Z]{1,4})(\d{4,6})/.exec(cleaned);
  if (!match) return null;
  return { prefix: match[1], number: match[2] };
}
