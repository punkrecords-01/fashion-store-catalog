-- Fix: Allow products to be deleted even if they are referenced in the pending_items table
-- This migration updates the foreign key to set merged_product_id to NULL when the referenced product is deleted.

ALTER TABLE pending_items 
DROP CONSTRAINT IF EXISTS pending_items_merged_product_id_fkey,
ADD CONSTRAINT pending_items_merged_product_id_fkey 
  FOREIGN KEY (merged_product_id) 
  REFERENCES products(id) 
  ON DELETE SET NULL;
