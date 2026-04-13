import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_NAME, SITE_URL, CONTACT_EMAIL } from '@/lib/constants'
import { formatPrice } from '@/lib/utils'
import ProductPageClient from './product-page-client'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, images:product_images(*), category:categories(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) {
    return {
      title: 'Product niet gevonden',
      robots: { index: false },
    }
  }

  const primaryImage = product.images?.find((img: { is_primary: boolean }) => img.is_primary)
    ?? product.images?.[0]

  const title = product.meta_title ?? product.name
  const description =
    product.meta_description ??
    product.short_description ??
    `${product.name} — gepersonaliseerd kindercadeau van Julies Art. Met liefde gemaakt, op naam van jouw kind.`

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/product/${slug}`,
      type: 'website',
      images: primaryImage
        ? [{ url: primaryImage.url, alt: primaryImage.alt ?? product.name }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_NAME}`,
      description,
      images: primaryImage ? [primaryImage.url] : undefined,
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, images:product_images(*), category:categories(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  // ── Structured Data ──────────────────────────────────────────────────────────

  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Collecties', item: `${SITE_URL}/collecties` },
  ]

  if (product?.category) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: product.category.name,
      item: `${SITE_URL}/collecties/${product.category.slug}`,
    })
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 4,
      name: product.name,
      item: `${SITE_URL}/product/${slug}`,
    })
  } else if (product) {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 3,
      name: product.name,
      item: `${SITE_URL}/product/${slug}`,
    })
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  }

  const primaryImage = product?.images?.find((img: { is_primary: boolean }) => img.is_primary)
    ?? product?.images?.[0]

  const productSchema = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description:
          product.short_description ??
          `${product.name} — gepersonaliseerd kindercadeau van Julies Art`,
        image: product.images?.map((img: { url: string }) => img.url) ?? [],
        url: `${SITE_URL}/product/${slug}`,
        brand: {
          '@type': 'Brand',
          name: SITE_NAME,
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'EUR',
          price: product.price.toFixed(2),
          availability: product.is_sold_out
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
          url: `${SITE_URL}/product/${slug}`,
          seller: {
            '@type': 'Organization',
            name: SITE_NAME,
          },
          ...(product.compare_at_price && product.compare_at_price > product.price
            ? { priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
            : {}),
        },
      }
    : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <ProductPageClient />
    </>
  )
}
