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
 * Extrai o NOME do produto de forma inteligente.
 * Estratégia: pegar só as primeiras palavras que descrevem "o que é" o produto,
 * antes de qualquer dado técnico (preço, tamanho, cor, tecido, referência).
 * 
 * Exemplos de entrada → saída:
 *   "Vestido floral R$ 340,00 tamanhos p m e g, verde estampado floral REF 456007 tecido algodao"
 *   → "Vestido Floral"
 *
 *   "Scarpin Couro Preto R$ 590,00. Tamanhos: 35 ao 39."
 *   → "Scarpin Couro"
 *
 *   "Bolsa Bucket Caramelo R$ 280"
 *   → "Bolsa Bucket"
 */
function parseName(text: string): string | undefined {
  const normalized = text.toLowerCase().trim()

  // Montar uma lista de todas as palavras "técnicas" que devem PARAR a extração do nome
  const stopWords = new Set<string>()
  
  // Cores
  for (const key of Object.keys(COLOR_MAP)) {
    key.split(' ').forEach(w => { if (w.length > 2) stopWords.add(w) })
  }
  
  // Tecidos
  for (const key of Object.keys(FABRIC_MAP)) {
    key.split(' ').forEach(w => { if (w.length > 2) stopWords.add(w) })
  }
  
  // Marcas
  const brandWords = new Set<string>()
  for (const key of Object.keys(BRAND_MAP)) {
    key.split(' ').forEach(w => { if (w.length > 2) brandWords.add(w) })
  }

  // Palavras-chave técnicas que indicam fim do nome
  const technicalWords = [
    'tamanho', 'tamanhos', 'tam', 'cores', 'cor', 'tecido', 'material',
    'ref', 'referência', 'referencia', 'código', 'codigo', 'cod',
    'preço', 'preco', 'valor', 'por',
  ]
  technicalWords.forEach(w => stopWords.add(w))

  // Categorias (evitar duplicar no nome)
  for (const key of Object.keys(CATEGORY_MAP)) {
    // Não adicionar a categoria como stop word — ela FAZ parte do nome (ex: "Vestido")
    // Só adicionamos se aparecer pela SEGUNDA vez
  }

  // Separar o texto em palavras
  const words = text.replace(/[.,;:!?\-\/]+/g, ' ').split(/\s+/).filter(Boolean)
  
  const nameWords: string[] = []
  let foundCategory = false

  for (const word of words) {
    const lower = word.toLowerCase()

    // Parar se encontrar preço (R$ ou número > 2 dígitos que parece preço)
    if (/^r\$$/i.test(word) || /^\d{2,}[.,]\d{2}$/.test(word)) break

    // Parar se encontrar um tamanho isolado (P, M, G, GG, PP)
    if (/^(pp|p|m|g|gg|u|xs|s|l|xl)$/i.test(word) && nameWords.length > 0) break

    // Parar se encontrar número puro (referência, tamanho numérico)
    if (/^\d{3,}$/.test(word)) break
    if (/^\d{2}$/.test(word) && nameWords.length > 0) break

    // Parar se encontrar palavra técnica
    if (technicalWords.includes(lower)) break

    // Se encontrar uma marca, adiciona ao nome e PARA por ali (geralmente a marca encerra o título)
    if (brandWords.has(lower)) {
      nameWords.push(word)
      break 
    }

    // Parar se encontrar cor ou tecido (mas só depois de já ter pelo menos 1 palavra de nome)
    if (nameWords.length > 0 && stopWords.has(lower)) break

    // Verificar se é a categoria — a primeira menção entra no nome, a segunda não
    const isCategoryWord = Object.keys(CATEGORY_MAP).includes(lower)
    if (isCategoryWord) {
      if (foundCategory) break // Segunda menção da categoria, parar
      foundCategory = true
    }

    nameWords.push(word)
  }

  if (nameWords.length === 0) return undefined

  // Capitalizar
  const name = nameWords
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .replace(/^[,\s]+|[,\s]+$/g, '')
    .trim()

  return name.length >= 3 ? name : undefined
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
// IA: Google Gemini
// ============================================

const GEMINI_PROMPT = `Você é um parser especializado em moda feminina brasileira.
Extraia informações estruturadas do texto abaixo sobre um produto de moda.
Responda APENAS com JSON válido, sem markdown, sem explicações, sem code blocks.

REGRAS IMPORTANTES PARA O "name":
- O nome deve ser CURTO e descritivo, apenas o tipo de peça + modelo/estilo
- NÃO inclua preço, tamanho, cor, tecido, referência ou marca no nome
- Exemplos bons: "Vestido Midi Floral", "Calça Boca Larga", "Scarpin Bico Fino", "Bolsa Bucket"
- Exemplos RUINS: "Vestido Midi Floral R$340", "Calça Boca Larga Amissima Algodão"

REGRAS PARA "description":
- Crie uma descrição curta e elegante (1-2 frases) para o catálogo, como se fosse uma loja de moda sofisticada
- Use linguagem refinada e aspiracional

Campos esperados (JSON):
{
  "name": "nome curto do produto (tipo + modelo, sem preço/cor/tecido/marca)",
  "category": "uma de: vestido, blusa, calca, saia, shorts, macacao, conjunto, bolsa, cinto, bijuteria, acessorio",
  "sizes": ["array de tamanhos normalizados: PP, P, M, G, GG, U, ou números como 34, 36, 38"],
  "colors": ["array de cores em português lowercase: preto, branco, verde, azul, etc"],
  "price": 0.00,
  "original_price": null,
  "brand": "marca se mencionada, ou null",
  "reference": "código de referência se mencionado, ou null",
  "fabric": "uma de: algodao, poliester, viscose, linho, seda, jeans, couro, trico, crepe, renda, chiffon, cetim, veludo, ou null",
  "description": "descrição elegante curta para o catálogo",
  "occasion": ["array de: casual, trabalho, festa, praia, evento_formal, dia_a_dia"],
  "fit": "uma de: ajustado, regular, solto, oversized, slim, ou null",
  "length": "uma de: curto, medio, midi, longo, cropped, ou null",
  "pattern": "uma de: liso, estampado, listrado, xadrez, floral, poa, animal_print, geometrico, ou null",
  "style_tags": ["array de: casual, festa, trabalho, praia, trendy, basico, elegante, romantico, esportivo"]
}

Texto do produto: `

export async function parseWithGemini(rawText: string): Promise<Partial<ParseResult>> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY não configurada, usando parser manual')
    return {}
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    
    const result = await model.generateContent(GEMINI_PROMPT + rawText)
    const response = result.response.text()
    
    // Limpar possíveis code blocks
    const jsonStr = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(jsonStr)

    return {
      parsed_name: parsed.name || undefined,
      parsed_category: parsed.category || undefined,
      parsed_sizes: parsed.sizes || [],
      parsed_colors: parsed.colors || [],
      parsed_price: parsed.price || undefined,
      parsed_original_price: parsed.original_price || undefined,
      parsed_brand: parsed.brand || undefined,
      parsed_reference: parsed.reference || undefined,
      parsed_fabric: parsed.fabric || undefined,
      parsed_description: parsed.description || undefined,
      parsed_occasion: parsed.occasion || [],
      parsed_fit: parsed.fit || undefined,
      parsed_length: parsed.length || undefined,
      parsed_pattern: parsed.pattern || undefined,
      parsed_style_tags: parsed.style_tags || [],
    }
  } catch (error) {
    console.warn('❌ Gemini parsing failed:', error)
    return {}
  }
}

/**
 * Parser híbrido: Regex primeiro, Gemini complementa e corrige
 */
export async function parseProductSmart(rawText: string): Promise<ParseResult> {
  // 1. Parser manual (regex + dicionários) como base rápida
  const manualResult = parseProductText(rawText)

  // 2. Tentar Gemini para resultado mais inteligente
  try {
    const aiResult = await parseWithGemini(rawText)

    // Se a IA retornou algo, ela SEMPRE vence no nome (é mais inteligente para isso)
    if (aiResult.parsed_name) {
      manualResult.parsed_name = aiResult.parsed_name
    }
    // A IA também vence na descrição (o regex não gera descrição)
    if (aiResult.parsed_description) {
      manualResult.parsed_description = aiResult.parsed_description
    }

    // Para os outros campos, a IA preenche o que o regex não encontrou
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
    if (!manualResult.parsed_original_price && aiResult.parsed_original_price) {
      manualResult.parsed_original_price = aiResult.parsed_original_price
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
    if (manualResult.parsed_occasion.length === 0 && aiResult.parsed_occasion?.length) {
      manualResult.parsed_occasion = aiResult.parsed_occasion
    }
    if (!manualResult.parsed_fit && aiResult.parsed_fit) {
      manualResult.parsed_fit = aiResult.parsed_fit
    }
    if (!manualResult.parsed_length && aiResult.parsed_length) {
      manualResult.parsed_length = aiResult.parsed_length
    }
    if (!manualResult.parsed_pattern && aiResult.parsed_pattern) {
      manualResult.parsed_pattern = aiResult.parsed_pattern
    }
    if (manualResult.parsed_style_tags.length === 0 && aiResult.parsed_style_tags?.length) {
      manualResult.parsed_style_tags = aiResult.parsed_style_tags
    }

    // Recalcular confiança
    manualResult.confidence_score = calculateConfidence(manualResult)
    manualResult.warnings = generateWarnings(manualResult)
  } catch {
    // IA falhou, segue com resultado manual normalmente
    console.warn('⚠️ Gemini não disponível, usando parser manual')
  }

  return manualResult
}
