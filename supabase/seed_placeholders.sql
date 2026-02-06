-- SQL para popular o site com 50 produtos placeholder
-- Copie e cole este código no SQL Editor do seu Supabase Dashboard

-- Limpar produtos antigos (opcional, remova -- se quiser limpar)
DELETE FROM products;

DO $$
DECLARE
    i INT;
    v_name TEXT;
    v_cat TEXT;
    v_price DECIMAL;
    v_img TEXT;
    v_status TEXT;
    v_categories TEXT[] := ARRAY['vestido', 'blusa', 'calca', 'saia', 'shorts', 'macacao', 'bolsa', 'cinto', 'acessorio'];
    v_colors TEXT[] := ARRAY['Preto', 'Branco', 'Off-White', 'Bege', 'Cinza', 'Azul Marinho', 'Verde Militar', 'Marrom'];
    v_fabrics TEXT[] := ARRAY['algodao', 'linho', 'viscose', 'seda', 'crepe', 'jeans'];
    v_imgs TEXT[] := ARRAY[
        'https://dimemtl.com/cdn/shop/files/DimeEastpak_Carryon_Blue_Model_02.png',
        'https://dimemtl.com/cdn/shop/files/Eastpak_Carryon_Blue_Product.png',
        'https://dimemtl.com/cdn/shop/files/DimeEastpak_Backpack_Black_Model_01.png',
        'https://dimemtl.com/cdn/shop/files/Eastpak_Backpack_Black_Product.png',
        'https://dimemtl.com/cdn/shop/files/DimeEastpak_Backpack_Blue_Model_01.png',
        'https://dimemtl.com/cdn/shop/files/Eastpak_Backpack_Navy_Product.png',
        'https://dimemtl.com/cdn/shop/files/DimeEastpak_Shoulder_Black_Model_01.png',
        'https://dimemtl.com/cdn/shop/files/Eastpak_Shoulder_Black_Product_01.png',
        'https://dimemtl.com/cdn/shop/files/DimeEastpak_Shoulder_Blue_Model_01.png',
        'https://dimemtl.com/cdn/shop/files/Eastpak_Shoulder_Blue_Product_01.png',
        'https://dimemtl.com/cdn/shop/files/JACKETS_HO25_QUILTED_HONEY_MODEL_01_90b6c5fb-f2ce-4888-9bb5-70ba3113e007.png',
        'https://dimemtl.com/cdn/shop/files/JACKETS_HO25_QUILTED_HONEY_PRODUCT_1.png',
        'https://dimemtl.com/cdn/shop/files/JACKETS_HO25_QUILTED_EMERALD_MODEL_01.png',
        'https://dimemtl.com/cdn/shop/files/JACKETS_HO25_QUILTED_EMERALD_PRODUCT.png',
        'https://dimemtl.com/cdn/shop/files/JACKETS_HO25_PLEATEDPUFFER_CHARCOAL_MODEL_01.png',
        'https://dimemtl.com/cdn/shop/files/JACKETS_HO25_PLEATEDPUFFER_CHARCOAL_PRODUCT.png',
        'https://dimemtl.com/cdn/shop/files/JACKETS_HO25_PLEATEDPUFFER_BRONZE_MODEL_01_8f72b571-f9f9-4d29-a731-3acda5eed2a3.png',
        'https://dimemtl.com/cdn/shop/files/JACKETS_HO25_PLEATEDPUFFER_BRONZE_PRODUCT.png',
        'https://dimemtl.com/cdn/shop/files/TOPS_HO25_SHERPA_CREAM_MODEL_04.png',
        'https://dimemtl.com/cdn/shop/files/TOPS_HO25_SHERPA_CREAM_PRODUCT.png',
        'https://dimemtl.com/cdn/shop/files/TOPS_HO25_SHERPA_ORANGE_MODEL_01.png',
        'https://dimemtl.com/cdn/shop/files/TOPS_HO25_SHERPA_CORANGE_PRODUCT.png',
        'https://dimemtl.com/cdn/shop/files/TOPS_HO25_FLEECEBOMBER_BLACK_MODEL_01.png',
        'https://dimemtl.com/cdn/shop/files/TOPS_HO25_FLEECEBOMBER_BLACK_PRODUCT.png',
        'https://dimemtl.com/cdn/shop/files/TOPS_HO25_FLEECEBOMBER_TERRA_MODEL_01.png',
        'https://dimemtl.com/cdn/shop/files/TOPS_HO25_FLEECEBOMBER_TERRA_PRODUCT.png',
        'https://dimemtl.com/cdn/shop/files/TOPS_HO25_FLEECEBOMBER_NAVY_MODEL_01_68765918-8ac4-4ace-abe0-938ca7bcd6e2.png',
        'https://dimemtl.com/cdn/shop/files/TOPS_HO25_FLEECEBOMBER_NAVY_PRODUCT.png',
        'https://dimemtl.com/cdn/shop/files/TOPS_HO25_MOHAIRKNIT_CAMEL_MODEL_01.png',
        'https://dimemtl.com/cdn/shop/files/TOPS_HO25_MOHAIRKNIT_CAMEL_PRODUCT.png'
    ];
BEGIN
    FOR i IN 1..30 LOOP
        v_cat := v_categories[1 + mod(i, 9)];
        v_name := upper(v_cat) || ' ' || (ARRAY['COUTURE', 'ESSENTIAL', 'MINIMAL', 'LUXE', 'NOIR', 'PURE', 'RAW', 'SILK'])[1 + mod(i, 8)] || ' #' || i;
        v_price := 129.90 + (mod(i * 17, 300));
        v_img := v_imgs[1 + mod(i, 30)];
        
        -- Distribuir status
        IF i % 10 = 0 THEN v_status := 'outlet';
        ELSIF i % 15 = 0 THEN v_status := 'last_unit';
        ELSE v_status := 'available';
        END IF;

        INSERT INTO products (
            name, 
            category, 
            price, 
            original_price, 
            status, 
            images, 
            colors, 
            sizes, 
            fabric, 
            brand,
            pattern
        ) 
        VALUES (
            v_name, 
            v_cat, 
            v_price, 
            CASE WHEN v_status = 'outlet' THEN v_price * 1.5 ELSE NULL END, 
            v_status, 
            ARRAY[v_img], 
            ARRAY[v_colors[1 + mod(i, 8)]], 
            ARRAY['P', 'M', 'G'], 
            v_fabrics[1 + mod(i, 6)],
            'it''s couture',
            'liso'
        );
    END LOOP;
END;
$$;
