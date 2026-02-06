'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, Camera, X, Save, Loader2, Check, Plus } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Product, Collection, CollectionBlock } from '@/types'
import { cn, slugify } from '@/lib/utils'
import { CollectionContentEditor } from '@/components/admin/CollectionContentEditor'

export default function EditCollectionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [fetchingProducts, setFetchingProducts] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  
  // Form state
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [isPublished, setIsPublished] = useState(true)
  const [content, setContent] = useState<CollectionBlock[]>([])

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch collection
      const { data: collection, error } = await supabase
        .from('collections')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !collection) {
        alert('Coleção não encontrada')
        router.push('/admin/colecoes')
        return
      }

      const c = collection as Collection
      setTitle(c.title)
      setSubtitle(c.subtitle || '')
      setDescription(c.description || '')
      setSlug(c.slug)
      setCoverImage(c.cover_image || null)
      setSelectedProductIds(c.product_ids || [])
      setIsPublished(c.published)
      setContent(c.content || [])
      setLoading(false)

      // 2. Fetch products
      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, images, category')
        .order('created_at', { ascending: false })
      
      if (productsData) {
        setProducts(productsData as Product[])
      }
      setFetchingProducts(false)
    }

    fetchData()
  }, [params.id, router])

  // Update slug when title changes (optional, maybe distinct behavior for edit?)
  // For edit: Let's only update slug if user clears it or wants to regenerate? 
  // Standard: If title changes, update slug automatically OR give manual control.
  // Let's keep manual control via the input but valid characters.
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `collections/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(fileName)

      setCoverImage(data.publicUrl)
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao fazer upload da imagem')
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const toggleProduct = (id: string) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(pid => pid !== id))
    } else {
      setSelectedProductIds([...selectedProductIds, id])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !slug) {
      alert('Preencha o título da coleção')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('collections')
        .update({
          title,
          subtitle,
          description,
          slug,
          cover_image: coverImage,
          product_ids: selectedProductIds,
          published: isPublished,
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)

      if (error) throw error

      router.push('/admin/colecoes')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao atualizar coleção')
    } finally {
      setLoading(false)
    }
  }

  if (loading && fetchingProducts) {
     return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-brand-400" />
        </div>
     )
  }

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/colecoes"
          className="p-2 hover:bg-brand-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-xl font-display font-semibold">Editar Coleção</h1>
          <p className="text-sm text-brand-500">Gerenciar curadoria</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Infos Básicas */}
            <div className="bg-white rounded-2xl p-4 border border-brand-100 space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">
                  Título da Coleção *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Verão 2026"
                  className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">
                  Subtítulo (Aparece acima do título)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ex: Tudo para, Seleção de, Novos..."
                  className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">
                  Slug (URL amigável)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="w-full px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-600 font-mono text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-brand-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o tema desta coleção..."
                  rows={3}
                  className="w-full px-4 py-3 border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900 resize-none"
                />
              </div>
            </div>

            {/* Editor de Conteúdo Rico (Blog) */}
            <div className="bg-white rounded-2xl p-6 border border-brand-100">
              <CollectionContentEditor
                blocks={content}
                onChange={setContent}
                availableProducts={products}
              />
            </div>

            {/* Seleção de Produtos */}
            <div className="bg-white rounded-2xl p-4 border border-brand-100">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-brand-700">
                  Selecionar Produtos ({selectedProductIds.length})
                </label>
                <div className="text-xs text-brand-400">
                  Clique para selecionar
                </div>
              </div>

              {fetchingProducts ? (
                <div className="py-8 text-center text-brand-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Carregando estoque...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {products.map((product) => {
                    const isSelected = selectedProductIds.includes(product.id)
                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={cn(
                          'relative rounded-xl border-2 overflow-hidden cursor-pointer transition-all',
                          isSelected 
                            ? 'border-brand-900 ring-2 ring-brand-900 ring-offset-2' 
                            : 'border-transparent hover:border-brand-200'
                        )}
                      >
                        <div className="aspect-square bg-brand-100 relative">
                          {product.images?.[0] && (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          )}
                          {/* Selection Overlay */}
                          <div className={cn(
                            'absolute inset-0 flex items-center justify-center transition-opacity bg-brand-900/40',
                            isSelected ? 'opacity-100' : 'opacity-0 hover:opacity-100'
                          )}>
                            {isSelected && <Check className="w-8 h-8 text-white" />}
                          </div>
                        </div>
                        <div className="p-2 bg-white text-xs">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-brand-500">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Coluna Lateral */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-2xl p-4 border border-brand-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-brand-700">Status da Coleção</span>
                <button
                  type="button"
                  onClick={() => setIsPublished(!isPublished)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                    isPublished ? "bg-brand-900" : "bg-gray-200"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                      isPublished ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>
               <div className={cn(
                    "w-full h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-colors",
                    isPublished ? "bg-green-50 text-green-700 border border-green-100" : "bg-gray-50 text-gray-500 border border-gray-100"
                  )}
                >
                  {isPublished ? 'Visível no site' : 'Rascunho oculto'}
                </div>
            </div>

            {/* Imagem de Capa */}
            <div className="bg-white rounded-2xl p-4 border border-brand-100">
              <label className="block text-sm font-medium text-brand-700 mb-3">
                Capa da Coleção
              </label>
              
              {coverImage ? (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-brand-100 mb-2">
                  <Image
                    src={coverImage}
                    alt="Capa"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage(null)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full aspect-video border-2 border-dashed border-brand-300 rounded-xl flex flex-col items-center justify-center text-brand-400 hover:border-brand-500 hover:text-brand-500 transition-colors"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-xs">Adicionar Capa</span>
                    </>
                  )}
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <p className="text-xs text-brand-400 mt-2">
                Recomendado: Formato horizontal
              </p>
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
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
