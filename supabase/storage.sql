-- ============================================
-- STORAGE BUCKET PARA IMAGENS
-- ============================================
-- Execute no SQL Editor do Supabase APÓS criar o bucket manualmente

-- 1. PRIMEIRO: Vá em Storage > Create Bucket
--    - Name: products
--    - Public: true (para as imagens serem acessíveis)

-- 2. DEPOIS: Execute este SQL para as políticas

-- Qualquer um pode VER imagens
CREATE POLICY "Imagens públicas para leitura"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Apenas autenticados podem UPLOAD
CREATE POLICY "Upload de imagens apenas para admin"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Service Role pode fazer upload (para o webhook do Telegram)
-- Nota: service_role já ignora RLS, mas se precisar de anon:
CREATE POLICY "Webhook pode fazer upload"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'products' AND (storage.foldername(name))[1] = 'telegram');

-- Apenas autenticados podem DELETAR
CREATE POLICY "Deleção de imagens apenas para admin"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');

-- Apenas autenticados podem ATUALIZAR
CREATE POLICY "Update de imagens apenas para admin"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products');
