'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, Check, X, Edit3, ChevronLeft, ChevronRight,
  AlertTriangle, Sparkles, MessageSquare, FileSpreadsheet, 
  Keyboard, Image as ImageIcon, RefreshCw, Eye, Upload, Trash2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { 
  PendingItem, CATEGORY_LABELS, ProductCategory, ProductColor, 
  ProductSize, COLOR_LABELS, SIZE_ORDER, FABRIC_LABELS, ProductFabric,
  BRAND_LABELS
} from '@/types'
import { cn } from '@/lib/utils'

type ViewMode = 'tinder' | 'list'

const SOURCE_ICONS: Record<string, any> = {
  whatsapp: MessageSquare,
  telegram: MessageSquare,
  csv: FileSpreadsheet,
  manual: Keyboard,
}

const SOURCE_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  csv: 'CSV/Excel',
  manual: 'Manual',
}

function ConfidenceBadge({ score }: { score: number }) {
  const percent = Math.round(score * 100)
  const color = score >= 0.7 ? 'text-green-600 bg-green-50' : score >= 0.4 ? 'text-yellow-600 bg-yellow-50' : 'text-red-600 bg-red-50'

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Sparkles className="w-3 h-3" />
      {percent}%
    </span>
  )
}

function EditableField({
  label, value, onChange, type = 'text', options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'select' | 'number'
  options?: { value: string; label: string }[]
}) {
  if (type === 'select' && options) {
    return (
      <div>
        <label className="block text-xs text-brand-400 mb-1">{label}</label>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
        >
          <option value="">Selecionar...</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
    )
  }

  return (
    <div>
      <label className="block text-xs text-brand-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-brand-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-300"
      />
    </div>
  )
}

function MultiSelectField({
  label, selected, options, onChange,
}: {
  label: string
  selected: string[]
  options: { value: string; label: string }[]
  onChange: (v: string[]) => void
}) {
  const toggle = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((s) => s !== val))
    } else {
      onChange([...selected, val])
    }
  }

  return (
    <div>
      <label className="block text-xs text-brand-400 mb-1">{label}</label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => toggle(o.value)}
            className={cn(
              'px-2 py-1 rounded-lg text-xs font-medium transition-colors',
              selected.includes(o.value)
                ? 'bg-brand-900 text-white'
                : 'bg-brand-100 text-brand-600 hover:bg-brand-200'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================
// TINDER CARD
// ============================================
function TinderCard({
  item,
  onApprove,
  onReject,
  onEdit,
  animating,
  onUpdateImages,
}: {
  item: PendingItem
  onApprove: (item: PendingItem, editedData?: Record<string, unknown>) => void
  onReject: (item: PendingItem) => void
  onEdit: () => void
  animating: 'left' | 'right' | null
  onUpdateImages: (urls: string[]) => void
}) {
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editData, setEditData] = useState({
    name: item.parsed_name || '',
    category: item.parsed_category || '',
    sizes: item.parsed_sizes || [],
    colors: item.parsed_colors || [],
    price: item.parsed_price?.toString() || '',
    brand: item.parsed_brand || '',
    reference: item.parsed_reference || '',
    fabric: item.parsed_fabric || '',
    description: item.parsed_description || '',
  })

  const SourceIcon = SOURCE_ICONS[item.source] || Keyboard

  const categoryOptions = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))
  const colorOptions = Object.entries(COLOR_LABELS).map(([value, label]) => ({ value, label }))
  const sizeOptions = SIZE_ORDER.map((s) => ({ value: s, label: s }))
  const fabricOptions = Object.entries(FABRIC_LABELS).map(([value, label]) => ({ value, label }))

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const supabase = createClient()
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `manual/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      const newImages = [...(item.raw_images || []), publicUrl]
      onUpdateImages(newImages)
    } catch (err) {
      console.error('Upload error:', err)
      alert('Erro ao subir imagem')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    const newImages = [...(item.raw_images || [])]
    newImages.splice(index, 1)
    onUpdateImages(newImages)
  }

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-brand-100 overflow-hidden shadow-lg transition-all duration-300',
        animating === 'left' && 'animate-slide-out-left',
        animating === 'right' && 'animate-slide-out-right',
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-brand-50 flex items-center justify-between border-b border-brand-100">
        <div className="flex items-center gap-2">
          <SourceIcon className="w-4 h-4 text-brand-400" />
          <span className="text-xs text-brand-500">{SOURCE_LABELS[item.source]}</span>
          {item.source_phone && (
            <span className="text-xs text-brand-400">• {item.source_phone}</span>
          )}
        </div>
        <ConfidenceBadge score={item.confidence_score} />
      </div>

      {/* Images */}
      <div className="relative group">
        {item.raw_images && item.raw_images.length > 0 ? (
          <div className="aspect-square bg-brand-100 relative overflow-hidden">
            <img
              src={item.raw_images[0]}
              alt="Produto"
              className="w-full h-full object-cover"
            />
            {item.raw_images.length > 1 && (
              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                +{item.raw_images.length - 1} fotos
              </span>
            )}
            
            <button 
              onClick={() => removeImage(0)}
              className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="aspect-[4/3] bg-brand-50 flex flex-col items-center justify-center border-b border-brand-100">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-brand-500 border-t-transparent" />
            ) : (
              <>
                <ImageIcon className="w-12 h-12 text-brand-200 mb-2" />
                <p className="text-sm text-brand-400">Sem imagem</p>
              </>
            )}
          </div>
        )}

        {/* Upload Button */}
        <label className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur shadow-lg border border-brand-100 rounded-full cursor-pointer hover:bg-white transition-colors">
          <Upload className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-semibold text-brand-900">
            {uploading ? 'Subindo...' : item.raw_images?.length ? 'Trocar/Add' : 'Incluir Foto'}
          </span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Raw text */}
      {item.raw_text && (
        <div className="px-4 py-3 bg-brand-50 border-y border-brand-100">
          <p className="text-xs text-brand-400 mb-1">Texto original:</p>
          <p className="text-sm text-brand-700 italic">&ldquo;{item.raw_text}&rdquo;</p>
        </div>
      )}

      {/* Parsed Data or Edit Form */}
      <div className="p-4">
        {!editing ? (
          <>
            {/* Parsed Info Display */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-brand-900">
                  {item.parsed_name || <span className="text-brand-300 italic">Nome não identificado</span>}
                </h3>
                {item.parsed_reference && (
                  <p className="text-xs text-brand-400">Ref: {item.parsed_reference}</p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {item.parsed_category && (
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                    {CATEGORY_LABELS[item.parsed_category as ProductCategory] || item.parsed_category}
                  </span>
                )}
                {item.parsed_brand && (
                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                    {BRAND_LABELS[item.parsed_brand] || item.parsed_brand}
                  </span>
                )}
                {item.parsed_fabric && (
                  <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">
                    {FABRIC_LABELS[item.parsed_fabric as ProductFabric] || item.parsed_fabric}
                  </span>
                )}
              </div>

              {item.parsed_colors.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-400">Cores:</span>
                  <div className="flex gap-1">
                    {item.parsed_colors.map((c) => (
                      <span key={c} className="px-2 py-0.5 bg-brand-100 text-brand-700 text-xs rounded-full">
                        {COLOR_LABELS[c as ProductColor] || c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.parsed_sizes.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-400">Tamanhos:</span>
                  <div className="flex gap-1">
                    {item.parsed_sizes.map((s) => (
                      <span key={s} className="w-8 h-8 flex items-center justify-center bg-brand-100 text-brand-700 text-xs rounded-lg font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {item.parsed_price && (
                <p className="text-xl font-bold text-brand-900">
                  R$ {item.parsed_price.toFixed(2).replace('.', ',')}
                  {item.parsed_original_price && (
                    <span className="text-sm text-brand-400 line-through ml-2">
                      R$ {item.parsed_original_price.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Warnings */}
            {item.warnings.length > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-medium text-yellow-700">Atenção</span>
                </div>
                <ul className="space-y-0.5">
                  {item.warnings.map((w, i) => (
                    <li key={i} className="text-xs text-yellow-600">• {w}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          /* Edit Form */
          <div className="space-y-3">
            <EditableField label="Nome" value={editData.name} onChange={(v) => setEditData({...editData, name: v})} />
            <EditableField label="Categoria" value={editData.category} onChange={(v) => setEditData({...editData, category: v})} type="select" options={categoryOptions} />
            <EditableField label="Referência" value={editData.reference} onChange={(v) => setEditData({...editData, reference: v})} />
            <EditableField label="Preço" value={editData.price} onChange={(v) => setEditData({...editData, price: v})} type="number" />
            <EditableField label="Marca" value={editData.brand} onChange={(v) => setEditData({...editData, brand: v})} />
            <EditableField label="Tecido" value={editData.fabric} onChange={(v) => setEditData({...editData, fabric: v})} type="select" options={fabricOptions} />
            <MultiSelectField label="Tamanhos" selected={editData.sizes} options={sizeOptions} onChange={(v) => setEditData({...editData, sizes: v})} />
            <MultiSelectField label="Cores" selected={editData.colors} options={colorOptions} onChange={(v) => setEditData({...editData, colors: v})} />
            <EditableField label="Descrição" value={editData.description} onChange={(v) => setEditData({...editData, description: v})} />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-4 flex gap-3">
        <button
          onClick={() => onReject(item)}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-medium transition-colors"
        >
          <X className="w-5 h-5" />
          Rejeitar
        </button>
        <button
          onClick={() => setEditing(!editing)}
          className="flex items-center justify-center w-12 bg-brand-100 text-brand-600 rounded-xl hover:bg-brand-200 transition-colors"
        >
          <Edit3 className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            if (editing) {
              onApprove(item, {
                name: editData.name,
                reference_code: editData.reference,
                category: editData.category,
                colors: editData.colors,
                sizes: editData.sizes,
                price: parseFloat(editData.price) || 0,
                brand: editData.brand,
                fabric: editData.fabric,
                description: editData.description,
              })
            } else {
              onApprove(item)
            }
          }}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors"
        >
          <Check className="w-5 h-5" />
          Aprovar
        </button>
      </div>
    </div>
  )
}

// ============================================
// MAIN PAGE
// ============================================
export default function PendingItemsPage() {
  const [items, setItems] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animating, setAnimating] = useState<'left' | 'right' | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('tinder')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [processing, setProcessing] = useState(false)
  const supabase = createClient()

  const fetchItems = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('pending_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    setItems((data as PendingItem[]) || [])
    setCurrentIndex(0)
    setLoading(false)
  }, [filter])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleApprove = async (item: PendingItem, editedData?: Record<string, unknown>) => {
    setProcessing(true)
    setAnimating('right')

    try {
      const productData = editedData ? {
        ...editedData,
        style_tags: item.parsed_style_tags || [],
        status: 'available',
        images: item.raw_images || [],
        occasion: item.parsed_occasion || [],
        fit: item.parsed_fit,
        length: item.parsed_length,
        pattern: item.parsed_pattern,
        source: item.source,
        source_pending_item_id: item.id,
      } : undefined

      const res = await fetch('/api/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          action: 'approve',
          productData,
        }),
      })

      if (res.ok) {
        setTimeout(() => {
          setItems((prev) => prev.filter((i) => i.id !== item.id))
          setAnimating(null)
          // Don't increment index since item was removed
        }, 300)
      }
    } catch (err) {
      console.error('Approve error:', err)
      setAnimating(null)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (item: PendingItem) => {
    setProcessing(true)
    setAnimating('left')

    try {
      const res = await fetch('/api/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, action: 'reject' }),
      })

      if (res.ok) {
        setTimeout(() => {
          setItems((prev) => prev.filter((i) => i.id !== item.id))
          setAnimating(null)
        }, 300)
      }
    } catch (err) {
      console.error('Reject error:', err)
      setAnimating(null)
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateImages = async (itemId: string, newUrls: string[]) => {
    // Atualizar no banco
    const { error } = await supabase
      .from('pending_items')
      .update({ raw_images: newUrls })
      .eq('id', itemId)

    if (error) {
      console.error('Error updating images in DB:', error)
      return
    }

    // Atualizar no estado local
    setItems(items.map(item => item.id === itemId ? { ...item, raw_images: newUrls } : item))
  }

  const handleRejectAll = async () => {
    if (!confirm('Tem certeza que deseja rejeitar TODOS os itens pendentes?')) return
    
    setProcessing(true)
    try {
      const res = await fetch('/api/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject_all' }),
      })

      if (res.ok) {
        setItems([])
        alert('Fila limpa com sucesso!')
      }
    } catch (err) {
      console.error('Reject all error:', err)
    } finally {
      setProcessing(false)
    }
  }

  const currentItem = items[currentIndex]
  const pendingCount = items.filter(i => i.status === 'pending').length

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-brand-500 hover:text-brand-700 mb-4 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-semibold">Fila de Aprovação</h1>
            <p className="text-brand-500 text-sm mt-1">
              {pendingCount} {pendingCount === 1 ? 'item pendente' : 'itens pendentes'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchItems}
              className="p-2 text-brand-500 hover:text-brand-700 transition-colors"
              title="Atualizar"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <div className="flex bg-brand-100 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('tinder')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  viewMode === 'tinder' ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-500'
                )}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                  viewMode === 'list' ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-500'
                )}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors',
                filter === f ? 'bg-brand-900 text-white' : 'bg-brand-100 text-brand-600 hover:bg-brand-200'
              )}
            >
              {f === 'pending' ? '⏳ Pendentes' : f === 'approved' ? '✅ Aprovados' : f === 'rejected' ? '❌ Rejeitados' : '📋 Todos'}
            </button>
          ))}
        </div>

        {filter === 'pending' && items.length > 0 && (
          <button
            onClick={handleRejectAll}
            disabled={processing}
            className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-medium transition-colors border border-red-100"
          >
            <X className="w-3.5 h-3.5" />
            Limpar Fila
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-brand-400">Carregando...</div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-brand-400" />
          </div>
          <h3 className="text-lg font-medium text-brand-700 mb-2">Fila vazia!</h3>
          <p className="text-brand-400 text-sm mb-6">
            {filter === 'pending' ? 'Nenhum item pendente de aprovação.' : 'Nenhum item encontrado.'}
          </p>
          <Link
            href="/admin/importar"
            className="inline-flex items-center gap-2 px-6 py-2 bg-brand-900 text-white rounded-xl text-sm font-medium hover:bg-brand-800 transition-colors"
          >
            Importar Produtos
          </Link>
        </div>
      ) : viewMode === 'tinder' ? (
        /* TINDER MODE */
        <div className="max-w-md mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-between mb-4 text-sm text-brand-500">
            <span>{currentIndex + 1} de {items.length}</span>
            <div className="flex gap-1">
              {items.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full',
                    i + Math.max(0, currentIndex - 2) === currentIndex ? 'bg-brand-900' : 'bg-brand-200'
                  )}
                />
              ))}
            </div>
          </div>

          {currentItem && (
            <TinderCard
              key={currentItem.id}
              item={currentItem}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={() => {}}
              onUpdateImages={(urls) => handleUpdateImages(currentItem.id, urls)}
              animating={animating}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="p-2 text-brand-400 hover:text-brand-600 disabled:opacity-30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentIndex(Math.min(items.length - 1, currentIndex + 1))}
              disabled={currentIndex >= items.length - 1}
              className="p-2 text-brand-400 hover:text-brand-600 disabled:opacity-30"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Keyboard hints */}
          <p className="text-center text-xs text-brand-300 mt-4">
            Use os botões para aprovar ou rejeitar. Clique no lápis para editar antes de aprovar.
          </p>
        </div>
      ) : (
        /* LIST MODE */
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-brand-100 p-4 flex items-center gap-4"
            >
              {/* Thumbnail */}
              {item.raw_images?.[0] ? (
                <img
                  src={item.raw_images[0]}
                  alt=""
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-brand-100 flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-6 h-6 text-brand-300" />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-brand-900 truncate">
                    {item.parsed_name || 'Sem nome'}
                  </h3>
                  <ConfidenceBadge score={item.confidence_score} />
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-brand-400">
                  <span>{SOURCE_LABELS[item.source]}</span>
                  {item.parsed_category && (
                    <>
                      <span>•</span>
                      <span>{CATEGORY_LABELS[item.parsed_category as ProductCategory] || item.parsed_category}</span>
                    </>
                  )}
                  {item.parsed_price && (
                    <>
                      <span>•</span>
                      <span>R$ {item.parsed_price.toFixed(2).replace('.', ',')}</span>
                    </>
                  )}
                </div>
                {item.warnings.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <AlertTriangle className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-yellow-600">{item.warnings.length} aviso(s)</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {item.status === 'pending' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleReject(item)}
                    disabled={processing}
                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleApprove(item)}
                    disabled={processing}
                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-50 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              )}
              {item.status !== 'pending' && (
                <span className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium',
                  item.status === 'approved' ? 'bg-green-50 text-green-700' :
                  item.status === 'rejected' ? 'bg-red-50 text-red-700' :
                  'bg-blue-50 text-blue-700'
                )}>
                  {item.status === 'approved' ? 'Aprovado' : item.status === 'rejected' ? 'Rejeitado' : 'Mesclado'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
