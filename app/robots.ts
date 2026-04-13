import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          // Auth / account pagina's — niet relevant voor zoekmachines
          '/inloggen',
          '/registreren',
          '/wachtwoord-vergeten',
          '/wachtwoord-resetten',
          '/account',
          '/account/',
          // Transactie-pagina's
          '/winkelwagen',
          '/afrekenen',
          '/afrekenen/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
