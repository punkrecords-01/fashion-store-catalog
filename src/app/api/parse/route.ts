// ============================================
// API: Parse de texto (para preview no admin)
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { parseProductText, parseProductHybrid } from '@/lib/parser'

export async function POST(request: NextRequest) {
  try {
    const { text, useAI = false } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Texto é obrigatório' }, { status: 400 })
    }

    let result
    if (useAI) {
      result = await parseProductHybrid(text, true)
    } else {
      result = parseProductText(text)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Parse error:', error)
    return NextResponse.json({ error: 'Erro no parsing' }, { status: 500 })
  }
}
