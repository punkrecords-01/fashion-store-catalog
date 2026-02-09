'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2, Sparkles, Shirt } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { ShoppableImage } from '@/components/collection/ShoppableImage'
import { Collection, Product } from '@/types'

export default function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const [collection, setCollection] = useState<Collection | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchCollection = async () => {
      // Buscar coleção
      const { data: collectionData, error } = await supabase
        .from('collections')
        .select('*')
        .eq('slug', params.slug)
        .eq('published', true)
        .single()

      if (error || !collectionData) {
        router.push('/colecoes')
        return
      }

      setCollection(collectionData as Collection)

      // Buscar produtos da coleção
      if (collectionData.product_ids && collectionData.product_ids.length > 0) {
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .in('id', collectionData.product_ids)
          .neq('status', 'sold')

        if (productsData) {
          setProducts(productsData as Product[])
        }
      }

      setLoading(false)
    }

    fetchCollection()
  }, [params.slug, router])

  if (loading) {
    return (
      <div className="container-app py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-400" />
      </div>
    )
  }

  if (!collection) {
    return null
  }

  return (
    <div className="pb-16 min-h-screen bg-white">
      {/* Hero Banner Section */}
      <div className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden bg-brand-100">
        {collection.cover_image ? (
          <Image
            src={collection.cover_image}
            alt={collection.title}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-brand-200">
            <Sparkles className="w-24 h-24" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 text-white">
          <div className="container-app mx-auto w-full">
            <Link 
              href="/colecoes" 
              className="inline-flex items-center text-sm font-medium text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Ver todas as coleções
            </Link>
            <h1 className="font-logo text-5xl md:text-7xl tracking-tighter uppercase mb-4 max-w-4xl leading-[0.9]">
              {collection.title}
            </h1>
            {collection.subtitle && (
              <p className="text-[10px] font-bold tracking-[0.4em] text-white/70 uppercase mb-4">
                {collection.subtitle}
              </p>
            )}
            {collection.description && (
              <p className="text-sm md:text-base text-white/90 max-w-xl font-light leading-relaxed uppercase tracking-wider">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content (Editorial style) */}
      <div className="container-app mx-auto py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {collection.content && collection.content.length > 0 ? (
            <div className="space-y-16 md:space-y-32">
              {collection.content.map((block, idx) => {
                if (block.type === 'text') {
                  return (
                    <div key={idx} className="max-w-2xl">
                      <p className="text-xl md:text-2xl leading-relaxed text-brand-950 font-light whitespace-pre-wrap break-words">
                        {block.content}
                      </p>
                    </div>
                  )
                }
                
                if (block.type === 'image') {
                  return (
                    <div key={idx} className="space-y-4">
                      <div className="relative aspect-[4/5] overflow-hidden bg-brand-50">
                        <Image 
                          src={block.url} 
                          alt={block.alt || collection.title} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      {block.caption && (
                        <p className="text-[10px] text-center text-brand-400 uppercase tracking-widest">
                          {block.caption}
                        </p>
                      )}
                    </div>
                  )
                }

                if (block.type === 'shoppable_image') {
                  const markersWithProducts = block.markers.map(m => ({
                    ...m,
                    product: products.find(p => p.id === m.productId)
                  }))

                  return (
                    <div key={idx} className="space-y-6">
                      <ShoppableImage 
                        src={block.url} 
                        alt={block.alt || collection.title} 
                        markers={markersWithProducts} 
                      />
                    </div>
                  )
                }

                return null
              })}
            </div>
          ) : (
             <div className="text-center py-12 max-w-xl mx-auto border-y border-brand-100 italic font-light text-brand-400">
                Explore as peças desta curadoria exclusiva abaixo.
             </div>
          )}
        </div>
      </div>

      {/* Product Grid Section (Bottom) */}
      <div className="bg-white py-16 md:py-32 border-t border-brand-50">
        <div className="container-app mx-auto">
          <div className="mb-16 flex flex-col items-center text-center">
            <span className="text-[10px] font-bold tracking-[0.4em] text-brand-400 uppercase mb-4">Compre o Look</span>
            <h2 className="font-logo text-4xl md:text-6xl tracking-tighter uppercase text-brand-950">Peças da Coleção</h2>
            <div className="mt-8 w-16 h-px bg-brand-950" />
          </div>

          {products.length > 0 ? (
            <ProductGrid products={products} collectionName={collection.title} />
          ) : (
            <div className="text-center py-12">
              <p className="text-brand-500">Nenhuma peça disponível nesta coleção.</p>
              <Link href="/" className="text-brand-900 underline mt-2 inline-block">
                Ver todas as peças
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
