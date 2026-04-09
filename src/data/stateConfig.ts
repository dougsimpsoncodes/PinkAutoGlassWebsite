export interface StateConfig {
  slug: 'colorado' | 'arizona';
  name: string;
  abbreviation: string;
  phone: string;
  phoneE164: string;
  legalContext: string;
  zeroDedLaw: string | null; // ARS citation for AZ, null for CO
  metroLabel: string;
  cityLinkPrefix: string; // e.g., '/colorado/' or '/arizona/'
  serviceLinkPrefix: string;
  insuranceLinkPrefix: string;
}

export const stateConfigs: Record<string, StateConfig> = {
  colorado: {
    slug: 'colorado',
    name: 'Colorado',
    abbreviation: 'CO',
    phone: '(720) 918-7465',
    phoneE164: '+17209187465',
    legalContext: 'Colorado insurance regulations strongly encourage carriers to waive glass deductibles. Most major insurers offer zero-deductible glass coverage as standard or low-cost add-on.',
    zeroDedLaw: null,
    metroLabel: 'Colorado Front Range',
    cityLinkPrefix: '/colorado/',
    serviceLinkPrefix: '/colorado/services/',
    insuranceLinkPrefix: '/colorado/insurance/',
  },
  arizona: {
    slug: 'arizona',
    name: 'Arizona',
    abbreviation: 'AZ',
    phone: '(480) 712-7465',
    phoneE164: '+14807127465',
    legalContext: 'Arizona law (ARS § 20-264) requires every insurer offering comprehensive coverage to include full glass replacement with zero deductible. Your rates cannot increase for filing a glass claim (ARS § 20-263).',
    zeroDedLaw: 'ARS § 20-264',
    metroLabel: 'Phoenix AZ Metro',
    cityLinkPrefix: '/arizona/',
    serviceLinkPrefix: '/arizona/services/',
    insuranceLinkPrefix: '/arizona/insurance/',
  },
};

export function getStateConfig(state: string): StateConfig | undefined {
  return stateConfigs[state.toLowerCase()];
}

export function getStateByAbbreviation(abbr: string): StateConfig | undefined {
  return Object.values(stateConfigs).find(s => s.abbreviation === abbr.toUpperCase());
}
