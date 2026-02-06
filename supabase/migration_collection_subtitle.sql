-- Migration to add subtitle to collections
ALTER TABLE collections ADD COLUMN IF NOT EXISTS subtitle TEXT;
