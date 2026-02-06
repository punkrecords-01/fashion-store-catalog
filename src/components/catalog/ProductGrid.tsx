import { Product } from '@/types'
import { ProductCard } from './ProductCard'
import { cn } from '@/lib/utils'

interface ProductGridProps {
  products: Product[]
  collectionName?: string
  columns?: 'compact' | 'standard' | 'large'
}

export function ProductGrid({ products, collectionName, columns = 'compact' }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-brand-500">Nenhuma peça encontrada.</p>
      </div>
    )
  }

  const gridStyles = {
    compact: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
    standard: "grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4",
    large: "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
  }

  return (
    <div className={cn("grid gap-px md:gap-px bg-gray-50 border-t border-gray-50", gridStyles[columns])}>
      {products.map((product) => (
        <div key={product.id} className="bg-white">
          <ProductCard
            product={product}
            collectionName={collectionName}
          />
        </div>
      ))}
    </div>
  )
}
