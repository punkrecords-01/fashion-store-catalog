-- Migration to add rich content to collections
ALTER TABLE collections ADD COLUMN IF NOT EXISTS content JSONB DEFAULT '[]';

-- Update comment for documentation
COMMENT ON COLUMN collections.content IS 'Stores a list of content blocks (text, image, shoppable_image) for lookbook/blog style pages.';
