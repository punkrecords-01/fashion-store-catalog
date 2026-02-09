// ============================================
// Parser Híbrido: Regex + Dicionários + IA Opcional
// ============================================
// Extrai dados estruturados de texto livre (ex: mensagens de WhatsApp)

import {
  ProductCategory,
  ProductColor,
  ProductSize,
  ProductFabric,
  ProductFit,
  ProductLength,
  ProductPattern,
  ProductOccasion,
  ProductStyleTag,
  ParseResult,
} from '@/types'

// ============================================
// DICIONÁRIOS DE NORMALIZAÇÃO
// ============================================

const SIZE_MAP: Record<string, ProductSize> = {
  // Padrão
  'pp': 'PP', 'p': 'P', 'm': 'M', 'g': 'G', 'gg': 'GG', 'u': 'U',
  // Numéricos BR (Roupas)
  '34': 'PP', '36': 'P', '38': 'M', '40': 'G', '42': 'GG', '44': 'GG',
  // Calçados (Mapeamos para o número literal se necessário, mas aqui vamos manter o padrão)
  '35': '35' as any, '37': '37' as any, '39': '39' as any,
  // Inglês
  'xs': 'PP', 'xsmall': 'PP', 'extra small': 'PP',
  's': 'P', 'small': 'P', 'pequeno': 'P', 'pequena': 'P',
  'medium': 'M', 'medio': 'M', 'média': 'M', 'médio': 'M',
  'l': 'G', 'large': 'G', 'grande': 'G',
  'xl': 'GG', 'xlarge': 'GG', 'extra grande': 'GG',
  'unico': 'U', 'único': 'U', 'tam unico': 'U', 'tamanho unico': 'U', 'tamanho único': 'U',
  'one size': 'U', 'os': 'U',
}

const COLOR_MAP: Record<string, ProductColor> = {
  'preto': 'preto', 'preta': 'preto', 'black': 'preto', 'negro': 'preto',
  'branco': 'branco', 'branca': 'branco', 'white': 'branco', 'off white': 'branco', 'off-white': 'branco',
  'cinza': 'cinza', 'grey': 'cinza', 'gray': 'cinza',
  'bege': 'bege', 'nude': 'bege', 'creme': 'bege', 'cream': 'bege', 'areia': 'bege',
  'marrom': 'marrom', 'brown': 'marrom', 'caramelo': 'marrom', 'chocolate': 'marrom', 'café': 'marrom', 'terra': 'marrom', 'terracota': 'marrom',
  'azul': 'azul', 'blue': 'azul', 'navy': 'azul', 'marinho': 'azul', 'azul marinho': 'azul', 'royal': 'azul',
  'azul claro': 'azul_claro', 'azul bebê': 'azul_claro', 'baby blue': 'azul_claro', 'celeste': 'azul_claro',
  'verde': 'verde', 'green': 'verde', 'militar': 'verde', 'verde militar': 'verde', 'verde escuro': 'verde', 'esmeralda': 'verde',
  'verde claro': 'verde_claro', 'menta': 'verde_claro', 'mint': 'verde_claro', 'verde água': 'verde_claro',
  'vermelho': 'vermelho', 'vermelha': 'vermelho', 'red': 'vermelho', 'bordô': 'vermelho', 'vinho': 'vermelho', 'marsala': 'vermelho',
  'rosa': 'rosa', 'pink': 'rosa', 'rosê': 'rosa', 'fúcsia': 'rosa', 'magenta': 'rosa', 'salmão': 'rosa',
  'roxo': 'roxo', 'roxa': 'roxo', 'purple': 'roxo', 'lilás': 'roxo', 'violeta': 'roxo', 'lavanda': 'roxo',
  'amarelo': 'amarelo', 'amarela': 'amarelo', 'yellow': 'amarelo', 'mostarda': 'amarelo',
  'laranja': 'laranja', 'orange': 'laranja', 'coral': 'laranja',
  'dourado': 'dourado', 'gold': 'dourado', 'ouro': 'dourado',
  'prata': 'prata', 'silver': 'prata', 'prateado': 'prata', 'prateada': 'prata',
  'estampado': 'estampado', 'estampada': 'estampado',
  'multicolor': 'multicolor', 'colorido': 'multicolor', 'colorida': 'multicolor',
}

const CATEGORY_MAP: Record<string, ProductCategory> = {
  'vestido': 'vestido', 'dress': 'vestido',
  'blusa': 'blusa', 'camisa': 'blusa', 'top': 'blusa', 'camiseta': 'blusa', 'cropped': 'blusa', 'body': 'blusa', 'regata': 'blusa',
  'calça': 'calca', 'calca': 'calca', 'pants': 'calca', 'jeans': 'calca', 'legging': 'calca',
  'saia': 'saia', 'skirt': 'saia',
  'shorts': 'shorts', 'short': 'shorts', 'bermuda': 'shorts',
  'macacão': 'macacao', 'macacao': 'macacao', 'jumpsuit': 'macacao', 'jardineira': 'macacao',
  'conjunto': 'conjunto', 'set': 'conjunto', 'twin set': 'conjunto', 'twinset': 'conjunto',
  'bolsa': 'bolsa', 'bag': 'bolsa', 'clutch': 'bolsa', 'mochila': 'bolsa', 'carteira': 'bolsa',
  'cinto': 'cinto', 'belt': 'cinto',
  'bijuteria': 'bijuteria', 'brinco': 'bijuteria', 'colar': 'bijuteria', 'pulseira': 'bijuteria', 'anel': 'bijuteria',
  'acessorio': 'acessorio', 'acessório': 'acessorio', 'lenço': 'acessorio', 'chapéu': 'acessorio', 'boné': 'acessorio', 'óculos': 'acessorio',
}

const BRAND_MAP: Record<string, string> = {
  "it's couture": 'itscouture', 'its couture': 'itscouture', 'itscouture': 'itscouture', 'couture': 'itscouture',
  'farm': 'farm', 'farm rio': 'farm',
  'animale': 'animale',
  'zara': 'zara',
  'arezzo': 'arezzo',
  'schutz': 'schutz',
  'amissima': 'amissima', 'amíssima': 'amissima',
  'lança perfume': 'lanca_perfume', 'lanca perfume': 'lanca_perfume',
  'colcci': 'colcci',
  'morena rosa': 'morena_rosa',
  'maria filó': 'maria_filo', 'maria filo': 'maria_filo',
  'le lis blanc': 'lelis', 'le lis': 'lelis',
  'shoulder': 'shoulder',
  'cris barros': 'cris_barros',
  'mixed': 'mixed',
  'bobstore': 'bobstore',
  'tigresse': 'tigresse',
}

const FABRIC_MAP: Record<string, ProductFabric> = {
  'algodão': 'algodao', 'algodao': 'algodao', 'cotton': 'algodao',
  'poliéster': 'poliester', 'poliester': 'poliester', 'polyester': 'poliester',
  'viscose': 'viscose',
  'linho': 'linho', 'linen': 'linho',
  'seda': 'seda', 'silk': 'seda',
  'jeans': 'jeans', 'denim': 'jeans',
  'couro': 'couro', 'leather': 'couro',
  'couro sintético': 'couro_sintetico', 'couro sintetico': 'couro_sintetico', 'eco couro': 'couro_sintetico',
  'tricô': 'trico', 'trico': 'trico', 'tricot': 'trico', 'knit': 'trico',
  'lã': 'la', 'la': 'la', 'wool': 'la',
  'moletom': 'moletom', 'fleece': 'moletom',
  'crepe': 'crepe',
  'renda': 'renda', 'lace': 'renda',
  'chiffon': 'chiffon',
  'cetim': 'cetim', 'satin': 'cetim',
  'veludo': 'veludo', 'velvet': 'veludo',
  'neoprene': 'neoprene',
}

// ============================================
// FUNÇÕES DE PARSING
// ============================================

/**
 * Extrai referência/código do texto
 */
function parseReference(text: string): string | undefined {
  // Padrões: "ref 12345", "ref. 12345", "REF:12345", "código 12345", "#ABC123"
  const patterns = [
    /(?:ref\.?|referência|referencia|código|codigo|cod\.?|#)\s*:?\s*([A-Z0-9\-\.]+)/i,
    /\b([A-Z]{2,3}\d{3,8})\b/, // Ex: VM001, ABC12345
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[1].toUpperCase()
  }
  return undefined
}

/**
 * Extrai tamanhos do texto
 */
function parseSizes(text: string): ProductSize[] {
  const sizes = new Set<ProductSize>()
  const normalized = text.toLowerCase()

  // Padrão com separadores: "p m g", "p, m, g", "P/M/G", "tamanhos: P, M, G"
  const sizeBlockPattern = /(?:tam(?:anho)?s?\.?\s*:?\s*)?((?:[pP]{1,2}|[mM]|[gG]{1,2}|[uU]|[xX][sSlL]|[sSlL]|\d{2})[\s,\/\-]+){1,}(?:[pP]{1,2}|[mM]|[gG]{1,2}|[uU]|[xX][sSlL]|[sSlL]|\d{2})/i
  const blockMatch = normalized.match(sizeBlockPattern)

  if (blockMatch) {
    const block = blockMatch[0].replace(/tam(?:anho)?s?\.?\s*:?\s*/i, '')
    const parts = block.split(/[\s,\/\-]+/).filter(Boolean)
    for (const part of parts) {
      const mapped = SIZE_MAP[part.trim()]
      if (mapped) sizes.add(mapped)
    }
  }

  // Busca individual por menções isoladas
  for (const [key, value] of Object.entries(SIZE_MAP)) {
    // Evitar falsos positivos com letras isoladas - só para termos com > 1 char
    if (key.length <= 1) continue
    if (normalized.includes(key)) {
      sizes.add(value)
    }
  }

  // Busca letras isoladas somente se encontradas agrupadas (ex: "p m g")
  const isolatedPattern = /\b([pP]{1,2}|[mM]|[gG]{1,2}|[uU])\b/g
  const isolatedMatches = text.match(isolatedPattern)
  if (isolatedMatches && isolatedMatches.length >= 2) {
    for (const m of isolatedMatches) {
      const mapped = SIZE_MAP[m.toLowerCase()]
      if (mapped) sizes.add(mapped)
    }
  }

  return Array.from(sizes)
}

/**
 * Extrai cores do texto
 */
function parseColors(text: string): ProductColor[] {
  const colors = new Set<ProductColor>()
  const normalized = text.toLowerCase()

  // Buscar cores - priorizar termos compostos
  const sortedEntries = Object.entries(COLOR_MAP).sort(
    (a, b) => b[0].length - a[0].length
  )

  for (const [key, value] of sortedEntries) {
    if (normalized.includes(key)) {
      colors.add(value)
    }
  }

  return Array.from(colors)
}

/**
 * Extrai categoria do texto
 */
function parseCategory(text: string): ProductCategory | undefined {
  const normalized = text.toLowerCase()

  const sortedEntries = Object.entries(CATEGORY_MAP).sort(
    (a, b) => b[0].length - a[0].length
  )

  for (const [key, value] of sortedEntries) {
    if (normalized.includes(key)) {
      return value
    }
  }
  return undefined
}

/**
 * Extrai marca do texto
 */
function parseBrand(text: string): string | undefined {
  const normalized = text.toLowerCase()

  const sortedEntries = Object.entries(BRAND_MAP).sort(
    (a, b) => b[0].length - a[0].length
  )

  for (const [key, value] of sortedEntries) {
    if (normalized.includes(key)) {
      return value
    }
  }
  return undefined
}

/**
 * Extrai preço do texto
 */
function parsePrice(text: string): { price?: number; originalPrice?: number } {
  const patterns = [
    /R\$\s*([\d.,]+)/g,
    /(?:preço|preco|valor|por|de)\s*:?\s*R?\$?\s*([\d.,]+)/gi,
    /\b(\d{2,4}[.,]\d{2})\b/g, // Ex: 189,90 ou 189.90
  ]

  const prices: number[] = []

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const val = parseFloat(match[1].replace('.', '').replace(',', '.'))
      if (val > 0 && val < 100000) {
        prices.push(val)
      }
    }
  }

  // Deduplica
  const unique = Array.from(new Set(prices))

  if (unique.length === 0) return {}
  if (unique.length === 1) return { price: unique[0] }

  // Se tem dois preços, o maior é o original
  unique.sort((a, b) => b - a)
  return { originalPrice: unique[0], price: unique[1] }
}

/**
 * Extrai tecido do texto
 */
function parseFabric(text: string): ProductFabric | undefined {
  const normalized = text.toLowerCase()

  const sortedEntries = Object.entries(FABRIC_MAP).sort(
    (a, b) => b[0].length - a[0].length
  )

  for (const [key, value] of sortedEntries) {
    if (normalized.includes(key)) {
      return value
    }
  }
  return undefined
}

/**
 * Calcula score de confiança baseado nos campos preenchidos
 */
function calculateConfidence(result: Partial<ParseResult>): number {
  let score = 0
  let maxScore = 0

  // Pesos por campo
  const weights: Record<string, number> = {
    parsed_name: 3,
    parsed_category: 2,
    parsed_sizes: 2,
    parsed_colors: 1.5,
    parsed_price: 2,
    parsed_brand: 1,
    parsed_reference: 1.5,
    parsed_fabric: 1,
  }

  for (const [field, weight] of Object.entries(weights)) {
    maxScore += weight
    const value = (result as Record<string, unknown>)[field]
    if (value !== undefined && value !== null) {
      if (Array.isArray(value) && value.length > 0) {
        score += weight
      } else if (!Array.isArray(value) && value !== '') {
        score += weight
      }
    }
  }

  return Math.round((score / maxScore) * 100) / 100
}

/**
 * Gera warnings baseado nos campos faltantes ou ambíguos
 */
function generateWarnings(result: Partial<ParseResult>): string[] {
  const warnings: string[] = []

  if (!result.parsed_name) {
    warnings.push('Nome do produto não identificado')
  }
  if (!result.parsed_category) {
    warnings.push('Categoria não identificada')
  }
  if (!result.parsed_sizes || result.parsed_sizes.length === 0) {
    warnings.push('Tamanhos não identificados')
  }
  if (!result.parsed_colors || result.parsed_colors.length === 0) {
    warnings.push('Cores não identificadas')
  }
  if (!result.parsed_price) {
    warnings.push('Preço não identificado')
  }
  if (!result.parsed_reference) {
    warnings.push('Código de referência não encontrado')
  }

  return warnings
}

/**
 * Tenta extrair nome "inteligente" do texto.
 * Remove partes que foram parseadas (ref, tamanhos, preço) e pega a parte restante significativa.
 */
function parseName(text: string): string | undefined {
  // Remove referência
  let cleaned = text.replace(/(?:ref\.?|referência|referencia|código|codigo|cod\.?|#)\s*:?\s*[A-Z0-9\-\.]+/gi, '')
  // Remove preços
  cleaned = cleaned.replace(/R\$\s*[\d.,]+/g, '')
  cleaned = cleaned.replace(/(?:preço|preco|valor|por|de)\s*:?\s*R?\$?\s*[\d.,]+/gi, '')
  
  // Remove seções técnicas inteiras (Tamanhos: ..., Cores: ..., Cor: ...)
  cleaned = cleaned.replace(/(?:tamanhos?|tam\.?|cores?|cor)\s*:?\s*.*?(?=\.|$|,)/gi, '')
  
  // Remove faixas de números (Sapatos: 35 ao 39, 35-39)
  cleaned = cleaned.replace(/\b\d{2}\s*(?:ao|a|-|à)\s*\d{2}\b/g, '')

  // Remove tamanhos isolados (letras P, M, G...)
  cleaned = cleaned.replace(/\b(tam(?:anho)?s?\.?\s*:?\s*)?([pP]{1,2}|[mM]|[gG]{1,2}|[uU])(?:\s*[,\/\-]\s*(?:[pP]{1,2}|[mM]|[gG]{1,2}|[uU]))*\b/gi, '')
  
  // Remove pontos, virgulas e espaços extras que sobraram
  cleaned = cleaned.replace(/\s*,\s*/g, ', ').replace(/\s*[\.\:\-]\s*$/g, '').replace(/\s+/g, ' ').trim()
  // Remove vírgulas no início/fim
  cleaned = cleaned.replace(/^[,\s]+|[,\s]+$/g, '').trim()

  if (cleaned.length < 3) return undefined

  // Capitalizar
  return cleaned
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

// ============================================
// PARSER PRINCIPAL
// ============================================

export function parseProductText(rawText: string): ParseResult {
  const reference = parseReference(rawText)
  const sizes = parseSizes(rawText)
  const colors = parseColors(rawText)
  const category = parseCategory(rawText)
  const brand = parseBrand(rawText)
  const { price, originalPrice } = parsePrice(rawText)
  const fabric = parseFabric(rawText)
  const name = parseName(rawText)

  const result: ParseResult = {
    parsed_name: name,
    parsed_category: category,
    parsed_sizes: sizes,
    parsed_colors: colors,
    parsed_price: price,
    parsed_original_price: originalPrice,
    parsed_brand: brand,
    parsed_reference: reference,
    parsed_fabric: fabric,
    parsed_description: undefined,
    parsed_occasion: [],
    parsed_fit: undefined,
    parsed_length: undefined,
    parsed_pattern: undefined,
    parsed_style_tags: [],
    confidence_score: 0,
    warnings: [],
  }

  result.confidence_score = calculateConfidence(result)
  result.warnings = generateWarnings(result)

  return result
}

// ============================================
// IA OPCIONAL (Ollama)
// ============================================

const OLLAMA_PROMPT = `Você é um assistente especializado em moda feminina brasileira. 
Extraia informações estruturadas do texto abaixo sobre um produto de moda.
Responda APENAS com um JSON válido, sem explicações.

Campos esperados:
- name: nome do produto (string)
- category: uma de: vestido, blusa, calca, saia, shorts, macacao, conjunto, bolsa, cinto, bijuteria, acessorio
- sizes: array de tamanhos normalizados (PP, P, M, G, GG, U)
- colors: array de cores em português
- price: preço numérico
- brand: marca se mencionada
- reference: código de referência
- fabric: tecido/material
- description: descrição curta

Texto: `

export async function parseWithAI(rawText: string): Promise<Partial<ParseResult>> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434'

  try {
    const response = await fetch(`${ollamaUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || 'mistral',
        prompt: OLLAMA_PROMPT + rawText,
        stream: false,
        format: 'json',
      }),
    })

    if (!response.ok) {
      console.warn('Ollama not available, skipping AI parsing')
      return {}
    }

    const data = await response.json()
    const parsed = JSON.parse(data.response)

    // Mapear resultado da IA para ParseResult
    return {
      parsed_name: parsed.name,
      parsed_category: parsed.category,
      parsed_sizes: parsed.sizes || [],
      parsed_colors: parsed.colors || [],
      parsed_price: parsed.price,
      parsed_brand: parsed.brand,
      parsed_reference: parsed.reference,
      parsed_fabric: parsed.fabric,
      parsed_description: parsed.description,
    }
  } catch (error) {
    console.warn('AI parsing failed:', error)
    return {}
  }
}

/**
 * Parser híbrido: Regex primeiro, IA complementa campos vazios
 */
export async function parseProductHybrid(rawText: string, useAI = false): Promise<ParseResult> {
  // 1. Parser manual (regex + dicionários)
  const manualResult = parseProductText(rawText)

  if (!useAI) return manualResult

  // 2. Se confiança < 0.5, tenta IA
  if (manualResult.confidence_score < 0.5) {
    try {
      const aiResult = await parseWithAI(rawText)

      // Preencher campos vazios com resultado da IA
      if (!manualResult.parsed_name && aiResult.parsed_name) {
        manualResult.parsed_name = aiResult.parsed_name
      }
      if (!manualResult.parsed_category && aiResult.parsed_category) {
        manualResult.parsed_category = aiResult.parsed_category
      }
      if (manualResult.parsed_sizes.length === 0 && aiResult.parsed_sizes?.length) {
        manualResult.parsed_sizes = aiResult.parsed_sizes
      }
      if (manualResult.parsed_colors.length === 0 && aiResult.parsed_colors?.length) {
        manualResult.parsed_colors = aiResult.parsed_colors
      }
      if (!manualResult.parsed_price && aiResult.parsed_price) {
        manualResult.parsed_price = aiResult.parsed_price
      }
      if (!manualResult.parsed_brand && aiResult.parsed_brand) {
        manualResult.parsed_brand = aiResult.parsed_brand
      }
      if (!manualResult.parsed_reference && aiResult.parsed_reference) {
        manualResult.parsed_reference = aiResult.parsed_reference
      }
      if (!manualResult.parsed_fabric && aiResult.parsed_fabric) {
        manualResult.parsed_fabric = aiResult.parsed_fabric
      }
      if (!manualResult.parsed_description && aiResult.parsed_description) {
        manualResult.parsed_description = aiResult.parsed_description
      }

      // Recalcular confiança
      manualResult.confidence_score = calculateConfidence(manualResult)
      manualResult.warnings = generateWarnings(manualResult)
    } catch {
      // IA falhou, segue com resultado manual
    }
  }

  return manualResult
}
