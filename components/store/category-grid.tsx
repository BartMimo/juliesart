import { createClient } from '@/lib/supabase/server'
import { CategoryGridClient } from './category-grid-client'

export async function CategoryGrid() {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Fout bij ophalen categorieën:', error)
    return null
  }

  if (!categories || categories.length === 0) {
    return null
  }

  return <CategoryGridClient categories={categories} />
}