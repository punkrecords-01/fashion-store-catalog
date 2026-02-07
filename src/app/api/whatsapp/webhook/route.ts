// ============================================
// API: WhatsApp Webhook (Cloud API)
// ============================================
// Recebe mensagens do WhatsApp e cria PendingItems automaticamente
// 
// Configuração no Meta for Developers:
// 1. Webhook URL: https://seudominio.com/api/whatsapp/webhook
// 2. Verify Token: definir em WHATSAPP_VERIFY_TOKEN no .env
// 3. Campos: messages

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseProductText } from '@/lib/parser'

// Cliente Supabase com service role (sem RLS) para webhook
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

// ============================================
// GET: Verificação do Webhook (Meta exige isso)
// ============================================
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'fashion_store_verify_token'

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verified')
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ============================================
// POST: Receber mensagens do WhatsApp
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Verificar estrutura do WhatsApp Cloud API
    const entry = body.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value

    if (!value?.messages) {
      // Pode ser notificação de status, ignorar
      return NextResponse.json({ status: 'ok' })
    }

    const supabase = getServiceClient()

    for (const message of value.messages) {
      const from = message.from // Número do remetente
      const messageId = message.id

      // Verificar se já processamos essa mensagem
      const { data: existing } = await supabase
        .from('pending_items')
        .select('id')
        .eq('source_message_id', messageId)
        .single()

      if (existing) continue // Já processado

      let rawText = ''
      const rawImages: string[] = []

      // Processar diferentes tipos de mensagem
      switch (message.type) {
        case 'text':
          rawText = message.text.body
          break

        case 'image':
          // Baixar URL da imagem via API do WhatsApp
          if (message.image?.id) {
            const imageUrl = await downloadWhatsAppMedia(message.image.id)
            if (imageUrl) rawImages.push(imageUrl)
          }
          if (message.image?.caption) {
            rawText = message.image.caption
          }
          break

        case 'document':
          // Pode ser CSV/Excel - tratar à parte
          console.log('📄 Documento recebido, processar manualmente')
          continue

        default:
          continue
      }

      // Se não tem texto, pular
      if (!rawText && rawImages.length === 0) continue

      // Parser
      const parseResult = rawText ? parseProductText(rawText) : {
        parsed_name: undefined,
        parsed_category: undefined,
        parsed_sizes: [],
        parsed_colors: [],
        parsed_price: undefined,
        parsed_original_price: undefined,
        parsed_brand: undefined,
        parsed_reference: undefined,
        parsed_fabric: undefined,
        parsed_description: undefined,
        parsed_occasion: [],
        parsed_fit: undefined,
        parsed_length: undefined,
        parsed_pattern: undefined,
        parsed_style_tags: [],
        confidence_score: 0,
        warnings: ['Apenas imagem recebida, sem texto para parsing'],
      }

      // Salvar como PendingItem
      const { error } = await supabase
        .from('pending_items')
        .insert({
          raw_text: rawText || null,
          raw_images: rawImages,
          ...parseResult,
          source: 'whatsapp',
          source_message_id: messageId,
          source_phone: from,
          status: 'pending',
        })

      if (error) {
        console.error('❌ Erro ao salvar pending item:', error)
      } else {
        console.log(`✅ PendingItem criado via WhatsApp de ${from}`)
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

// ============================================
// Helper: Baixar mídia do WhatsApp
// ============================================
async function downloadWhatsAppMedia(mediaId: string): Promise<string | null> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  if (!token) {
    console.warn('⚠️ WHATSAPP_ACCESS_TOKEN not set, skipping media download')
    return null
  }

  try {
    // Passo 1: Obter URL da mídia
    const mediaRes = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const mediaData = await mediaRes.json()

    if (!mediaData.url) return null

    // Passo 2: Baixar o arquivo
    const fileRes = await fetch(mediaData.url, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const blob = await fileRes.blob()

    // Passo 3: Upload para Supabase Storage
    const supabase = getServiceClient()
    const filename = `whatsapp/${Date.now()}_${mediaId}.jpg`

    const { error } = await supabase.storage
      .from('products')
      .upload(filename, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      })

    if (error) {
      console.error('❌ Upload error:', error)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filename)

    return publicUrl
  } catch (error) {
    console.error('❌ Media download error:', error)
    return null
  }
}
