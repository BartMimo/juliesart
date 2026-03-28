-- ============================================================
-- JULIES ART — Supabase Database Schema
-- ============================================================
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- Run in order from top to bottom.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for full-text search

-- ============================================================
-- PROFILES
-- ============================================================
-- Extends Supabase auth.users with app-level data
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  -- Marketing consent (GDPR compliant separation)
  marketing_consent       BOOLEAN NOT NULL DEFAULT false,
  marketing_consent_at    TIMESTAMPTZ,
  -- Transactional email is always allowed (order confirmations)
  -- but we track the signup source for audit
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, marketing_consent)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'marketing_consent')::boolean, false)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE public.categories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  image_url     TEXT,
  sort_order    INT NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_active ON public.categories(is_active);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE public.products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  slug                TEXT UNIQUE NOT NULL,
  description         TEXT,
  short_description   TEXT,
  price               NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price    NUMERIC(10, 2) CHECK (compare_at_price >= 0),
  category_id         UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  is_featured         BOOLEAN NOT NULL DEFAULT false,
  stock_quantity      INT,
  track_inventory     BOOLEAN NOT NULL DEFAULT false,
  -- SEO
  meta_title          TEXT,
  meta_description    TEXT,
  -- Timestamps
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_featured ON public.products(is_featured);
-- Full-text search index
CREATE INDEX idx_products_search ON public.products USING gin(
  to_tsvector('dutch', coalesce(name, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(description, ''))
);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE public.product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  alt         TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  is_primary  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product ON public.product_images(product_id);

-- Ensure only one primary image per product
CREATE UNIQUE INDEX idx_product_images_primary ON public.product_images(product_id)
  WHERE is_primary = true;

-- ============================================================
-- PERSONALIZATION FIELDS
-- Per-product personalization configuration (admin-managed)
-- ============================================================
CREATE TABLE public.personalization_fields (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  -- Field type determines UI component and validation
  type        TEXT NOT NULL CHECK (type IN ('text', 'select', 'radio', 'color', 'font', 'icon', 'size')),
  key         TEXT NOT NULL,  -- internal key, e.g. 'naam', 'lettertype', 'kleur'
  label       TEXT NOT NULL,  -- Dutch display label
  placeholder TEXT,
  help_text   TEXT,
  is_required BOOLEAN NOT NULL DEFAULT true,
  max_length  INT,            -- for text fields
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Unique key per product
  UNIQUE(product_id, key)
);

CREATE INDEX idx_personalization_fields_product ON public.personalization_fields(product_id);

-- ============================================================
-- PERSONALIZATION OPTIONS
-- Available choices for select/radio/color/font/icon/size fields
-- ============================================================
CREATE TABLE public.personalization_options (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_id        UUID NOT NULL REFERENCES public.personalization_fields(id) ON DELETE CASCADE,
  value           TEXT NOT NULL,  -- internal value stored in order
  label           TEXT NOT NULL,  -- Dutch display label
  image_url       TEXT,           -- for icon options (shows preview image)
  color_hex       TEXT,           -- for color options (e.g. '#f9a8d4')
  font_preview    TEXT,           -- for font options (Google Font name or CSS font-family)
  price_modifier  NUMERIC(10, 2) NOT NULL DEFAULT 0,  -- optional price change
  sort_order      INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX idx_personalization_options_field ON public.personalization_options(field_id);

-- ============================================================
-- DISCOUNT CODES
-- ============================================================
CREATE TABLE public.discount_codes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                TEXT UNIQUE NOT NULL,
  type                TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value               NUMERIC(10, 2) NOT NULL CHECK (value > 0),
  min_order_amount    NUMERIC(10, 2),
  max_uses            INT,
  current_uses        INT NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  valid_from          TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until         TIMESTAMPTZ,
  description         TEXT,  -- admin notes
  stripe_coupon_id    TEXT,  -- Stripe coupon ID if synced
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_discount_codes_updated_at
  BEFORE UPDATE ON public.discount_codes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_discount_codes_code ON public.discount_codes(code);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE public.orders (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number              TEXT UNIQUE NOT NULL,  -- e.g. JA-202501-00001
  user_id                   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Customer info snapshot (for guest orders and data retention)
  email                     TEXT NOT NULL,
  customer_name             TEXT,
  phone                     TEXT,
  -- Status
  status                    TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  -- Pricing
  subtotal                  NUMERIC(10, 2) NOT NULL,
  discount_amount           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount_code             TEXT,
  discount_code_id          UUID REFERENCES public.discount_codes(id) ON DELETE SET NULL,
  shipping_amount           NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_amount                NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total                     NUMERIC(10, 2) NOT NULL,
  -- Stripe
  stripe_payment_intent_id  TEXT,
  stripe_session_id         TEXT UNIQUE,
  -- Shipping
  shipping_name             TEXT,
  shipping_address_line1    TEXT,
  shipping_address_line2    TEXT,
  shipping_city             TEXT,
  shipping_postal_code      TEXT,
  shipping_country          TEXT DEFAULT 'NL',
  -- Notes
  customer_notes            TEXT,
  admin_notes               TEXT,
  -- Timestamps
  paid_at                   TIMESTAMPTZ,
  shipped_at                TIMESTAMPTZ,
  delivered_at              TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_orders_user ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_email ON public.orders(email);
CREATE INDEX idx_orders_session ON public.orders(stripe_session_id);
CREATE INDEX idx_orders_created ON public.orders(created_at DESC);

-- Auto-generate order number
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  year_month TEXT;
  seq_num    INT;
BEGIN
  year_month := to_char(now(), 'YYYYMM');
  SELECT COUNT(*) + 1 INTO seq_num
  FROM public.orders
  WHERE to_char(created_at, 'YYYYMM') = year_month;
  NEW.order_number := 'JA-' || year_month || '-' || lpad(seq_num::text, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.generate_order_number();

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE public.order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id      UUID REFERENCES public.products(id) ON DELETE SET NULL,
  -- Snapshots at time of purchase
  product_name    TEXT NOT NULL,
  product_slug    TEXT NOT NULL,
  product_image   TEXT,
  quantity        INT NOT NULL CHECK (quantity > 0),
  unit_price      NUMERIC(10, 2) NOT NULL,
  total_price     NUMERIC(10, 2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_order_items_product ON public.order_items(product_id);

-- ============================================================
-- ORDER ITEM PERSONALIZATIONS
-- Stores the customer's personalization choices per order item
-- ============================================================
CREATE TABLE public.order_item_personalizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id   UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  field_key       TEXT NOT NULL,    -- e.g. 'naam', 'lettertype', 'kleur'
  field_label     TEXT NOT NULL,    -- Dutch label at time of order
  field_type      TEXT NOT NULL,    -- 'text', 'color', 'font', etc.
  value           TEXT NOT NULL,    -- internal value
  display_value   TEXT              -- human-readable Dutch label
);

CREATE INDEX idx_order_personalizations_item ON public.order_item_personalizations(order_item_id);

-- ============================================================
-- PAGE ANALYTICS
-- Lightweight custom analytics stored in Supabase
-- ============================================================
CREATE TABLE public.page_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path        TEXT NOT NULL,
  product_id  UUID REFERENCES public.products(id) ON DELETE SET NULL,
  session_id  TEXT,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  referrer    TEXT,
  user_agent  TEXT,
  country     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_path ON public.page_views(path);
CREATE INDEX idx_page_views_product ON public.page_views(product_id);
CREATE INDEX idx_page_views_created ON public.page_views(created_at DESC);
-- Partial index for product page views
CREATE INDEX idx_page_views_product_not_null ON public.page_views(product_id, created_at DESC)
  WHERE product_id IS NOT NULL;

-- ============================================================
-- SITE SETTINGS
-- Key-value store for admin-configurable settings
-- ============================================================
CREATE TABLE public.site_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL DEFAULT '{}',
  label       TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Default settings
INSERT INTO public.site_settings (key, label, value) VALUES
  ('shipping_free_threshold', 'Gratis verzending vanaf (€)', '"50"'),
  ('shipping_rate', 'Verzendkosten (€)', '"4.95"'),
  ('shop_email', 'Winkel e-mailadres', '"info@juliesart.nl"'),
  ('shop_phone', 'Telefoonnummer', '"+31 6 00000000"'),
  ('shop_name', 'Winkelnaam', '"Julies Art"'),
  ('shop_tagline', 'Tagline', '"Gepersonaliseerde kindercadeaus met liefde gemaakt"');

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalization_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item_personalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper: check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ----------------------------------------
-- PROFILES policies
-- ----------------------------------------
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = 'customer'); -- cannot self-promote

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- ----------------------------------------
-- CATEGORIES policies
-- ----------------------------------------
CREATE POLICY "Public can view active categories"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- ----------------------------------------
-- PRODUCTS policies
-- ----------------------------------------
CREATE POLICY "Public can view active products"
  ON public.products FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- ----------------------------------------
-- PRODUCT IMAGES policies
-- ----------------------------------------
CREATE POLICY "Public can view product images"
  ON public.product_images FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id AND (p.is_active = true OR public.is_admin())
  ));

CREATE POLICY "Admins can manage product images"
  ON public.product_images FOR ALL
  USING (public.is_admin());

-- ----------------------------------------
-- PERSONALIZATION FIELDS policies
-- ----------------------------------------
CREATE POLICY "Public can view active personalization fields"
  ON public.personalization_fields FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage personalization fields"
  ON public.personalization_fields FOR ALL
  USING (public.is_admin());

-- ----------------------------------------
-- PERSONALIZATION OPTIONS policies
-- ----------------------------------------
CREATE POLICY "Public can view active personalization options"
  ON public.personalization_options FOR SELECT
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can manage personalization options"
  ON public.personalization_options FOR ALL
  USING (public.is_admin());

-- ----------------------------------------
-- DISCOUNT CODES policies
-- ----------------------------------------
-- Customers can validate (read) but not see all
CREATE POLICY "Admins can manage discount codes"
  ON public.discount_codes FOR ALL
  USING (public.is_admin());

-- ----------------------------------------
-- ORDERS policies
-- ----------------------------------------
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Service role can insert orders"
  ON public.orders FOR INSERT
  WITH CHECK (true); -- webhook uses service role

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin());

-- ----------------------------------------
-- ORDER ITEMS policies
-- ----------------------------------------
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.is_admin())
  ));

CREATE POLICY "Service role can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- ----------------------------------------
-- ORDER ITEM PERSONALIZATIONS policies
-- ----------------------------------------
CREATE POLICY "Users can view own order personalizations"
  ON public.order_item_personalizations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.id = order_item_id AND (o.user_id = auth.uid() OR public.is_admin())
  ));

CREATE POLICY "Service role can insert personalizations"
  ON public.order_item_personalizations FOR INSERT
  WITH CHECK (true);

-- ----------------------------------------
-- PAGE VIEWS policies
-- ----------------------------------------
CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view page views"
  ON public.page_views FOR SELECT
  USING (public.is_admin());

-- ----------------------------------------
-- SITE SETTINGS policies
-- ----------------------------------------
CREATE POLICY "Public can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin());

-- ============================================================
-- HELPER RPC FUNCTIONS
-- ============================================================

-- Safely increment the usage_count of a discount code
CREATE OR REPLACE FUNCTION public.increment_discount_usage(code_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.discount_codes
  SET usage_count = usage_count + 1
  WHERE id = code_id;
END;
$$;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Run these separately in the Supabase Dashboard → Storage
-- or use the Supabase CLI

-- Product images bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admins can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND public.is_admin());
