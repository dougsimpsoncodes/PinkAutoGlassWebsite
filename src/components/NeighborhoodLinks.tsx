import Link from 'next/link';
import { getNeighborhoodsByCity } from '@/data/neighborhoods';

interface Props {
  /** Data citySlug, e.g. "aurora" (NOT the URL folder "aurora-co") */
  citySlug: string;
  /** Optional extra classes on the grid wrapper */
  className?: string;
}

/**
 * Renders a grid of internal links to every neighborhood page for a city.
 *
 * SEO purpose: the neighborhood pages (/locations/{city}-co/{slug}) were
 * orphaned — no authoritative page linked into them, so Google crawled and
 * declined to index them ("Crawled - currently not indexed"). This injects
 * real internal links from the indexed city page into the neighborhood
 * cluster, giving Google a reason to index them. URLs are derived from the
 * neighborhood data so they always match the actual routes.
 *
 * Renders only the link grid (no heading/section) so it can drop into each
 * city page's existing "Neighborhoods We Serve" section, preserving that
 * page's heading and CTA copy.
 */
export default function NeighborhoodLinks({ citySlug, className = '' }: Props) {
  const neighborhoods = getNeighborhoodsByCity(citySlug);
  if (neighborhoods.length === 0) return null;

  const cityFolder = `${citySlug}-co`;

  return (
    <div className={`grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 ${className}`}>
      {neighborhoods.map((n) => (
        <Link
          key={n.slug}
          href={`/locations/${cityFolder}/${n.slug}`}
          className="bg-white border border-gray-200 rounded p-3 text-center hover:bg-pink-50 hover:border-pink-300 transition-colors font-medium text-gray-700 hover:text-pink-700"
        >
          {n.name}
        </Link>
      ))}
    </div>
  );
}
