import { createClient } from '@/lib/supabase/server'
import { FeaturedProductsClient } from './featured-products-client'

export async function FeaturedProducts() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*),
      images:product_images(*),
      personalization_fields(id)
    `)
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(4)

  if (error) {
    console.error('Fout bij ophalen uitgelichte producten:', error)
    return null
  }

  if (!products || products.length === 0) {
    return null
  }

  return <FeaturedProductsClient products={products} />
}