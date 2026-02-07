'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, MessageCircle, Share2, Ruler, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, generateWhatsAppLink } from '@/lib/utils'
import { Product, STATUS_LABELS, CATEGORY_LABELS } from '@/types'

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error || !data) {
        router.push('/')
        return
      }

      setProduct(data as Product)
      setLoading(false)
    }

    fetchProduct()
  }, [params.id, router])

  if (loading || !product) {
    return (
      <div className="container-app py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-400" />
      </div>
    )
  }

  const whatsappUrl = generateWhatsAppLink(product.name)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Olha essa peça: ${product.name} por ${formatPrice(product.price)}`,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copiado!')
    }
  }

  return (
    <div className="container-app py-6 pb-24">
      {/* Voltar */}
      <Link 
        href="/" 
        className="inline-flex items-center text-sm text-brand-600 hover:text-brand-900 mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Voltar para o catálogo
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="aspect-product relative rounded-xl bg-brand-100 overflow-hidden">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-brand-400 italic">
                Sem imagem
              </div>
            )}
            
            {/* Status Badge */}
            {product.status !== 'available' && (
              <div className={`absolute top-4 left-4 px-3 py-1 text-sm font-medium rounded-full ${
                product.status === 'outlet' ? 'bg-red-500 text-white' :
                product.status === 'last_unit' ? 'bg-amber-500 text-white' :
                'bg-gray-500 text-white'
              }`}>
                {STATUS_LABELS[product.status]}
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square relative rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImage === i ? 'border-brand-900' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - foto ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-widest text-brand-400 mb-1">
              {CATEGORY_LABELS[product.category]}
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-semibold mb-2">{product.name}</h1>
            {product.reference_code && (
              <p className="text-sm text-brand-400">Ref: {product.reference_code}</p>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-2xl font-bold text-brand-900">{formatPrice(product.price)}</span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-lg text-brand-400 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
            <p className="text-sm text-brand-500">
              Disponibilidade: <span className="text-brand-900 font-medium">{STATUS_LABELS[product.status]}</span>
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {/* Tamanhos */}
            <div>
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="font-medium text-brand-900">Tamanhos disponíveis</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span 
                    key={size}
                    className="w-10 h-10 flex items-center justify-center border border-brand-200 rounded-md text-sm font-medium"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>

            {/* Descrição */}
            {product.description && (
              <div>
                <h3 className="font-medium text-brand-900 mb-2">Descrição</h3>
                <p className="text-brand-600 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* CTA Mobile and Desktop */}
          {product.status !== 'sold' && (
            <div className="mt-auto space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                Chamar no WhatsApp
              </a>
              
              <button 
                onClick={handleShare}
                className="flex items-center justify-center gap-2 w-full py-3 border border-brand-200 text-brand-700 font-medium rounded-xl hover:bg-brand-50 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar peça
              </button>
            </div>
          )}
          
          {product.status === 'sold' && (
            <div className="mt-auto p-4 bg-brand-100 rounded-xl text-center">
              <p className="text-brand-600 font-medium">Esta peça já foi vendida</p>
              <Link href="/" className="text-brand-900 underline text-sm mt-1 inline-block">
                Ver outras peças disponíveis
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
