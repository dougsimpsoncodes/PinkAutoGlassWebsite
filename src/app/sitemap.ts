import { MetadataRoute } from 'next';
import { getAllVehicleSlugs, getAllMakes } from '@/data/makes-models';
import { getAllBlogPosts } from '@/data/blog';
import { allNeighborhoods } from '@/data/neighborhoods';

/**
 * Franchise URL structure (2026-06-14 migration).
 * Old /locations, /services, /insurance, /phoenix URLs 301-redirect to the
 * /colorado/* and /arizona/* equivalents (see next.config.js franchiseRedirects),
 * so the sitemap must list ONLY the canonical franchise URLs.
 *
 * One exception still lives on the old structure because its franchise page
 * doesn't exist yet (kept canonical via a reverse redirect, not cannibalizing):
 *   - /services/adas-calibration
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pinkautoglass.com';
  const now = new Date();
  const azDate = new Date('2026-02-22');

  // CO cities with a live /colorado/<city> page
  const CO_CITIES = [
    'arvada', 'aurora', 'black-forest', 'boulder', 'brighton', 'broomfield', 'castle-rock',
    'centennial', 'cherry-hills-village', 'colorado-springs', 'commerce-city',
    'denver', 'englewood', 'erie', 'evergreen', 'federal-heights', 'firestone',
    'fort-collins', 'fountain', 'frederick', 'golden', 'greeley',
    'greenwood-village', 'highlands-ranch', 'johnstown', 'lafayette', 'lakewood',
    'littleton', 'lone-tree', 'longmont', 'louisville', 'loveland',
    'manitou-springs', 'northglenn', 'parker', 'security-widefield', 'sheridan',
    'superior', 'thornton', 'timnath', 'wellington', 'westminster', 'wheat-ridge',
    'windsor',
  ];
  const AZ_CITIES = [
    'phoenix', 'scottsdale', 'tempe', 'mesa', 'chandler', 'gilbert', 'glendale',
    'peoria', 'surprise', 'goodyear', 'avondale', 'buckeye', 'fountain-hills',
    'queen-creek', 'apache-junction', 'cave-creek', 'maricopa', 'el-mirage',
    'litchfield-park', 'ahwatukee',
  ];
  const CO_SERVICES = [
    'windshield-replacement', 'windshield-repair', 'mobile-service',
    'insurance-claims', 'emergency-windshield-repair',
  ];
  const AZ_SERVICES = [
    'windshield-replacement', 'windshield-repair', 'adas-calibration',
    'mobile-service', 'insurance-claims', 'emergency-windshield-repair',
  ];
  const INSURANCE_CARRIERS = [
    'progressive', 'aaa', 'allstate', 'geico', 'esurance', 'state-farm',
    'usaa', 'farmers', 'safeco', 'liberty-mutual',
  ];
  const HIGH_INTENT = [
    'pricing', 'insurance-coverage-guide', 'how-long-windshield-replacement',
    'adas-calibration-cost',
  ];

  // Global pages (no state prefix)
  const pages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/book`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/vehicles`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/careers`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/sitemap`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  // State hubs
  const hubs: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/colorado`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/arizona`, lastModified: azDate, changeFrequency: 'weekly', priority: 0.95 },
  ];

  // CO service pages (+ index). ADAS stays on the old URL (no franchise page yet).
  const coServices: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/colorado/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    ...CO_SERVICES.map((s) => ({
      url: `${baseUrl}/colorado/services/${s}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    })),
    { url: `${baseUrl}/services/adas-calibration`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
  ];

  // AZ service pages (+ index)
  const azServices: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/arizona/services`, lastModified: azDate, changeFrequency: 'weekly', priority: 0.8 },
    ...AZ_SERVICES.map((s) => ({
      url: `${baseUrl}/arizona/services/${s}`,
      lastModified: azDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];

  // CO location pages
  const coLocations: MetadataRoute.Sitemap = CO_CITIES.map((c) => ({
    url: `${baseUrl}/colorado/${c}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: c === 'denver' ? 0.9 : 0.8,
  }));

  // AZ location pages
  const azLocations: MetadataRoute.Sitemap = AZ_CITIES.map((c) => ({
    url: `${baseUrl}/arizona/${c}`,
    lastModified: azDate,
    changeFrequency: 'weekly' as const,
    priority: c === 'phoenix' ? 0.9 : 0.8,
  }));

  // Neighborhood pages — all on the franchise URL /colorado/<city>/<slug>
  const neighborhoods: MetadataRoute.Sitemap = allNeighborhoods.map((n) => ({
    url: `${baseUrl}/colorado/${n.citySlug}/${n.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Insurance carrier pages (CO + AZ)
  const coInsurance: MetadataRoute.Sitemap = INSURANCE_CARRIERS.map((slug) => ({
    url: `${baseUrl}/colorado/insurance/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));
  const azInsurance: MetadataRoute.Sitemap = INSURANCE_CARRIERS.map((slug) => ({
    url: `${baseUrl}/arizona/insurance/${slug}`,
    lastModified: azDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // High-intent content pages (CO + AZ)
  const coHighIntent: MetadataRoute.Sitemap = HIGH_INTENT.map((slug) => ({
    url: `${baseUrl}/colorado/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));
  const azHighIntent: MetadataRoute.Sitemap = HIGH_INTENT.map((slug) => ({
    url: `${baseUrl}/arizona/${slug}`,
    lastModified: azDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Vehicle pages (global)
  const vehicles = getAllVehicleSlugs().map((slug) => ({
    url: `${baseUrl}/vehicles/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Blog pages (global; exclude slugs that 301-redirect to canonical versions)
  const redirectedBlogSlugs = new Set([
    'windshield-repair-vs-replacement-decision-guide',
    'windshield-replacement-cost-guide-colorado',
  ]);
  const blog: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ...getAllBlogPosts()
      .filter((post) => !redirectedBlogSlugs.has(post.slug))
      .map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.publishDate),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      })),
  ];

  // Brand (make) pages (global)
  const brands = getAllMakes().map((make) => ({
    url: `${baseUrl}/vehicles/brands/${make.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    ...pages,
    ...hubs,
    ...coServices,
    ...azServices,
    ...coLocations,
    ...azLocations,
    ...neighborhoods,
    ...coInsurance,
    ...azInsurance,
    ...coHighIntent,
    ...azHighIntent,
    ...vehicles,
    ...blog,
    ...brands,
  ];
}
