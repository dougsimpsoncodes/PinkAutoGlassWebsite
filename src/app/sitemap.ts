import { MetadataRoute } from 'next';
import { getAllVehicleSlugs, getAllMakes } from '@/data/makes-models';
import { getAllBlogPosts } from '@/data/blog';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://pinkautoglass.com';
  const now = new Date();

  // Core pages
  const pages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/locations`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/vehicles`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/sitemap`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Service pages
  const services = [
    'windshield-replacement',
    'windshield-repair',
    'mobile-service',
    'adas-calibration',
    'insurance-claims',
  ].map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }));

  // Location pages - All 44 cities in service area
  const locations = [
    // Denver Metro - Core Cities
    'denver-co',
    'aurora-co',
    'lakewood-co',
    'thornton-co',
    'arvada-co',
    'westminster-co',
    'centennial-co',
    'parker-co',
    'highlands-ranch-co',
    'littleton-co',
    'commerce-city-co',
    'englewood-co',
    'broomfield-co',
    'brighton-co',
    // Denver Metro - Additional Cities (30 mile radius)
    'erie-co',
    'northglenn-co',
    'wheat-ridge-co',
    'lafayette-co',
    'louisville-co',
    'superior-co',
    'federal-heights-co',
    'sheridan-co',
    'greenwood-village-co',
    'lone-tree-co',
    'cherry-hills-village-co',
    'firestone-co',
    'frederick-co',
    // Boulder County
    'boulder-co',
    'longmont-co',
    // Northern Front Range - Core Cities
    'fort-collins-co',
    'loveland-co',
    'greeley-co',
    'windsor-co',
    // Northern Front Range - Additional Cities (10 mile radius from Fort Collins)
    'johnstown-co',
    'timnath-co',
    'wellington-co',
    // Southern Colorado - Core Cities
    'colorado-springs-co',
    'castle-rock-co',
    // Southern Colorado - Additional Cities (10 mile radius from Colorado Springs)
    'security-widefield-co',
    'fountain-co',
    'manitou-springs-co',
    'black-forest-co',
    // Mountain Communities
    'evergreen-co',
    'golden-co',
  ].map((slug) => ({
    url: `${baseUrl}/locations/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: slug === 'denver-co' ? 0.9 : 0.8,
  }));

  // Vehicle pages (dynamically generated from data)
  const vehicleSlugs = getAllVehicleSlugs();
  const vehicles = vehicleSlugs.map((slug) => ({
    url: `${baseUrl}/vehicles/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Blog pages
  const blogPosts = getAllBlogPosts();
  const blog: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.publishDate),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];

  // Brand (make) pages
  const makes = getAllMakes();
  const brands = makes.map((make) => ({
    url: `${baseUrl}/vehicles/brands/${make.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Arizona location pages
  const azLocations = [
    'phoenix-az',
    'scottsdale-az',
    'tempe-az',
    'mesa-az',
    'chandler-az',
    'gilbert-az',
    'glendale-az',
    'peoria-az',
    'surprise-az',
    'goodyear-az',
    'avondale-az',
    'buckeye-az',
    'fountain-hills-az',
    'queen-creek-az',
    'apache-junction-az',
    'cave-creek-az',
    'maricopa-az',
    'el-mirage-az',
    'litchfield-park-az',
    'ahwatukee-az',
  ].map((slug) => ({
    url: `${baseUrl}/locations/${slug}`,
    lastModified: new Date('2026-02-22'),
    changeFrequency: 'weekly' as const,
    priority: slug === 'phoenix-az' ? 0.9 : 0.8,
  }));

  // Arizona insurance page
  const azInsurance: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/services/insurance-claims/arizona`,
      lastModified: new Date('2026-02-22'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // Insurance brand pages
  const insuranceBrands = [
    'progressive',
    'geico',
    'state-farm',
    'allstate',
    'usaa',
    'aaa',
    'farmers',
    'liberty-mutual',
    'nationwide',
    'travelers',
  ].map((slug) => ({
    url: `${baseUrl}/services/insurance-claims/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...pages, ...services, ...azInsurance, ...insuranceBrands, ...locations, ...azLocations, ...vehicles, ...blog, ...brands];
}
