import { MetadataRoute } from 'next'
import { isStaging } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  if (isStaging()) {
    // Staging deploys must never appear in search results.
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/tmp/', '/admin/'] },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-SearchBot', allow: '/' },
      { userAgent: 'Bytespider', allow: '/' },
      { userAgent: 'meta-externalagent', allow: '/' },
    ],
    sitemap: 'https://pinkautoglass.com/sitemap.xml',
  }
}
