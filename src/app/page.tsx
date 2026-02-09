'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product, ProductCategory } from '@/types'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

type FilterType = 'all' | ProductCategory | 'outlet' | 'acessorios'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')
  const supabase = createClient()

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'sold')
        .order('created_at', { ascending: false })

      if (data) {
        setProducts(data as Product[])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true
    if (filter === 'outlet') return product.status === 'outlet'
    if (filter === 'acessorios') {
      return ['bolsa', 'cinto', 'bijuteria', 'acessorio'].includes(product.category)
    }
    return product.category === filter
  })

  const filters: { value: FilterType; label: string; highlight?: boolean }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'vestido', label: 'Vestidos' },
    { value: 'blusa', label: 'Blusas' },
    { value: 'calca', label: 'Calças' },
    { value: 'saia', label: 'Saias' },
    { value: 'conjunto', label: 'Conjuntos' },
    { value: 'acessorios', label: 'Acessórios' },
    { value: 'outlet', label: 'Outlet', highlight: true },
  ]

  return (
    <div className="container-app py-8">
      {/* Hero */}
      <section className="mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-brand-900 text-center">
          {siteConfig.name}
        </h1>
        <p className="mt-2 text-brand-500 text-center max-w-lg mx-auto">
          Descubra peças únicas selecionadas especialmente para você. 
          Encontrou algo que amou? Chama no WhatsApp!
        </p>
      </section>

      {/* Quick Filters */}
      <section className="mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors',
                filter === f.value
                  ? f.highlight
                    ? 'bg-red-500 text-white'
                    : 'bg-brand-900 text-white'
                  : f.highlight
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-product bg-brand-100 rounded-lg" />
                <div className="mt-3 space-y-2">
                  <div className="h-4 bg-brand-100 rounded w-3/4" />
                  <div className="h-4 bg-brand-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </section>

      {/* Empty state */}
      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-brand-500">Nenhuma peça encontrada nessa categoria.</p>
          <button 
            onClick={() => setFilter('all')}
            className="mt-2 text-brand-900 underline"
          >
            Ver todas as peças
          </button>
        </div>
      )}
    </div>
  )
}
