'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProductGrid } from '@/components/catalog/ProductGrid'
import { Product } from '@/types'

export default function OutletPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'outlet')
        .order('created_at', { ascending: false })

      if (data) {
        setProducts(data as Product[])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  return (
    <div className="container-app py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-red-600">Outlet</h1>
        <p className="text-brand-500">Últimas peças com preços especiais.</p>
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
      ) : (
        <ProductGrid products={products} />
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-12 bg-brand-50 rounded-2xl">
          <p className="text-brand-500">Nenhuma peça em outlet no momento.</p>
          <p className="text-sm text-brand-400 mt-1">Volte em breve para conferir novidades!</p>
        </div>
      )}
    </div>
  )
}
