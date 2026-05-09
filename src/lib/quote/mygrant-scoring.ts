import type { MygrantResponseItem } from '@/lib/mygrant/client';

export type MygrantWindshieldConfidence = 'high' | 'medium' | 'low';

export interface ScoredMygrantCandidate {
  item: MygrantResponseItem;
  score: number;
  reasons: string[];
  warnings: string[];
  nagsKey: string;
  isPrimaryWindshield: boolean;
  hasCustomerPrice: boolean;
  isAvailable: boolean;
}

export interface MygrantWindshieldSelection {
  selectedPart?: MygrantResponseItem;
  confidence: MygrantWindshieldConfidence;
  reasons: string[];
  rankedCandidates: ScoredMygrantCandidate[];
}

const WINDSHIELD_PREFIXES = new Set(['DW', 'FW', 'WS']);
const STRONG_WINDSHIELD_PREFIXES = new Set(['DW', 'FW']);
const WINDSHIELD_TERMS = ['windshield', 'w/shield', 'w/s', 'windscreen'];
const ACCESSORY_TERMS = [
  'adhesive',
  'clip',
  'clips',
  'dam',
  'gasket',
  'kit',
  'molding',
  'moulding',
  'retainer',
  'seal',
  'sensor pad',
  'side moulding',
  'urethane',
];
const NON_WINDSHIELD_GLASS_TERMS = [
  'back glass',
  'door glass',
  'quarter glass',
  'rear glass',
  'vent glass',
];

export function evaluateMygrantWindshieldCandidates(items: MygrantResponseItem[]): MygrantWindshieldSelection {
  const rankedCandidates = items
    .map(scoreMygrantWindshieldCandidate)
    .filter(candidate => candidate.isPrimaryWindshield || candidate.score > 0)
    .sort(compareCandidates);

  if (rankedCandidates.length === 0) {
    return {
      confidence: 'low',
      reasons: ['no_windshield_candidates'],
      rankedCandidates: [],
    };
  }

  const primaryCandidates = rankedCandidates.filter(candidate => candidate.isPrimaryWindshield);
  const priceableCandidates = primaryCandidates.filter(candidate => candidate.hasCustomerPrice);
  if (priceableCandidates.length === 0) {
    return {
      selectedPart: primaryCandidates[0]?.item,
      confidence: 'low',
      reasons: ['no_priceable_windshield_candidate', ...(primaryCandidates[0]?.warnings || [])],
      rankedCandidates,
    };
  }

  const availableCandidates = priceableCandidates.filter(candidate => candidate.isAvailable);
  if (availableCandidates.length === 0) {
    return {
      selectedPart: priceableCandidates[0].item,
      confidence: 'medium',
      reasons: ['no_available_windshield_candidate', ...priceableCandidates[0].warnings],
      rankedCandidates,
    };
  }

  const selected = availableCandidates[0];
  const competingDifferentNags = availableCandidates.find(candidate => (
    candidate.item !== selected.item
    && candidate.nagsKey !== selected.nagsKey
    && selected.score - candidate.score < 20
  ));

  if (competingDifferentNags) {
    return {
      selectedPart: selected.item,
      confidence: 'medium',
      reasons: [
        'ambiguous_multiple_windshield_candidates',
        `selected_${selected.nagsKey || 'unknown_nags'}`,
        `competes_with_${competingDifferentNags.nagsKey || 'unknown_nags'}`,
        ...selected.warnings,
      ],
      rankedCandidates,
    };
  }

  const confidence: MygrantWindshieldConfidence = selected.score >= 115 && selected.warnings.length === 0
    ? 'high'
    : 'medium';

  return {
    selectedPart: selected.item,
    confidence,
    reasons: [
      confidence === 'high' ? 'high_confidence_single_available_windshield' : 'windshield_candidate_needs_confirmation',
      `selected_${selected.nagsKey || 'unknown_nags'}`,
      ...selected.reasons,
      ...selected.warnings,
    ],
    rankedCandidates,
  };
}

export function publicScoredMygrantCandidate(candidate: ScoredMygrantCandidate) {
  return {
    score: candidate.score,
    confidenceSignals: candidate.reasons,
    warnings: candidate.warnings,
    nagsKey: candidate.nagsKey || null,
    productType: candidate.item.productType,
    part: candidate.item.part,
    partDesc: candidate.item.partDesc,
    brand: candidate.item.brand,
    productId: candidate.item.productId,
    qtyAvailable: candidate.item.qtyAvailable,
    customerUnitPrice: candidate.item.customerUnitPrice,
    listUnitPrice: candidate.item.listUnitPrice,
    shipFromBranchName: candidate.item.shipFromBranchName,
    estimatedDeliveryDate: candidate.item.estimatedDeliveryDate,
    estimatedDeliveryTime: candidate.item.estimatedDeliveryTime,
  };
}

function scoreMygrantWindshieldCandidate(item: MygrantResponseItem): ScoredMygrantCandidate {
  let score = 0;
  const reasons: string[] = [];
  const warnings: string[] = [];
  const prefix = normalize(item.nagsPrefix).toUpperCase();
  const descriptor = descriptorFor(item);
  const nagsKey = [prefix, item.nagsNumber].filter(Boolean).join('');
  const hasWindshieldTerm = WINDSHIELD_TERMS.some(term => descriptor.includes(term));
  const hasAccessoryTerm = ACCESSORY_TERMS.some(term => descriptor.includes(term));
  const hasNonWindshieldGlassTerm = NON_WINDSHIELD_GLASS_TERMS.some(term => descriptor.includes(term));
  const hasStrongPrefix = STRONG_WINDSHIELD_PREFIXES.has(prefix);
  const hasWindshieldPrefix = WINDSHIELD_PREFIXES.has(prefix);
  const hasCustomerPrice = Number.isFinite(item.customerUnitPrice) && Number(item.customerUnitPrice) > 0;
  const isAvailable = Number.isFinite(item.qtyAvailable) && Number(item.qtyAvailable) > 0;

  if (hasStrongPrefix) {
    score += 80;
    reasons.push('strong_windshield_nags_prefix');
  } else if (hasWindshieldPrefix) {
    score += 60;
    reasons.push('possible_windshield_nags_prefix');
  }

  if (hasWindshieldTerm) {
    score += 35;
    reasons.push('windshield_description');
  }

  if (descriptor.includes('glass')) {
    score += 10;
    reasons.push('glass_description');
  }

  if (hasCustomerPrice) {
    score += 25;
    reasons.push('customer_price_available');
  } else {
    score -= 60;
    warnings.push('missing_customer_unit_price');
  }

  if (isAvailable) {
    score += 15;
    reasons.push('inventory_available');
  } else {
    score -= 25;
    warnings.push('inventory_not_available');
  }

  if (item.shipFromBranchId || item.shipFromBranchName) {
    score += 5;
    reasons.push('branch_available');
  }

  if (hasAccessoryTerm && !hasStrongPrefix) {
    score -= 70;
    warnings.push('accessory_like_description');
  } else if (hasAccessoryTerm) {
    score -= 15;
    warnings.push('windshield_has_accessory_term');
  }

  if (hasNonWindshieldGlassTerm) {
    score -= 80;
    warnings.push('non_windshield_glass_description');
  }

  const isPrimaryWindshield = (hasWindshieldPrefix || hasWindshieldTerm)
    && !hasNonWindshieldGlassTerm
    && !(hasAccessoryTerm && !hasStrongPrefix && !hasWindshieldTerm);

  return {
    item,
    score,
    reasons,
    warnings,
    nagsKey,
    isPrimaryWindshield,
    hasCustomerPrice,
    isAvailable,
  };
}

function compareCandidates(a: ScoredMygrantCandidate, b: ScoredMygrantCandidate): number {
  if (a.score !== b.score) return b.score - a.score;
  if (a.isAvailable !== b.isAvailable) return a.isAvailable ? -1 : 1;
  const aPrice = a.item.customerUnitPrice || a.item.listUnitPrice || Number.MAX_SAFE_INTEGER;
  const bPrice = b.item.customerUnitPrice || b.item.listUnitPrice || Number.MAX_SAFE_INTEGER;
  return aPrice - bPrice;
}

function descriptorFor(item: MygrantResponseItem): string {
  return [
    item.productType,
    item.partDesc,
    item.part,
    item.nagsPrefix,
    item.notes,
  ].filter(Boolean).join(' ').toLowerCase();
}

function normalize(value?: string): string {
  return (value || '').trim();
}
