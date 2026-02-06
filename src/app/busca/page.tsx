'use client'

import { useState, useEffect } from 'react'
import { Search as SearchIcon, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { Product } from '@/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!query.trim()) {
      setProducts([])
      setHasSearched(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      setHasSearched(true)

      // Busca por nome, categoria ou descrição
      const searchTerms = query.toLowerCase().split(' ').filter(Boolean)
      
      const { data } = await supabase
        .from('products')
        .select('*')
        .neq('status', 'sold')
        .order('created_at', { ascending: false })

      if (data) {
        // Filtra localmente para suportar múltiplos termos
        const filtered = data.filter((product: Product) => {
          const searchableText = [
            product.name,
            product.category,
            product.description || '',
            ...product.colors,
            ...product.style_tags,
          ].join(' ').toLowerCase()

          return searchTerms.every(term => searchableText.includes(term))
        })
        
        setProducts(filtered)
      }
      
      setLoading(false)
    }, 300) // Debounce de 300ms

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="container-app py-8">
      <h1 className="font-display text-3xl font-semibold mb-8 text-center">O que você está procurando?</h1>

      <div className="max-w-xl mx-auto mb-12">
        <div className="relative">
          <input
            type="text"
            placeholder="Ex: vestido verde, calça P, jeans..."
            className="w-full px-4 py-4 pl-12 pr-12 rounded-full border border-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-900 transition-all"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400 w-5 h-5" />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-400 hover:text-brand-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* Sugestões rápidas */}
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {['vestido', 'blusa', 'calça', 'outlet', 'festa'].map((term) => (
            <button
              key={term}
              onClick={() => setQuery(term)}
              className="px-3 py-1.5 bg-brand-100 text-brand-600 rounded-full text-sm hover:bg-brand-200 transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-product bg-brand-100 rounded-lg" />
              <div className="mt-3 space-y-2">
                <div className="h-4 bg-brand-100 rounded w-3/4" />
                <div className="h-4 bg-brand-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : hasSearched ? (
        <div>
          <h2 className="text-lg font-medium mb-6">
            {products.length > 0 
              ? `${products.length} resultado${products.length > 1 ? 's' : ''} para "${query}"`
              : `Nenhum resultado para "${query}"`
            }
          </h2>
          <ProductGrid products={products} />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-brand-400 italic">Digite algo para começar a busca.</p>
        </div>
      )}
    </div>
  )
}
