-- SQL para popular as coleções com conteúdo placeholder
-- Copie e cole este código no SQL Editor do seu Supabase Dashboard

-- Limpar coleções antigas
DELETE FROM collections;

-- Inserir Coleções com IDs de produtos aleatórios (pega do que já existe na tabela products)
INSERT INTO collections (title, subtitle, description, slug, cover_image, published, display_order, product_ids, content)
VALUES 
(
    'Winter Essentials', 
    'DROPS DE INVERNO', 
    'Uma curadoria minimalista focada em puffers, moletons e texturas premium para os dias frios.', 
    'winter-essentials', 
    'https://dimemtl.com/cdn/shop/files/JACKETS_HO25_PLEATEDPUFFER_CHARCOAL_MODEL_01.png', 
    true, 
    1, 
    (SELECT ARRAY_AGG(id) FROM (SELECT id FROM products ORDER BY random() LIMIT 6) AS random_products),
    '[
        {"type": "text", "content": "O inverno It''s Couture redefine o conceito de volume e proteção."},
        {"type": "image", "url": "https://dimemtl.com/cdn/shop/files/JACKETS_HO25_PLEATEDPUFFER_BRONZE_MODEL_01_8f72b571-f9f9-4d29-a731-3acda5eed2a3.png", "alt": "Puffer Bronze Detail"}
    ]'::jsonb
),
(
    'Urban Noir', 
    'ESSÊNCIA URBANA', 
    'A força do preto absoluto em silhuetas contemporâneas e tecidos técnicos.', 
    'urban-noir', 
    'https://dimemtl.com/cdn/shop/files/DimeEastpak_Backpack_Black_Model_01.png', 
    true, 
    2, 
    (SELECT ARRAY_AGG(id) FROM (SELECT id FROM products WHERE colors @> ARRAY['Preto'] ORDER BY random() LIMIT 6) AS random_products),
    '[]'::jsonb
),
(
    'Sherpa & Softness', 
    'TEXTURAS PURE', 
    'O conforto encontra o luxo em peças de sherpa, lã e tricô em tons terrosos.', 
    'sherpa-softness', 
    'https://dimemtl.com/cdn/shop/files/TOPS_HO25_SHERPA_CREAM_MODEL_04.png', 
    true, 
    3, 
    (SELECT ARRAY_AGG(id) FROM (SELECT id FROM products WHERE fabric IN ('trico', 'la', 'moletom') ORDER BY random() LIMIT 6) AS random_products),
    '[]'::jsonb
),
(
    'Emerald Collection', 
    'TONS DO MOMENTO', 
    'Destaque-se com nossa curadoria em tons de esmeralda e verde militar.', 
    'emerald-collection', 
    'https://dimemtl.com/cdn/shop/files/JACKETS_HO25_QUILTED_EMERALD_MODEL_01.png', 
    true, 
    4, 
    (SELECT ARRAY_AGG(id) FROM (SELECT id FROM products WHERE colors @> ARRAY['Verde Militar'] ORDER BY random() LIMIT 6) AS random_products),
    '[]'::jsonb
);
