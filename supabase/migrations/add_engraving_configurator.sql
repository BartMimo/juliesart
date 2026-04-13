-- ============================================================
-- Gravure Configurator — database-uitbreidingen
-- ============================================================

-- 1. Voeg engraving_area toe aan products
--    JSON-structuur: { x, y, width, height } — alle waarden als % van afbeeldingsbreedte/-hoogte
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS engraving_area JSONB DEFAULT NULL;

-- 2. Voeg gravure-velden toe aan orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS upload_url       TEXT    DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS engraving_position JSONB  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS order_type       TEXT    DEFAULT 'regular';

-- 3. Index op order_type voor snelle admin-filtering
CREATE INDEX IF NOT EXISTS orders_order_type_idx ON orders (order_type);

-- 4. Supabase Storage bucket voor uploads aanmaken
-- (als de bucket al bestaat, sla dan het INSERT over)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  10485760,  -- 10 MB
  ARRAY['image/jpeg','image/png','image/svg+xml','image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 5. RLS-policies voor de uploads bucket
--    Iedereen mag uploaden (anoniem), alleen de service-role kan verwijderen
CREATE POLICY "Public upload access"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Public read access uploads"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'uploads');

CREATE POLICY "Admin delete uploads"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'uploads' AND auth.role() = 'service_role');
