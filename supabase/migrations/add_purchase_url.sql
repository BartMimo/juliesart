-- Add purchase_url (inkooplink) to products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS purchase_url TEXT DEFAULT NULL;
