-- Atualizar a restrição de fonte para aceitar Telegram
ALTER TABLE pending_items DROP CONSTRAINT IF EXISTS pending_items_source_check;
ALTER TABLE pending_items ADD CONSTRAINT pending_items_source_check 
CHECK (source IN ('whatsapp', 'csv', 'manual', 'telegram'));
