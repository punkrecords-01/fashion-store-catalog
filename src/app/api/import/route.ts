// ============================================
// API: Importação de CSV/Excel
// ============================================
// Recebe arquivo CSV ou Excel, parseia e cria PendingItems

import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { createClient } from '@supabase/supabase-js'
import { parseProductText } from '@/lib/parser'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key)
}

// Mapeamento flexível de colunas (aceita vários nomes em PT e EN)
const COLUMN_MAP: Record<string, string> = {
  // Nome
  'nome': 'name', 'name': 'name', 'produto': 'name', 'product': 'name',
  'descricao do produto': 'name', 'descrição do produto': 'name',
  // Referência
  'referencia': 'reference', 'referência': 'reference', 'ref': 'reference',
  'codigo': 'reference', 'código': 'reference', 'cod': 'reference',
  'sku': 'reference', 'reference': 'reference', 'code': 'reference',
  // Categoria
  'categoria': 'category', 'category': 'category', 'tipo': 'category', 'type': 'category',
  // Cor
  'cor': 'color', 'cores': 'color', 'color': 'color', 'colors': 'color',
  // Tamanho
  'tamanho': 'size', 'tamanhos': 'size', 'tam': 'size', 'size': 'size', 'sizes': 'size',
  // Preço
  'preco': 'price', 'preço': 'price', 'price': 'price', 'valor': 'price',
  'preco venda': 'price', 'preço venda': 'price', 'sell price': 'price',
  // Preço original
  'preco original': 'original_price', 'preço original': 'original_price',
  'original price': 'original_price', 'preco de': 'original_price', 'de': 'original_price',
  // Marca
  'marca': 'brand', 'brand': 'brand',
  // Material/Tecido
  'material': 'fabric', 'tecido': 'fabric', 'fabric': 'fabric', 'composição': 'fabric', 'composicao': 'fabric',
  // Descrição
  'descricao': 'description', 'descrição': 'description', 'description': 'description',
  'observação': 'description', 'observacoes': 'description', 'obs': 'description',
  // Quantidade (para info)
  'quantidade': 'quantity', 'qtd': 'quantity', 'estoque': 'quantity', 'stock': 'quantity', 'qty': 'quantity',
}

function normalizeColumnName(name: string): string {
  return COLUMN_MAP[name.toLowerCase().trim()] || name.toLowerCase().trim()
}

function cleanPrice(value: string | number): number | undefined {
  if (typeof value === 'number') return value > 0 ? value : undefined
  if (!value) return undefined
  
  const cleaned = String(value)
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  
  const num = parseFloat(cleaned)
  return isNaN(num) || num <= 0 ? undefined : num
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Arquivo é obrigatório' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Tentar detectar se é um CSV e corrigir o encoding
    let workbook;
    if (file.name.endsWith('.csv')) {
      // Tentar ler como UTF-8 primeiro, se falhar ou parecer estranho, XLSX deve lidar com o buffer
      const text = buffer.toString('utf8');
      workbook = XLSX.read(text, { type: 'string' });
    } else {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    }
    
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

    if (rawData.length === 0) {
      return NextResponse.json({ error: 'Arquivo vazio ou formato não reconhecido' }, { status: 400 })
    }

    // Mapear colunas
    const headers = Object.keys(rawData[0])
    const columnMapping: Record<string, string> = {}
    for (const header of headers) {
      columnMapping[header] = normalizeColumnName(header)
    }

    const supabase = getServiceClient()
    const results = { created: 0, errors: 0, items: [] as Array<{ row: number; name?: string; error?: string }> }

    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i]
      
      // Mapear dados usando o mapeamento de colunas
      const mappedRow: Record<string, string | number> = {}
      for (const [original, normalized] of Object.entries(columnMapping)) {
        mappedRow[normalized] = row[original] as string | number
      }

      try {
        // Tentar usar o parser inteligente (Gemini) se disponível para o CSV também
        const { parseProductSmart } = await import('@/lib/parser')
        
        // Mapear dados usando o mapeamento de colunas
        const combinedText = Object.entries(row)
          .filter(([key]) => !['quantidade', 'estoque', 'descrição', 'descricao'].includes(key.toLowerCase()))
          .map(([_, v]) => v)
          .filter(Boolean)
          .join(' ')

        // O parseResult agora vem da IA se a chave estiver configurada
        const parseResult = await parseProductSmart(String(combinedText))

        // Sobrescrever com dados estruturados das colunas (são mais confiáveis se existirem)
        if (mappedRow.name) parseResult.parsed_name = String(mappedRow.name)
        if (mappedRow.reference) parseResult.parsed_reference = String(mappedRow.reference)
        if (mappedRow.category) {
          const catText = String(mappedRow.category).toLowerCase()
          parseResult.parsed_category = parseResult.parsed_category || catText
        }
        if (mappedRow.color) {
          const colorParsed = parseProductText(String(mappedRow.color))
          if (colorParsed.parsed_colors.length > 0) {
            parseResult.parsed_colors = colorParsed.parsed_colors
          }
        }
        if (mappedRow.size) {
          const sizeParsed = parseProductText(String(mappedRow.size))
          if (sizeParsed.parsed_sizes.length > 0) {
            parseResult.parsed_sizes = sizeParsed.parsed_sizes
          }
        }
        if (mappedRow.price !== undefined) {
          const price = cleanPrice(mappedRow.price)
          if (price) parseResult.parsed_price = price
        }
        if (mappedRow.original_price !== undefined) {
          const op = cleanPrice(mappedRow.original_price)
          if (op) parseResult.parsed_original_price = op
        }
        if (mappedRow.brand) parseResult.parsed_brand = String(mappedRow.brand).toLowerCase()
        if (mappedRow.fabric) parseResult.parsed_fabric = String(mappedRow.fabric).toLowerCase()
        if (mappedRow.description) parseResult.parsed_description = String(mappedRow.description)

        // Inserir como PendingItem
        const { error } = await supabase
          .from('pending_items')
          .insert({
            raw_text: combinedText,
            ...parseResult,
            source: 'csv',
            status: 'pending',
          })

        if (error) {
          results.errors++
          results.items.push({ row: i + 2, name: String(mappedRow.name || ''), error: error.message })
        } else {
          results.created++
          results.items.push({ row: i + 2, name: String(mappedRow.name || parseResult.parsed_name || 'Sem nome') })
        }
      } catch (err) {
        results.errors++
        results.items.push({ row: i + 2, error: String(err) })
      }
    }

    return NextResponse.json({
      message: `Importação concluída: ${results.created} itens criados, ${results.errors} erros`,
      totalRows: rawData.length,
      ...results,
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Erro ao processar arquivo' }, { status: 500 })
  }
}
