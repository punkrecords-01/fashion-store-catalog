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

    const botToken = process.env.TELEGRAM_BOT_TOKEN
    
    // Se tiver foto, o Telegram manda uma lista de tamanhos, pegamos o maior
    const rawImages: string[] = []
    let debugPhoto = ''

    if (message.photo) {
      const photo = message.photo[message.photo.length - 1]
      const fileId = photo.file_id
      
      try {
        const fileResponse = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`)
        const fileData = await fileResponse.json()
        
        if (fileData.ok) {
          const filePath = fileData.result.file_path
          const imageUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`
          rawImages.push(imageUrl)
        } else {
          debugPhoto = `[Erro Telegram: ${fileData.description}]`
        }
      } catch (err) {
        debugPhoto = `[Erro Fetch: ${err instanceof Error ? err.message : 'Unknown'}]`
      }
    }

    // Usar o nosso robô inteligente para ler o texto
    const parseResult = parseProductText(text)

    // Salvar na fila de aprovação
    const { error } = await supabase
      .from('pending_items')
      .insert({
        raw_text: text + (debugPhoto ? '\n' + debugPhoto : ''),
        raw_images: rawImages,
        ...parseResult,
        source: 'telegram',
        source_message_id: messageId,
        source_phone: chatId.toString(),
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
