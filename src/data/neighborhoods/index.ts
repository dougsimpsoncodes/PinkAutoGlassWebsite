export type { Neighborhood } from './types';

import type { Neighborhood } from './types';
import { denverNeighborhoods } from './denver';
import { auroraNeighborhoods } from './aurora';
import { lakewoodNeighborhoods } from './lakewood';
import { boulderNeighborhoods } from './boulder';
import { fortCollinsNeighborhoods } from './fort-collins';
import { coloradoSpringsNeighborhoods } from './colorado-springs';

export const allNeighborhoods: Neighborhood[] = [
  ...denverNeighborhoods,
  ...auroraNeighborhoods,
  ...lakewoodNeighborhoods,
  ...boulderNeighborhoods,
  ...fortCollinsNeighborhoods,
  ...coloradoSpringsNeighborhoods,
];

export function getNeighborhoodsByCity(citySlug: string): Neighborhood[] {
  return allNeighborhoods.filter((n) => n.citySlug === citySlug);
}

export function getNeighborhood(citySlug: string, slug: string): Neighborhood | undefined {
  return allNeighborhoods.find((n) => n.citySlug === citySlug && n.slug === slug);
}

export function getCitySlugsWithNeighborhoods(): string[] {
  return Array.from(new Set(allNeighborhoods.map((n) => n.citySlug)));
}
