// ============================================
// API: Gerenciamento de Pending Items
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

// Aprovar um PendingItem → criar Product
export async function POST(request: NextRequest) {
  try {
    const { id, action, productData } = await request.json()
    const supabase = getServiceClient()

    if (action === 'approve') {
      // 1. Buscar o pending item
      const { data: item, error: fetchError } = await supabase
        .from('pending_items')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !item) {
        return NextResponse.json({ error: 'Item não encontrado' }, { status: 404 })
      }

      // 2. Criar o produto (usar dados editados pelo admin ou dados parseados)
      const product = productData || {
        name: item.parsed_name || 'Sem Nome',
        reference_code: item.parsed_reference,
        category: item.parsed_category || 'acessorio',
        colors: item.parsed_colors || [],
        style_tags: item.parsed_style_tags || [],
        sizes: item.parsed_sizes || [],
        price: item.parsed_price || 0,
        original_price: item.parsed_original_price,
        status: 'available',
        images: item.raw_images || [],
        description: item.parsed_description,
        fabric: item.parsed_fabric,
        occasion: item.parsed_occasion || [],
        fit: item.parsed_fit,
        length: item.parsed_length,
        pattern: item.parsed_pattern,
        brand: item.parsed_brand,
        source: item.source,
        source_pending_item_id: item.id,
      }

      const { data: newProduct, error: insertError } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 400 })
      }

      // 3. Atualizar status do pending item
      await supabase
        .from('pending_items')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          merged_product_id: newProduct.id,
        })
        .eq('id', id)

      return NextResponse.json({ product: newProduct })
    }

    if (action === 'reject') {
      const { error } = await supabase
        .from('pending_items')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ status: 'rejected' })
    }

    if (action === 'reject_all') {
      const { error } = await supabase
        .from('pending_items')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
        })
        .eq('status', 'pending')

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ status: 'bulk_rejected' })
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (error) {
    console.error('Pending items error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
