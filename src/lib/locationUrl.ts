/**
 * Convert a legacy location slug (e.g. "denver-co", "phoenix-az") to its
 * canonical franchise path ("/colorado/denver", "/arizona/phoenix").
 *
 * Used by components/data that still carry the old "{city}-{state}" slug shape
 * so their internal links point straight at the franchise URL instead of
 * relying on a 301 hop.
 */
export function franchiseLocationPath(slug: string): string {
  if (slug.endsWith('-az')) return `/arizona/${slug.slice(0, -3)}`;
  if (slug.endsWith('-co')) return `/colorado/${slug.slice(0, -3)}`;
  return `/colorado/${slug}`;
}
