-- Add filter boolean fields to products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS is_personalizable boolean DEFAULT false NOT NULL,
  ADD COLUMN IF NOT EXISTS is_sale boolean DEFAULT false NOT NULL;

-- Remove all existing product-category links
DELETE FROM product_categories;
UPDATE products SET category_id = NULL;

-- Replace all categories with the 5 hoofdcategorieën
DELETE FROM categories;
INSERT INTO categories (name, slug, sort_order, is_active) VALUES
  ('Eten & Drinken', 'eten-drinken', 1, true),
  ('Speelgoed',      'speelgoed',    2, true),
  ('Kinderkamer',    'kinderkamer',  3, true),
  ('Kraamcadeau',    'kraamcadeau',  4, true),
  ('Ouders',         'ouders',       5, true);
