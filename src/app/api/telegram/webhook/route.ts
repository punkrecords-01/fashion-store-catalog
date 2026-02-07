// ============================================
// API: Telegram Webhook
// ============================================
// Recebe mensagens do Telegram e cria PendingItems automaticamente
// 
// Configuração:
// 1. Criar bot no @BotFather e pegar o TOKEN
// 2. Definir TELEGRAM_BOT_TOKEN no .env
// 3. Webhook URL: https://seudominio.com/api/telegram/webhook

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { parseProductText } from '@/lib/parser'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // O Telegram manda as mensagens dentro de 'message'
    const message = body.message
    if (!message) return NextResponse.json({ ok: true })

    const chatId = message.chat.id
    const text = message.text || message.caption || ''
    const messageId = message.message_id.toString()

    // Se não tiver texto ou foto, ignorar
    if (!text && !message.photo) {
      return NextResponse.json({ ok: true })
    }

    const supabase = getServiceClient()

    // Verificar se já processamos
    const { data: existing } = await supabase
      .from('pending_items')
      .select('id')
      .eq('source_message_id', messageId)
      .eq('source', 'telegram')
      .single()

    if (existing) return NextResponse.json({ ok: true })

    // Se tiver foto, o Telegram manda uma lista de tamanhos, pegamos o maior
    const rawImages: string[] = []
    if (message.photo) {
      // Nota: Para baixar a foto mesmo, precisaríamos de uma chamada extra à API do Telegram
      // Por enquanto, vamos marcar que existe uma foto pendente.
      console.log('📸 Foto recebida via Telegram')
    }

    // Usar o nosso robô inteligente para ler o texto
    const parseResult = parseProductText(text)

    // Salvar na fila de aprovação
    const { error } = await supabase
      .from('pending_items')
      .insert({
        raw_text: text || null,
        raw_images: rawImages,
        ...parseResult,
        source: 'telegram',
        source_message_id: messageId,
        source_phone: chatId.toString(), // No Telegram usamos o ID do Chat
        status: 'pending',
      })

    if (error) {
      console.error('❌ Erro no banco:', error)
      return NextResponse.json({ error: 'DB Error' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('❌ Telegram Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
