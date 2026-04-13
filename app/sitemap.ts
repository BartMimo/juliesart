import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/collecties`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/eigen-ontwerp`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/configurator`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacybeleid`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/algemene-voorwaarden`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ]

  // Fetch active categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, updated_at')
    .eq('is_active', true)

  const categoryPages: MetadataRoute.Sitemap = (categories ?? []).map((cat) => ({
    url: `${SITE_URL}/collecties/${cat.slug}`,
    lastModified: new Date(cat.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Fetch active products
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
