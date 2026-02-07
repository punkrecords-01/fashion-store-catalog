// ============================================
// Product (Peça)
// ============================================

export type ProductStatus = 'available' | 'last_unit' | 'outlet' | 'sold'

export type ProductCategory =
  | 'vestido'
  | 'blusa'
  | 'calca'
  | 'saia'
  | 'shorts'
  | 'macacao'
  | 'conjunto'
  | 'bolsa'
  | 'cinto'
  | 'bijuteria'
  | 'acessorio'

export type ProductSize = 'PP' | 'P' | 'M' | 'G' | 'GG' | 'U' | '33' | '34' | '35' | '36' | '37' | '38' | '39' | '40' | '41' | '42' // U = Único

export type ProductColor =
  | 'preto'
  | 'branco'
  | 'cinza'
  | 'bege'
  | 'marrom'
  | 'azul'
  | 'azul_claro'
  | 'verde'
  | 'verde_claro'
  | 'vermelho'
  | 'rosa'
  | 'roxo'
  | 'amarelo'
  | 'laranja'
  | 'dourado'
  | 'prata'
  | 'estampado'
  | 'multicolor'

export type ProductStyleTag =
  | 'casual'
  | 'festa'
  | 'trabalho'
  | 'praia'
  | 'trendy'
  | 'basico'
  | 'elegante'
  | 'romantico'
  | 'esportivo'

// ============================================
// NOVOS TIPOS PARA FILTROS AVANÇADOS
// ============================================

export type ProductFabric =
  | 'algodao'
  | 'poliester'
  | 'viscose'
  | 'linho'
  | 'seda'
  | 'jeans'
  | 'couro'
  | 'couro_sintetico'
  | 'trico'
  | 'la'
  | 'moletom'
  | 'crepe'
  | 'renda'
  | 'chiffon'
  | 'cetim'
  | 'veludo'
  | 'neoprene'
  | 'outro'

export type ProductOccasion =
  | 'casual'
  | 'trabalho'
  | 'festa'
  | 'praia'
  | 'evento_formal'
  | 'dia_a_dia'

export type ProductFit =
  | 'ajustado'
  | 'regular'
  | 'solto'
  | 'oversized'
  | 'slim'

export type ProductLength =
  | 'curto'
  | 'medio'
  | 'midi'
  | 'longo'
  | 'cropped'

export type ProductPattern =
  | 'liso'
  | 'floral'
  | 'listrado'
  | 'xadrez'
  | 'poa'
  | 'animal_print'
  | 'geometrico'
  | 'abstrato'
  | 'tie_dye'
  | 'estampado'

export interface Product {
  id: string
  name: string
  reference_code?: string
  category: ProductCategory
  colors: ProductColor[]
  style_tags: ProductStyleTag[]
  sizes: ProductSize[]
  price: number
  original_price?: number // Para outlet/promoção
  status: ProductStatus
  images: string[] // URLs do Supabase Storage
  description?: string
  // Novos campos para filtros avançados
  fabric?: ProductFabric
  occasion?: ProductOccasion[]
  fit?: ProductFit
  length?: ProductLength
  pattern?: ProductPattern
  brand?: string
  created_at: string
  updated_at: string
}

export interface ProductInsert extends Omit<Product, 'id' | 'created_at' | 'updated_at'> {}

export interface ProductUpdate extends Partial<ProductInsert> {}

// ============================================
// Collection (Curadoria)
// ============================================

export type CollectionBlock = 
  | { type: 'text'; content: string }
  | { type: 'image'; url: string; alt?: string; caption?: string }
  | { 
      type: 'shoppable_image'; 
      url: string; 
      alt?: string; 
      markers: { x: number; y: number; productId: string }[] 
    }

export interface Collection {
  id: string
  title: string
  subtitle?: string
  description?: string
  slug: string
  product_ids: string[]
  cover_image?: string
  content?: CollectionBlock[] // Conteúdo rico estilo blogpost/lookbook
  published: boolean
  display_order: number // Para ordenar as coleções na home
  created_at: string
  updated_at: string
}

export interface CollectionInsert extends Omit<Collection, 'id' | 'created_at' | 'updated_at'> {}

export interface CollectionUpdate extends Partial<CollectionInsert> {}

// Collection com produtos populados
export interface CollectionWithProducts extends Collection {
  products: Product[]
}

// ============================================
// Filters (Para o catálogo)
// ============================================

export interface CatalogFilters {
  category?: ProductCategory | ProductCategory[]
  color?: ProductColor | ProductColor[]
  style?: ProductStyleTag | ProductStyleTag[]
  size?: ProductSize | ProductSize[]
  status?: ProductStatus | ProductStatus[]
  fabric?: ProductFabric | ProductFabric[]
  occasion?: ProductOccasion | ProductOccasion[]
  fit?: ProductFit | ProductFit[]
  length?: ProductLength | ProductLength[]
  pattern?: ProductPattern | ProductPattern[]
  brand?: string | string[]
  minPrice?: number
  maxPrice?: number
  search?: string
}

// ============================================
// UI Helpers
// ============================================

export interface FilterOption<T> {
  value: T
  label: string
  count?: number
}

// Labels para exibição
export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  vestido: 'Vestido',
  blusa: 'Blusa',
  calca: 'Calça',
  saia: 'Saia',
  shorts: 'Shorts',
  macacao: 'Macacão',
  conjunto: 'Conjunto',
  bolsa: 'Bolsa',
  cinto: 'Cinto',
  bijuteria: 'Bijuteria',
  acessorio: 'Acessório',
}

export const COLOR_LABELS: Record<ProductColor, string> = {
  preto: 'Preto',
  branco: 'Branco',
  cinza: 'Cinza',
  bege: 'Bege',
  marrom: 'Marrom',
  azul: 'Azul',
  azul_claro: 'Azul Claro',
  verde: 'Verde',
  verde_claro: 'Verde Claro',
  vermelho: 'Vermelho',
  rosa: 'Rosa',
  roxo: 'Roxo',
  amarelo: 'Amarelo',
  laranja: 'Laranja',
  dourado: 'Dourado',
  prata: 'Prata',
  estampado: 'Estampado',
  multicolor: 'Multicolor',
}

export const STYLE_LABELS: Record<ProductStyleTag, string> = {
  casual: 'Casual',
  festa: 'Festa',
  trabalho: 'Trabalho',
  praia: 'Praia',
  trendy: 'Trendy',
  basico: 'Básico',
  elegante: 'Elegante',
  romantico: 'Romântico',
  esportivo: 'Esportivo',
}

export const STATUS_LABELS: Record<ProductStatus, string> = {
  available: 'Disponível',
  last_unit: 'Última Unidade',
  outlet: 'Outlet',
  sold: 'Vendido',
}

export const SIZE_ORDER: ProductSize[] = ['PP', 'P', 'M', 'G', 'GG', 'U', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42']

// ============================================
// NOVOS LABELS PARA FILTROS AVANÇADOS
// ============================================

export const FABRIC_LABELS: Record<ProductFabric, string> = {
  algodao: 'Algodão',
  poliester: 'Poliéster',
  viscose: 'Viscose',
  linho: 'Linho',
  seda: 'Seda',
  jeans: 'Jeans',
  couro: 'Couro',
  couro_sintetico: 'Couro Sintético',
  trico: 'Tricô',
  la: 'Lã',
  moletom: 'Moletom',
  crepe: 'Crepe',
  renda: 'Renda',
  chiffon: 'Chiffon',
  cetim: 'Cetim',
  veludo: 'Veludo',
  neoprene: 'Neoprene',
  outro: 'Outro',
}

export const OCCASION_LABELS: Record<ProductOccasion, string> = {
  casual: 'Casual',
  trabalho: 'Trabalho',
  festa: 'Festa',
  praia: 'Praia',
  evento_formal: 'Evento Formal',
  dia_a_dia: 'Dia a Dia',
}

export const FIT_LABELS: Record<ProductFit, string> = {
  ajustado: 'Ajustado',
  regular: 'Regular',
  solto: 'Solto',
  oversized: 'Oversized',
  slim: 'Slim',
}

export const LENGTH_LABELS: Record<ProductLength, string> = {
  curto: 'Curto',
  medio: 'Médio',
  midi: 'Midi',
  longo: 'Longo',
  cropped: 'Cropped',
}

export const PATTERN_LABELS: Record<ProductPattern, string> = {
  liso: 'Liso',
  floral: 'Floral',
  listrado: 'Listrado',
  xadrez: 'Xadrez',
  poa: 'Poá',
  animal_print: 'Animal Print',
  geometrico: 'Geométrico',
  abstrato: 'Abstrato',
  tie_dye: 'Tie Dye',
  estampado: 'Estampado',
}

export const BRAND_LABELS: Record<string, string> = {
  'itscouture': "It's Couture",
  'farm': 'Farm',
  'animale': 'Animale',
  'zara': 'Zara',
  'arezzo': 'Arezzo',
  'schutz': 'Schutz',
  'outra': 'Outra',
}

// Faixas de preço para filtros
export const PRICE_RANGES = [
  { min: 0, max: 100, label: 'Até R$ 100' },
  { min: 100, max: 200, label: 'R$ 100 - R$ 200' },
  { min: 200, max: 300, label: 'R$ 200 - R$ 300' },
  { min: 300, max: 500, label: 'R$ 300 - R$ 500' },
  { min: 500, max: Infinity, label: 'Acima de R$ 500' },
]

// ============================================
// PendingItem (Fila de Aprovação)
// ============================================

export type PendingItemStatus = 'pending' | 'approved' | 'rejected' | 'merged'
export type PendingItemSource = 'whatsapp' | 'telegram' | 'csv' | 'manual'

export interface PendingItem {
  id: string
  raw_text?: string
  raw_images: string[]
  parsed_name?: string
  parsed_category?: string
  parsed_sizes: string[]
  parsed_colors: string[]
  parsed_price?: number
  parsed_original_price?: number
  parsed_brand?: string
  parsed_reference?: string
  parsed_fabric?: string
  parsed_description?: string
  parsed_occasion: string[]
  parsed_fit?: string
  parsed_length?: string
  parsed_pattern?: string
  parsed_style_tags: string[]
  confidence_score: number
  warnings: string[]
  source: PendingItemSource
  source_message_id?: string
  source_phone?: string
  status: PendingItemStatus
  reviewed_by?: string
  reviewed_at?: string
  merged_product_id?: string
  created_at: string
  updated_at: string
}

export interface PendingItemInsert extends Omit<PendingItem, 'id' | 'created_at' | 'updated_at' | 'reviewed_by' | 'reviewed_at' | 'merged_product_id'> {}

// Resultado do parser
export interface ParseResult {
  parsed_name?: string
  parsed_category?: string
  parsed_sizes: string[]
  parsed_colors: string[]
  parsed_price?: number
  parsed_original_price?: number
  parsed_brand?: string
  parsed_reference?: string
  parsed_fabric?: string
  parsed_description?: string
  parsed_occasion: string[]
  parsed_fit?: string
  parsed_length?: string
  parsed_pattern?: string
  parsed_style_tags: string[]
  confidence_score: number
  warnings: string[]
}
