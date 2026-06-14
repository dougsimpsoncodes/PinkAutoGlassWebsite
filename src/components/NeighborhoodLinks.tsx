import Link from 'next/link';
import { getNeighborhoodsByCity } from '@/data/neighborhoods';

interface Props {
  /** Data citySlug, e.g. "denver" or "aurora" */
  citySlug: string;
  /**
   * URL prefix for the city's pages, WITHOUT trailing slash. Each neighborhood
   * link becomes `${basePath}/${slug}`. Defaults to the franchise path
   * "/colorado/<citySlug>"; franchise city pages may pass it explicitly.
   */
  basePath?: string;
  /** Optional extra classes on the grid wrapper */
  className?: string;
}

/**
 * Renders a grid of internal links to every neighborhood page for a city.
 *
 * SEO purpose: the neighborhood pages were orphaned — no authoritative page
 * linked into them, so Google crawled and declined to index them ("Crawled -
 * currently not indexed"). This injects real internal links from the indexed
 * city page into the neighborhood cluster. URLs are derived from the
 * neighborhood data + the page's own basePath so they always match the
 * canonical route (franchise /colorado/* or legacy /locations/*).
 *
 * Renders only the link grid (no heading/section) so it drops into each city
 * page's existing "Neighborhoods We Serve" section.
 */
export default function NeighborhoodLinks({ citySlug, basePath, className = '' }: Props) {
  const neighborhoods = getNeighborhoodsByCity(citySlug);
  if (neighborhoods.length === 0) return null;

  const prefix = basePath ?? `/colorado/${citySlug}`;

  return (
    <div className={`grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 ${className}`}>
      {neighborhoods.map((n) => (
        <Link
          key={n.slug}
          href={`${prefix}/${n.slug}`}
          className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors font-medium text-gray-700 hover:text-pink-700"
        >
          {n.name}
        </Link>
      ))}
    </div>
  );
}
