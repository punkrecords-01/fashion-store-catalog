-- ============================================
-- MIGRAÇÃO: Adicionar campos para Filtros Avançados
-- ============================================
-- Execute este SQL se você já tem a tabela products
-- e quer adicionar os novos campos sem perder dados.

-- Adicionar campo de Tecido
ALTER TABLE products ADD COLUMN IF NOT EXISTS fabric TEXT CHECK (fabric IN (
    'algodao', 'poliester', 'viscose', 'linho', 'seda', 'jeans', 
    'couro', 'couro_sintetico', 'trico', 'la', 'moletom', 'crepe', 
    'renda', 'chiffon', 'cetim', 'veludo', 'neoprene', 'outro'
));

-- Adicionar campo de Ocasião (array)
ALTER TABLE products ADD COLUMN IF NOT EXISTS occasion TEXT[] DEFAULT '{}';

-- Adicionar campo de Modelagem
ALTER TABLE products ADD COLUMN IF NOT EXISTS fit TEXT CHECK (fit IN (
    'ajustado', 'regular', 'solto', 'oversized', 'slim'
));

-- Adicionar campo de Comprimento
ALTER TABLE products ADD COLUMN IF NOT EXISTS length TEXT CHECK (length IN (
    'curto', 'medio', 'midi', 'longo', 'cropped'
));

-- Adicionar campo de Estampa
ALTER TABLE products ADD COLUMN IF NOT EXISTS pattern TEXT CHECK (pattern IN (
    'liso', 'floral', 'listrado', 'xadrez', 'poa', 'animal_print', 
    'geometrico', 'abstrato', 'tie_dye', 'estampado'
));

-- Criar índices para melhorar performance das buscas
CREATE INDEX IF NOT EXISTS idx_products_fabric ON products(fabric);
CREATE INDEX IF NOT EXISTS idx_products_fit ON products(fit);
CREATE INDEX IF NOT EXISTS idx_products_pattern ON products(pattern);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);

-- ============================================
-- PRONTO! Agora você tem os filtros avançados.
-- ============================================
