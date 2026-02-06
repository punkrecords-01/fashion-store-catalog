'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, Camera, X, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  ProductCategory, 
  ProductColor, 
  ProductSize, 
  ProductStyleTag,
  ProductStatus,
  ProductFabric,
  ProductOccasion,
  ProductFit,
  ProductLength,
  ProductPattern,
  CATEGORY_LABELS, 
  COLOR_LABELS, 
  SIZE_ORDER,
  STYLE_LABELS,
  STATUS_LABELS,
  FABRIC_LABELS,
  OCCASION_LABELS,
  FIT_LABELS,
  LENGTH_LABELS,
  PATTERN_LABELS,
  BRAND_LABELS
} from '@/types'
import { cn } from '@/lib/utils'

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]
const COLORS = Object.entries(COLOR_LABELS) as [ProductColor, string][]
const SIZES = SIZE_ORDER
const STYLES = Object.entries(STYLE_LABELS) as [ProductStyleTag, string][]
const STATUSES = Object.entries(STATUS_LABELS).filter(([k]) => k !== 'sold') as [ProductStatus, string][]
const FABRICS = Object.entries(FABRIC_LABELS) as [ProductFabric, string][]
const OCCASIONS = Object.entries(OCCASION_LABELS) as [ProductOccasion, string][]
const FITS = Object.entries(FIT_LABELS) as [ProductFit, string][]
const LENGTHS = Object.entries(LENGTH_LABELS) as [ProductLength, string][]
const PATTERNS = Object.entries(PATTERN_LABELS) as [ProductPattern, string][]
const BRANDS = Object.entries(BRAND_LABELS) as [string, string][]

export default function NewProductPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [uploadingImage, setUploadingImage] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [referenceCode, setReferenceCode] = useState('')
  const [category, setCategory] = useState<ProductCategory>('vestido')
  const [selectedColors, setSelectedColors] = useState<ProductColor[]>([])
  const [selectedSizes, setSelectedSizes] = useState<ProductSize[]>([])
  const [selectedStyles, setSelectedStyles] = useState<ProductStyleTag[]>([])
  const [price, setPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [status, setStatus] = useState<ProductStatus>('available')
  const [description, setDescription] = useState('')
  const [brand, setBrand] = useState('')
  
  // Novos campos para filtros avançados
  const [fabric, setFabric] = useState<ProductFabric | null>(null)
  const [selectedOccasions, setSelectedOccasions] = useState<ProductOccasion[]>([])
  const [fit, setFit] = useState<ProductFit | null>(null)
  const [length, setLength] = useState<ProductLength | null>(null)
  const [pattern, setPattern] = useState<ProductPattern | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      setImages([...images, data.publicUrl])
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao fazer upload da imagem')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const toggleArrayItem = <T,>(array: T[], item: T, setter: (arr: T[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !category || selectedSizes.length === 0 || !price) {
      alert('Preencha os campos obrigatórios: Nome, Categoria, Tamanho e Preço')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('products')
        .insert({
          name,
          reference_code: referenceCode || null,
          category,
          colors: selectedColors,
          sizes: selectedSizes,
          style_tags: selectedStyles,
          price: parseFloat(price.replace(',', '.')),
          original_price: originalPrice ? parseFloat(originalPrice.replace(',', '.')) : null,
          status,
          images,
          description: description || null,
          brand: brand || null,
          // Novos campos
          fabric: fabric || null,
          occasion: selectedOccasions.length > 0 ? selectedOccasions : null,
          fit: fit || null,
          length: length || null,
          pattern: pattern || null,
        })

      if (error) throw error

      router.push('/admin/produtos')
    } catch (error: any) {
      console.error('Erro detalhado ao salvar:', error)
      alert(`Erro ao salvar peça: ${error.message || 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/produtos"
          className="p-2 hover:bg-brand-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-xl font-display font-semibold">Nova Peça</h1>
          <p className="text-sm text-brand-500">Cadastro rápido de produto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Imagens */}
        <div className="bg-white rounded-2xl p-4 border border-brand-100">
          <label className="block text-sm font-medium text-brand-700 mb-3">
            Fotos
          </label>
          
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((url, index) => (
              <div key={index} className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-brand-100">
                  <Image
                    src={url}
                    alt={`Foto ${index + 1}`}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="w-24 h-24 flex-shrink-0 border-2 border-dashed border-brand-300 rounded-xl flex flex-col items-center justify-center text-brand-400 hover:border-brand-500 hover:text-brand-500 transition-colors"
            >
              {uploadingImage ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-xs">Adicionar</span>
                </>
              )}
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Nome e Referência */}
        <div className="bg-white rounded-2xl p-4 border border-brand-100 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">
              Nome da peça *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Vestido Midi Floral"
              className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">
              Código de referência
            </label>
            <input
              type="text"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value)}
              placeholder="Ex: VM001"
              className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-700 mb-1">
              Marca
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {BRANDS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setBrand(value === brand ? '' : value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs transition-colors',
                    brand === value
                      ? 'bg-brand-900 text-white'
                      : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Ou digite outra marca..."
              className="w-full px-4 py-2 border border-brand-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-900"
            />
          </div>
        </div>

        {/* Categoria */}
        <div className="bg-white rounded-2xl p-4 border border-brand-100">
          <label className="block text-sm font-medium text-brand-700 mb-3">
            Categoria *
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  category === value
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tamanhos */}
        <div className="bg-white rounded-2xl p-4 border border-brand-100">
          <label className="block text-sm font-medium text-brand-700 mb-3">
            Tamanhos disponíveis *
          </label>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleArrayItem(selectedSizes, size, setSelectedSizes)}
                className={cn(
                  'w-12 h-12 rounded-xl text-sm font-medium transition-colors',
                  selectedSizes.includes(size)
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Preço */}
        <div className="bg-white rounded-2xl p-4 border border-brand-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brand-700 mb-1">
                Preço *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500">R$</span>
                <input
                  type="text"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-700 mb-1">
                Preço original
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-500">R$</span>
                <input
                  type="text"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="0,00"
                  className="w-full pl-12 pr-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900"
                />
              </div>
              <p className="text-xs text-brand-400 mt-1">Para mostrar desconto</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-2xl p-4 border border-brand-100">
          <label className="block text-sm font-medium text-brand-700 mb-3">
            Status
          </label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  status === value
                    ? value === 'outlet' 
                      ? 'bg-red-500 text-white' 
                      : value === 'last_unit'
                        ? 'bg-amber-500 text-white'
                        : 'bg-green-500 text-white'
                    : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================ */}
        {/* NOVOS CAMPOS - FILTROS AVANÇADOS */}
        {/* ============================================ */}

        {/* Tecido */}
        <div className="bg-white rounded-2xl p-4 border border-brand-100">
          <label className="block text-sm font-medium text-brand-700 mb-3">
            Tecido <span className="text-brand-400 font-normal">(opcional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {FABRICS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFabric(fabric === value ? null : value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  fabric === value
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-600 hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Ocasião */}
        <div className="bg-white rounded-2xl p-4 border border-brand-100">
          <label className="block text-sm font-medium text-brand-700 mb-3">
            Ocasião <span className="text-brand-400 font-normal">(opcional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleArrayItem(selectedOccasions, value, setSelectedOccasions)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  selectedOccasions.includes(value)
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-600 hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Modelagem (Fit) */}
        <div className="bg-white rounded-2xl p-4 border border-brand-100">
          <label className="block text-sm font-medium text-brand-700 mb-3">
            Modelagem <span className="text-brand-400 font-normal">(opcional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {FITS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFit(fit === value ? null : value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  fit === value
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-600 hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Comprimento */}
        <div className="bg-white rounded-2xl p-4 border border-brand-100">
          <label className="block text-sm font-medium text-brand-700 mb-3">
            Comprimento <span className="text-brand-400 font-normal">(opcional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {LENGTHS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setLength(length === value ? null : value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  length === value
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-600 hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Estampa */}
        <div className="bg-white rounded-2xl p-4 border border-brand-100">
          <label className="block text-sm font-medium text-brand-700 mb-3">
            Estampa <span className="text-brand-400 font-normal">(opcional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {PATTERNS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPattern(pattern === value ? null : value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  pattern === value
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-600 hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Cores (opcional) */}
        <div className="bg-white rounded-2xl p-4 border border-brand-100">
          <label className="block text-sm font-medium text-brand-700 mb-3">
            Cores <span className="text-brand-400 font-normal">(opcional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleArrayItem(selectedColors, value, setSelectedColors)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  selectedColors.includes(value)
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-600 hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Estilos (opcional) */}
        <div className="bg-white rounded-2xl p-4 border border-brand-100">
          <label className="block text-sm font-medium text-brand-700 mb-3">
            Estilo <span className="text-brand-400 font-normal">(opcional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {STYLES.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleArrayItem(selectedStyles, value, setSelectedStyles)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  selectedStyles.includes(value)
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-600 hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Descrição (opcional) */}
        <div className="bg-white rounded-2xl p-4 border border-brand-100">
          <label className="block text-sm font-medium text-brand-700 mb-1">
            Descrição <span className="text-brand-400 font-normal">(opcional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes da peça, tecido, caimento..."
            rows={3}
            className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-brand-900 hover:bg-brand-800 disabled:bg-brand-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Peça
            </>
          )}
        </button>
      </form>
    </div>
  )
}
