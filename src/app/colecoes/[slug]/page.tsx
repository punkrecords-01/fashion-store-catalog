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
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 max-w-2xl leading-[1.1]">
              {collection.title}
            </h1>
            {collection.description && (
              <p className="text-lg md:text-xl text-white/90 max-w-xl font-light leading-relaxed">
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content (Blog style) */}
      <div className="container-app mx-auto py-12 md:py-20">
        <div className="max-w-3xl mx-auto space-y-12 md:space-y-20">
          {collection.content && collection.content.length > 0 ? (
            collection.content.map((block, idx) => {
              if (block.type === 'text') {
                return (
                  <div key={idx} className="prose prose-brand max-w-none">
                    <p className="text-xl leading-relaxed text-brand-800 font-serif whitespace-pre-wrap break-words">
                      {block.content}
                    </p>
                  </div>
                )
              }
              
              if (block.type === 'image') {
                return (
                  <div key={idx} className="space-y-3">
                    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg">
                      <Image 
                        src={block.url} 
                        alt={block.alt || collection.title} 
                        fill 
                        className="object-cover"
                      />
                    </div>
                    {block.caption && (
                      <p className="text-sm text-center text-brand-500 italic">
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
                  <div key={idx} className="space-y-4">
                    <ShoppableImage 
                      src={block.url} 
                      alt={block.alt || collection.title} 
                      markers={markersWithProducts} 
                    />
                  </div>
                )
              }

              return null
            })
          ) : (
            // Placeholder content for visualization
            <div className="space-y-12 md:space-y-20">
              <div className="prose prose-brand max-w-none">
                <p className="text-xl leading-relaxed text-brand-800 font-serif whitespace-pre-wrap break-words">
                  Bem-vinda à nossa nova curadoria. Esta coleção foi pensada para mulheres que buscam 
                  aliar o conforto do dia a dia com a sofisticação de peças atemporais. Cada item aqui 
                  foi selecionado para contar uma história de elegância e personalidade.
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg bg-brand-100 flex items-center justify-center">
                  <span className="text-brand-400 font-medium">FOTO EDITORIAL (PLACEHOLDER)</span>
                </div>
                <p className="text-sm text-center text-brand-500 italic">
                  Mood: Elegância Urbana - Inverno 2026
                </p>
              </div>

              <div className="prose prose-brand max-w-none">
                <p className="text-lg leading-relaxed text-brand-700 font-serif whitespace-pre-wrap break-words">
                  Abaixo, você pode ver como nossas peças se comportam no corpo. Explore as marcações 
                  nas fotos para descobrir os detalhes de cada produto e como eles se complementam 
                  em looks completos.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg bg-brand-200 flex items-center justify-center">
                   <div className="text-center">
                      <p className="text-brand-600 font-bold mb-2">FOTO COM MARCAÇÕES (SHOPPABLE IMAGE)</p>
                      <div className="flex justify-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg"><Shirt className="w-4 h-4 text-brand-900" /></div>
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg"><Shirt className="w-4 h-4 text-brand-900" /></div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="prose prose-brand max-w-none">
                <p className="text-md leading-relaxed text-brand-600 italic">
                  * Esta é uma visualização de exemplo. Você pode configurar este conteúdo real no campo "content" da tabela "collections" no Supabase.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Grid Section (Bottom) */}
      <div className="bg-brand-50/50 py-16 md:py-24 border-t border-brand-100">
        <div className="container-app mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-semibold mb-2">Peças da Coleção</h2>
            <div className="w-12 h-1 bg-brand-400 mx-auto rounded-full" />
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
