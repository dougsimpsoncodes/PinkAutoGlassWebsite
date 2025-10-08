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
    {
      url: `${baseUrl}/thank-you`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.1,
    },
    {
      url: `${baseUrl}/track`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
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

  // Location pages
  const locations = [
    'denver-co',
    'aurora-co',
    'lakewood-co',
    'boulder-co',
    'highlands-ranch-co',
    'thornton-co',
    'arvada-co',
    'westminster-co',
    'parker-co',
    'centennial-co',
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

  return [...pages, ...services, ...locations, ...vehicles, ...blog, ...brands];
}
