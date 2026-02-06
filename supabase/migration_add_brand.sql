-- MIGRATION: ADDING BRAND FILTER
-- Run this in Supabase SQL Editor

ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;

-- Update search vector to include brand (requires dropping and recreating or altering)
-- Since it's a generated column, we need to drop and add.
ALTER TABLE products DROP COLUMN IF EXISTS search_vector;

ALTER TABLE products ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(brand, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(category, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
