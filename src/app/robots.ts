import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/tmp/', '/admin/'],
    },
    sitemap: 'https://pinkautoglass.com/sitemap.xml',
  }
}
