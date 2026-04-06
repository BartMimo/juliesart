-- Atomically decrement stock for a product (only when track_inventory = true)
-- Allows negative values so customers can always order
CREATE OR REPLACE FUNCTION public.decrement_product_stock(p_product_id UUID, p_qty INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.products
  SET stock_quantity = stock_quantity - p_qty
  WHERE id = p_product_id
    AND track_inventory = true
    AND stock_quantity IS NOT NULL;
END;
$$;
