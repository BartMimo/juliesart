-- ============================================================
-- Junction table: product_categories (many-to-many)
-- Allows a product to belong to multiple categories
-- ============================================================

CREATE TABLE IF NOT EXISTS public.product_categories (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  UNIQUE(product_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_product  ON public.product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category ON public.product_categories(category_id);

-- RLS
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read product_categories"
  ON public.product_categories FOR SELECT USING (true);

CREATE POLICY "Admins can manage product_categories"
  ON public.product_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Backfill: copy existing category_id values into the junction table
INSERT INTO public.product_categories (product_id, category_id)
SELECT id, category_id
FROM   public.products
WHERE  category_id IS NOT NULL
ON CONFLICT DO NOTHING;
