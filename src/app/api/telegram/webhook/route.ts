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
import { parseProductSmart } from '@/lib/parser'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(url, key)
}

/**
 * Baixa a foto do Telegram e sobe para o Supabase Storage.
 * Retorna a URL pública permanente.
 */
async function downloadAndUploadPhoto(fileId: string, botToken: string): Promise<string | null> {
  const supabase = getServiceClient()

  // 1. Pedir ao Telegram o caminho do arquivo
  const fileRes = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`)
  const fileData = await fileRes.json()

  if (!fileData.ok) {
    console.error('❌ Telegram getFile falhou:', fileData.description)
    return null
  }

  const telegramFilePath = fileData.result.file_path
  const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${telegramFilePath}`

  // 2. Baixar o arquivo binário
  const imageRes = await fetch(downloadUrl)
  if (!imageRes.ok) {
    console.error('❌ Falha ao baixar imagem do Telegram:', imageRes.status)
    return null
  }

  const imageBuffer = await imageRes.arrayBuffer()
  const extension = telegramFilePath.split('.').pop() || 'jpg'
  const fileName = `telegram/${Date.now()}_${Math.random().toString(36).slice(2)}.${extension}`

  // 3. Subir para o Supabase Storage (usando service_role que ignora RLS)
  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(fileName, imageBuffer, {
      contentType: `image/${extension === 'jpg' ? 'jpeg' : extension}`,
      upsert: false,
    })

  if (uploadError) {
    console.error('❌ Erro ao subir para Supabase Storage:', uploadError.message)
    return null
  }

  // 4. Gerar URL pública permanente
  const { data: publicUrl } = supabase.storage
    .from('products')
    .getPublicUrl(fileName)

  console.log('✅ Foto salva permanentemente:', publicUrl.publicUrl)
  return publicUrl.publicUrl
}

export async function POST(request: NextRequest) {
  console.log('🚀 Telegram Webhook v2 - Storage Enabled')
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
    
    // Se tiver foto, baixa do Telegram e sobe pro Supabase Storage
    const rawImages: string[] = []
    let debugInfo = ''

    if (!botToken) {
      debugInfo = '[ERRO: TELEGRAM_BOT_TOKEN não configurado no servidor]'
    } else if (message.photo) {
      // O Telegram envia várias versões, a última é a maior resolução
      const photo = message.photo[message.photo.length - 1]
      
      try {
        const permanentUrl = await downloadAndUploadPhoto(photo.file_id, botToken)
        if (permanentUrl) {
          rawImages.push(permanentUrl)
        } else {
          debugInfo = '[ERRO: Não foi possível salvar a foto. Verifique se o bucket "products" existe no Supabase Storage.]'
        }
      } catch (err) {
        debugInfo = `[ERRO FOTO: ${err instanceof Error ? err.message : 'Erro desconhecido'}]`
      }
    }

    // Usar o parser inteligente (Gemini + Regex) para ler o texto
    const parseResult = await parseProductSmart(text)

    // Salvar na fila de aprovação
    const rawText = [text, debugInfo].filter(Boolean).join('\n')

    const { error } = await supabase
      .from('pending_items')
      .insert({
        raw_text: rawText || null,
        raw_images: rawImages,
        ...parseResult,
        source: 'telegram',
        source_message_id: messageId,
        source_phone: chatId.toString(),
        status: 'pending',
      })

    if (error) {
      console.error('❌ Erro no banco:', error)
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `❌ Erro ao salvar no catálogo: ${error.message}`
        })
      })
      return NextResponse.json({ error: 'DB Error' }, { status: 500 })
    }

    // Responder sucesso no Telegram
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `✅ Recebido! O item "${parseResult.parsed_name || 'Sem nome'}" foi enviado para aprovação no Admin.`
      })
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('❌ Telegram Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
