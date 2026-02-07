-- ============================================
-- IT'S COUTURE - SUPABASE SCHEMA
-- ============================================
-- Cole este SQL no Supabase Dashboard > SQL Editor > New Query > Run

-- ============================================
-- 1. TABELA DE PRODUTOS
-- ============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  reference_code TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'vestido', 'blusa', 'calca', 'saia', 'shorts', 
    'macacao', 'conjunto', 'bolsa', 'cinto', 'bijuteria', 'acessorio'
  )),
  colors TEXT[] DEFAULT '{}',
  style_tags TEXT[] DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN (
    'available', 'last_unit', 'outlet', 'sold'
  )),
  images TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. TABELA DE COLEÇÕES (CURADORIAS)
-- ============================================

CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  product_ids UUID[] DEFAULT '{}',
  cover_image TEXT,
  published BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_collections_published ON collections(published);
CREATE INDEX idx_collections_order ON collections(display_order);

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Políticas para PRODUCTS
-- Qualquer um pode LER produtos (exceto vendidos, opcional)
CREATE POLICY "Produtos visíveis para todos"
  ON products FOR SELECT
  USING (true);

-- Apenas usuários autenticados podem INSERIR/EDITAR/DELETAR
CREATE POLICY "Admin pode inserir produtos"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin pode atualizar produtos"
  ON products FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admin pode deletar produtos"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para COLLECTIONS
CREATE POLICY "Coleções publicadas visíveis para todos"
  ON collections FOR SELECT
  USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Admin pode inserir coleções"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin pode atualizar coleções"
  ON collections FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admin pode deletar coleções"
  ON collections FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 4. BUSCA FULL-TEXT (para pesquisa)
-- ============================================

-- Adicionar coluna de busca
ALTER TABLE products ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('portuguese', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(category, '')), 'C')
  ) STORED;

CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- ============================================
-- 5. DADOS DE EXEMPLO (opcional, remover em produção)
-- ============================================

INSERT INTO products (name, reference_code, category, colors, style_tags, sizes, price, status, description) VALUES
  ('Vestido Midi Floral', 'VM001', 'vestido', ARRAY['verde', 'rosa'], ARRAY['romantico', 'festa'], ARRAY['P', 'M', 'G'], 189.90, 'available', 'Vestido midi com estampa floral, perfeito para ocasiões especiais.'),
  ('Blusa Cropped Básica', 'BC002', 'blusa', ARRAY['branco', 'preto'], ARRAY['casual', 'basico'], ARRAY['PP', 'P', 'M', 'G'], 59.90, 'available', 'Cropped básico versátil para o dia a dia.'),
  ('Calça Wide Leg Alfaiataria', 'CW003', 'calca', ARRAY['preto'], ARRAY['trabalho', 'elegante'], ARRAY['P', 'M'], 149.90, 'outlet', 'Calça wide leg em alfaiataria com caimento impecável.'),
  ('Conjunto Moletom Trendy', 'CM004', 'conjunto', ARRAY['cinza', 'bege'], ARRAY['casual', 'trendy'], ARRAY['M'], 279.90, 'last_unit', 'Conjunto de moletom confortável e estiloso.'),
  ('Bolsa Transversal Couro', 'BT005', 'bolsa', ARRAY['marrom', 'preto'], ARRAY['casual', 'trabalho'], ARRAY['U'], 199.90, 'available', 'Bolsa transversal em couro sintético de alta qualidade.'),
  ('Saia Midi Plissada', 'SP006', 'saia', ARRAY['rosa'], ARRAY['romantico', 'elegante'], ARRAY['P', 'M', 'G'], 129.90, 'available', 'Saia midi plissada romântica e elegante.');

-- Coleção de exemplo
INSERT INTO collections (title, description, slug, published, display_order) VALUES
  ('Novidades da Semana', 'As peças mais recentes que chegaram na loja', 'novidades', true, 1),
  ('Achadinhos de Outlet', 'Últimas peças com preços especiais', 'outlet', true, 2);
