-- ============================================
-- MIGRATION: PENDING ITEMS (ITENS PENDENTES)
-- ============================================
-- Sistema de fila de aprovação para produtos recebidos via WhatsApp ou CSV
-- Cole este SQL no Supabase Dashboard > SQL Editor > New Query > Run

-- ============================================
-- 1. TABELA DE ITENS PENDENTES
-- ============================================

CREATE TABLE IF NOT EXISTS pending_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados brutos recebidos
  raw_text TEXT,
  raw_images TEXT[] DEFAULT '{}',
  
  -- Dados parseados (preenchidos pelo parser)
  parsed_name TEXT,
  parsed_category TEXT,
  parsed_sizes TEXT[] DEFAULT '{}',
  parsed_colors TEXT[] DEFAULT '{}',
  parsed_price DECIMAL(10,2),
  parsed_original_price DECIMAL(10,2),
  parsed_brand TEXT,
  parsed_reference TEXT,
  parsed_fabric TEXT,
  parsed_description TEXT,
  parsed_occasion TEXT[] DEFAULT '{}',
  parsed_fit TEXT,
  parsed_length TEXT,
  parsed_pattern TEXT,
  parsed_style_tags TEXT[] DEFAULT '{}',
  
  -- Score de confiança do parsing (0.0 a 1.0)
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  
  -- Warnings gerados pelo parser
  warnings TEXT[] DEFAULT '{}',
  
  -- Origem do item
  source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('whatsapp', 'csv', 'manual')),
  source_message_id TEXT, -- ID da mensagem do WhatsApp, se aplicável
  source_phone TEXT,      -- Telefone de quem enviou via WhatsApp
  
  -- Status do item na fila
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',   -- Aguardando revisão
    'approved',  -- Aprovado e convertido em produto
    'rejected',  -- Rejeitado pelo admin
    'merged'     -- Mesclado com produto existente
  )),
  
  -- Revisão
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  merged_product_id UUID REFERENCES products(id),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_pending_items_status ON pending_items(status);
CREATE INDEX idx_pending_items_source ON pending_items(source);
CREATE INDEX idx_pending_items_created_at ON pending_items(created_at DESC);
CREATE INDEX idx_pending_items_confidence ON pending_items(confidence_score);

-- Trigger para updated_at
CREATE TRIGGER pending_items_updated_at
  BEFORE UPDATE ON pending_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 2. RLS para pending_items
-- ============================================

ALTER TABLE pending_items ENABLE ROW LEVEL SECURITY;

-- Apenas admins (autenticados) podem ver e gerenciar itens pendentes
CREATE POLICY "Admin pode ver itens pendentes"
  ON pending_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin pode inserir itens pendentes"
  ON pending_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Permitir INSERT anônimo (para webhook do WhatsApp)
CREATE POLICY "Webhook pode inserir itens pendentes"
  ON pending_items FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Admin pode atualizar itens pendentes"
  ON pending_items FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admin pode deletar itens pendentes"
  ON pending_items FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 3. ADICIONAR CAMPOS DE RASTREAMENTO EM PRODUCTS
-- ============================================

-- Campo para rastrear a origem do produto
ALTER TABLE products ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
ALTER TABLE products ADD COLUMN IF NOT EXISTS source_pending_item_id UUID REFERENCES pending_items(id);
