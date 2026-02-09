'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ProductGrid } from '@/components/catalog/ProductGrid'
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
    <div className="container-app py-8">
      {/* Voltar */}
      <Link 
        href="/colecoes" 
        className="inline-flex items-center text-sm text-brand-600 hover:text-brand-900 mb-6"
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Voltar para coleções
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold mb-2">{collection.title}</h1>
        {collection.description && (
          <p className="text-brand-500">{collection.description}</p>
        )}
      </div>

      {/* Products */}
      {products.length > 0 ? (
        <ProductGrid products={products} collectionName={collection.title} />
      ) : (
        <div className="text-center py-12 bg-brand-50 rounded-2xl">
          <p className="text-brand-500">Nenhuma peça disponível nesta coleção.</p>
          <Link href="/" className="text-brand-900 underline mt-2 inline-block">
            Ver todas as peças
          </Link>
        </div>
      )}
    </div>
  )
}
