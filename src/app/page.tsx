'use client'

import { useEffect, useState } from 'react'
import { SlidersHorizontal, ArrowRight, Grid2X2, LayoutGrid, Square, Search, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product, ProductCategory, Collection } from '@/types'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { FilterPanel, emptyFilters, countActiveFilters } from '@/components/catalog/FilterPanel'
import { CollectionsCarousel } from '@/components/catalog/CollectionsCarousel'
import { Marquee } from '@/components/ui/Marquee'
// Removed unused imports
import { cn } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'

type QuickFilterType = 'all' | ProductCategory | 'outlet' | 'acessorios'

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [gridSize, setGridSize] = useState<'compact' | 'standard' | 'large'>('standard')
  const [advancedFilters, setAdvancedFilters] = useState(emptyFilters)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      try {
        const { data: productsData } = await supabase
          .from('products')
          .select('*')
          .neq('status', 'sold')
          .order('created_at', { ascending: false })

        if (productsData) {
          setProducts(productsData as Product[])
        }

        const { data: collectionsData } = await supabase
          .from('collections')
          .select('*')
          .eq('published', true)
          .order('display_order', { ascending: true })

        if (collectionsData) {
          setCollections(collectionsData as Collection[])
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const activeFiltersCount = countActiveFilters(advancedFilters)

  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !product.category.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    if (quickFilter !== 'all') {
      if (quickFilter === 'outlet' && product.status !== 'outlet') return false
      if (quickFilter === 'acessorios' && !['bolsa', 'cinto', 'bijuteria', 'acessorio'].includes(product.category)) return false
      if (quickFilter !== 'outlet' && quickFilter !== 'acessorios' && product.category !== quickFilter) return false
    }

    if (advancedFilters.categories.length > 0 && !advancedFilters.categories.includes(product.category)) return false
    if (advancedFilters.brands.length > 0 && (!product.brand || !advancedFilters.brands.includes(product.brand))) return false
    if (advancedFilters.colors.length > 0 && !product.colors.some(c => advancedFilters.colors.includes(c))) return false
    if (advancedFilters.sizes.length > 0 && !product.sizes.some(s => advancedFilters.sizes.includes(s))) return false
    if (advancedFilters.fabrics.length > 0 && product.fabric && !advancedFilters.fabrics.includes(product.fabric)) return false
    if (advancedFilters.occasions.length > 0 && product.occasion && !product.occasion.some(o => advancedFilters.occasions.includes(o))) return false
    if (advancedFilters.fits.length > 0 && product.fit && !advancedFilters.fits.includes(product.fit)) return false
    if (advancedFilters.lengths.length > 0 && product.length && !advancedFilters.lengths.includes(product.length)) return false
    if (advancedFilters.patterns.length > 0 && product.pattern && !advancedFilters.patterns.includes(product.pattern)) return false
    
    if (advancedFilters.priceRange) {
      if (product.price < advancedFilters.priceRange.min) return false
      if (advancedFilters.priceRange.max !== Infinity && product.price > advancedFilters.priceRange.max) return false
    }

    return true
  })

  const quickFilters: { value: QuickFilterType; label: string }[] = [
    { value: 'all', label: 'TUDO' },
    { value: 'vestido', label: 'VESTIDOS' },
    { value: 'blusa', label: 'BLUSAS' },
    { value: 'calca', label: 'CALÇAS' },
    { value: 'conjunto', label: 'CONJUNTOS' },
    { value: 'outlet', label: 'OUTLET' },
  ]

  const handleClearFilters = () => {
    setAdvancedFilters(emptyFilters)
    setQuickFilter('all')
    setSearchQuery('')
  }

  return (
    <main className="min-h-screen bg-white pt-16">
      <Marquee 
        items={[
          "It's Couture — Curadoria Premium", 
          "Envio para todo o Brasil", 
          "Peças Exclusivas & Atemporais",
          "Acompanhe as tendências"
        ]} 
        speed="slow"
        className="bg-black border-none py-2.5"
      />

      {/* Collections Carousel */}
      {collections.length > 0 && (
        <section className="mt-4 border-b border-gray-100 pb-12">
          <div className="px-4 md:px-6 mb-6 flex justify-between items-end">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] text-brand-400 uppercase mb-1">Explore</p>
              <h2 className="text-2xl font-logo tracking-tighter uppercase text-brand-950">Coleções</h2>
            </div>
            <Link 
              href="/colecoes" 
              className="text-[10px] font-bold tracking-widest uppercase border-b border-brand-900 pb-0.5 hover:text-brand-500 hover:border-brand-500 transition-colors"
            >
              Ver Todas
            </Link>
          </div>
          <CollectionsCarousel collections={collections} />
        </section>
      )}

      {/* Page Title & Filter Row - Inspired by Dime */}
      <section className="px-4 md:px-6 py-4">
        {/* Horizontal Filters Row */}
        <div className="flex items-center gap-6 border-b border-gray-100 pb-2">
          <button
            onClick={() => setIsFilterPanelOpen(true)}
            className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.15em] text-brand-950 uppercase shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-brand-950 text-white text-[7px] rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="h-3 w-px bg-gray-200 shrink-0" />

          <div className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide flex-1">
            {quickFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setQuickFilter(filter.value)}
                className={cn(
                  'text-[9px] font-bold tracking-[0.1em] transition-all uppercase whitespace-nowrap px-1',
                  quickFilter === filter.value
                    ? 'text-brand-950 border-b-2 border-brand-950 pb-0.5'
                    : 'text-brand-600 hover:text-brand-950'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="h-3 w-px bg-gray-200 shrink-0 hidden md:block" />

          {/* Search Input */}
          <div className="relative group min-w-[120px] md:min-w-[200px]">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-400 group-focus-within:text-brand-950 transition-colors" />
            <input 
              type="text"
              placeholder="BUSCAR PEÇA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none pl-5 pr-4 py-1 text-[9px] font-bold tracking-[0.1em] placeholder:text-brand-300 focus:ring-0 outline-none uppercase"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-brand-400 hover:text-brand-950"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Full Width Catalog Grid */}
      <section id="catalog" className="px-0 pb-24">
        {loading ? (
          <div className="grid gap-px bg-gray-50 border-t border-gray-50 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="animate-pulse aspect-square bg-white" />
            ))}
          </div>
        ) : (
          <ProductGrid products={filteredProducts} columns="standard" />
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-24">
            <p className="text-brand-400 uppercase text-[10px] tracking-widest mb-4">No pieces found</p>
            <button onClick={handleClearFilters} className="text-[10px] font-bold tracking-widest uppercase border-b border-brand-900 pb-1">
              Show All
            </button>
          </div>
        )}
      </section>

      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        onClearFilters={handleClearFilters}
        activeFiltersCount={activeFiltersCount}
      />
    </main>
  )
}
