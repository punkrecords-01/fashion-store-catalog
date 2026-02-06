'use client'

import { useState } from 'react'
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { 
  ProductCategory,
  ProductColor,
  ProductSize,
  ProductFabric,
  ProductOccasion,
  ProductFit,
  ProductLength,
  ProductPattern,
  CATEGORY_LABELS,
  COLOR_LABELS,
  SIZE_ORDER,
  FABRIC_LABELS,
  OCCASION_LABELS,
  FIT_LABELS,
  LENGTH_LABELS,
  PATTERN_LABELS,
  BRAND_LABELS,
  PRICE_RANGES,
} from '@/types'
import { cn } from '@/lib/utils'

export interface FilterState {
  categories: ProductCategory[]
  colors: ProductColor[]
  sizes: ProductSize[]
  brands: string[]
  fabrics: ProductFabric[]
  occasions: ProductOccasion[]
  fits: ProductFit[]
  lengths: ProductLength[]
  patterns: ProductPattern[]
  priceRange: { min: number; max: number } | null
}

interface FilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
  activeFiltersCount: number
  isSidebar?: boolean
}

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function FilterSection({ title, children, defaultOpen = false }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-brand-100 py-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-medium text-brand-900">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-brand-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-brand-400" />
        )}
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  )
}

export function FilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
  activeFiltersCount,
  isSidebar = false,
}: FilterPanelProps) {
  
  const toggleArrayFilter = <T extends string>(
    key: keyof FilterState,
    value: T
  ) => {
    const currentArray = filters[key] as T[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter((v) => v !== value)
      : [...currentArray, value]
    onFiltersChange({ ...filters, [key]: newArray })
  }

  const setPriceRange = (range: { min: number; max: number } | null) => {
    onFiltersChange({ ...filters, priceRange: range })
  }

  if (!isOpen && !isSidebar) return null

  const content = (
    <div className={cn(
      "bg-white",
      !isSidebar && "h-full w-full overflow-y-auto"
    )}>
      {/* Header - Only for mobile drawer */}
      {!isSidebar && (
        <div className="sticky top-0 bg-white border-b border-brand-100 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5" />
            <h2 className="font-semibold text-lg">Filtros</h2>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-brand-900 text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-brand-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className={cn("p-4", isSidebar && "pt-0")}>
        {/* Categoria */}
        <FilterSection title="Categoria" defaultOpen={isSidebar}>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleArrayFilter('categories', value as ProductCategory)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  filters.categories.includes(value as ProductCategory)
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-950 font-medium hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Marca */}
        <FilterSection title="Marca" defaultOpen={isSidebar}>
          <div className="flex flex-wrap gap-2">
            {Object.entries(BRAND_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleArrayFilter('brands', value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  filters.brands.includes(value)
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-950 font-medium hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Tamanho */}
        <FilterSection title="Tamanho" defaultOpen={isSidebar}>
          <div className="flex flex-wrap gap-2">
            {SIZE_ORDER.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleArrayFilter('sizes', size)}
                className={cn(
                  'w-12 h-12 rounded-xl text-sm font-medium transition-colors',
                  filters.sizes.includes(size)
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-950 font-medium hover:bg-brand-200'
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Faixa de Preço */}
        <FilterSection title="Preço">
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGES.map((range) => (
              <button
                key={range.label}
                type="button"
                onClick={() => 
                  filters.priceRange?.min === range.min && filters.priceRange?.max === range.max
                    ? setPriceRange(null)
                    : setPriceRange(range)
                }
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  filters.priceRange?.min === range.min && filters.priceRange?.max === range.max
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-950 font-medium hover:bg-brand-200'
                )}
              >
                {range.label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Cor */}
        <FilterSection title="Cor">
          <div className="flex flex-wrap gap-2">
            {Object.entries(COLOR_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleArrayFilter('colors', value as ProductColor)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  filters.colors.includes(value as ProductColor)
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-950 font-medium hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Tecido */}
        <FilterSection title="Tecido">
          <div className="flex flex-wrap gap-2">
            {Object.entries(FABRIC_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleArrayFilter('fabrics', value as ProductFabric)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  filters.fabrics.includes(value as ProductFabric)
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-950 font-medium hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Ocasião */}
        <FilterSection title="Ocasião">
          <div className="flex flex-wrap gap-2">
            {Object.entries(OCCASION_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleArrayFilter('occasions', value as ProductOccasion)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  filters.occasions.includes(value as ProductOccasion)
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-950 font-medium hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Modelagem */}
        <FilterSection title="Modelagem">
          <div className="flex flex-wrap gap-2">
            {Object.entries(FIT_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleArrayFilter('fits', value as ProductFit)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  filters.fits.includes(value as ProductFit)
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-950 font-medium hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Comprimento */}
        <FilterSection title="Comprimento">
          <div className="flex flex-wrap gap-2">
            {Object.entries(LENGTH_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleArrayFilter('lengths', value as ProductLength)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  filters.lengths.includes(value as ProductLength)
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-950 font-medium hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </FilterSection>

        {/* Estampa */}
        <FilterSection title="Estampa">
          <div className="flex flex-wrap gap-2">
            {Object.entries(PATTERN_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => toggleArrayFilter('patterns', value as ProductPattern)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  filters.patterns.includes(value as ProductPattern)
                    ? 'bg-brand-900 text-white'
                    : 'bg-brand-100 text-brand-950 font-medium hover:bg-brand-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </FilterSection>
      </div>

      {/* Footer Actions - Only for mobile drawer */}
      {!isSidebar && (
        <div className="sticky bottom-0 bg-white border-t border-brand-100 p-4 flex gap-3">
          <button
            type="button"
            onClick={onClearFilters}
            className="flex-1 py-3 border border-brand-200 text-brand-700 font-medium rounded-xl hover:bg-brand-50 transition-colors"
          >
            Limpar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-brand-900 text-white font-medium rounded-xl hover:bg-brand-800 transition-colors"
          >
            Ver Resultados
          </button>
        </div>
      )}
    </div>
  )

  if (isSidebar) {
    return content
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={cn(
        'fixed top-0 left-0 h-full w-full max-w-sm bg-white z-50 shadow-xl transform transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {content}
      </div>
    </>
  )
}

export const emptyFilters: FilterState = {
  categories: [],
  colors: [],
  sizes: [],
  brands: [],
  fabrics: [],
  occasions: [],
  fits: [],
  lengths: [],
  patterns: [],
  priceRange: null,
}

export function countActiveFilters(filters: FilterState): number {
  let count = 0
  count += filters.categories.length
  count += filters.colors.length
  count += filters.sizes.length
  count += filters.brands.length
  count += filters.fabrics.length
  count += filters.occasions.length
  count += filters.fits.length
  count += filters.lengths.length
  count += filters.patterns.length
  if (filters.priceRange) count += 1
  return count
}
