-- Add cost_price (inkoopprijs) to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2) DEFAULT NULL;
