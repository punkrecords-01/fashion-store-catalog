'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { WhatsAppIcon } from '@/components/ui/WhatsAppIcon'
import { Product, STATUS_LABELS } from '@/types'
import { cn, formatPrice, generateWhatsAppLink } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'

interface ProductCardProps {
  product: Product
  collectionName?: string
}

export function ProductCard({ product, collectionName }: ProductCardProps) {
  const { addItem } = useCart()
  const whatsappUrl = generateWhatsAppLink(product.name, collectionName)
  const isOnSale = product.original_price && product.original_price > product.price
  const showBadge = product.status !== 'available'

  return (
    <div className="group relative">
      {/* Image */}
      <Link href={`/produto/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-brand-300 uppercase text-[10px] tracking-widest font-bold">
              Sem Imagem
            </div>
          )}

          {/* Status Badge */}
          {showBadge && (
            <div
              className={cn(
                'absolute top-2 left-2 px-1.5 py-0.5 text-[8px] font-bold tracking-[0.15em] uppercase',
                product.status === 'outlet' && 'bg-black text-white',
                product.status === 'last_unit' && 'bg-white text-black border border-black',
                product.status === 'sold' && 'bg-gray-200 text-gray-500'
              )}
            >
              {STATUS_LABELS[product.status]}
            </div>
          )}
          
          {/* Quick Buy Overlay (Desktop) */}
          <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 px-2 gap-1.5">
             <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  addItem(product)
                }}
                className="bg-white/90 backdrop-blur-sm text-brand-950 p-2 text-[8px] font-bold tracking-widest uppercase border border-brand-200 hover:bg-black hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0 duration-300 flex items-center justify-center"
                title="Adicionar à sacola"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
              </button>
             <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-white/90 backdrop-blur-sm text-brand-950 px-2 py-2 text-[8px] font-bold tracking-[0.2em] uppercase border border-brand-200 hover:bg-green-600 hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0 duration-300 flex items-center justify-center gap-1.5"
              >
                <WhatsAppIcon className="w-3.5 h-3.5 text-green-500 group-hover:text-white shrink-0" />
                <span className="pl-[0.2em]">Eu quero</span>
              </a>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-2 pb-3 text-center px-1">
        <Link href={`/produto/${product.id}`} className="block">
          <h3 className="text-[10px] md:text-[11px] text-brand-950 uppercase tracking-wide line-clamp-1 font-bold">
            {product.name}
          </h3>
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="text-[10px] md:text-[11px] text-brand-950 font-black tracking-wider">
              {formatPrice(product.price)}
            </span>
            {isOnSale && product.original_price && (
              <span className="text-[9px] text-brand-300 line-through">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}
