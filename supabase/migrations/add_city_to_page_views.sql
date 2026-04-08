-- Add city column to page_views for geo analytics
ALTER TABLE public.page_views ADD COLUMN IF NOT EXISTS city TEXT;
CREATE INDEX IF NOT EXISTS idx_page_views_city ON public.page_views(city);
