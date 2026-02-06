'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Shirt } from 'lucide-react'
import { Product } from '@/types'
import { cn } from '@/lib/utils'

interface Marker {
  x: number // porcentagem da esquerda (0-100)
  y: number // porcentagem do topo (0-100)
  productId: string
  product?: Product
}

interface ShoppableImageProps {
  src: string
  alt: string
  markers: Marker[]
}

export function ShoppableImage({ src, alt, markers }: ShoppableImageProps) {
  const [activeMarker, setActiveMarker] = useState<string | null>(null)

  return (
    <div className="relative group">
      {/* Container da Imagem com overflow-hidden para o arredondamento */}
      <div className="aspect-[4/5] sm:aspect-video relative rounded-2xl overflow-hidden shadow-sm bg-brand-50">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
      </div>

      {/* Marcadores (fora do overflow-hidden da imagem para não cortar o popup) */}
      {markers.map((marker, index) => {
        const isLow = marker.y < 35 // Se estiver muito no topo, mostra o popup embaixo
        const isLeft = marker.x < 25 // Se estiver muito na esquerda, alinha o popup à esquerda
        const isRight = marker.x > 75 // Se estiver muito na direita, alinha o popup à direita

        return (
          <div
            key={`${marker.productId}-${index}`}
            className="absolute z-30"
            style={{ 
              left: `${marker.x}%`, 
              top: `${marker.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <button
              onClick={() => setActiveMarker(activeMarker === marker.productId ? null : marker.productId)}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                activeMarker === marker.productId 
                  ? "bg-white text-brand-900 scale-110 ring-2 ring-brand-900/20" 
                  : "bg-black/40 text-white backdrop-blur-sm hover:bg-black/60"
              )}
            >
              <Shirt className={cn("w-4 h-4 transition-transform duration-300", activeMarker === marker.productId ? "scale-110" : "")} />
            </button>

            {/* Tooltip / Card do Produto */}
            {activeMarker === marker.productId && marker.product && (
              <div className={cn(
                "absolute w-48 bg-white rounded-lg shadow-2xl p-3 z-40 animate-in fade-in zoom-in duration-200",
                isLow ? "top-full mt-3" : "bottom-full mb-3",
                isLeft ? "left-0 translate-x-0" : isRight ? "right-0 translate-x-0" : "left-1/2 -translate-x-1/2",
                // Setinha do popup
                "after:content-[''] after:absolute after:border-8 after:border-transparent",
                isLow 
                  ? "after:bottom-full after:border-b-white" 
                  : "after:top-full after:border-t-white",
                isLeft 
                  ? "after:left-4" 
                  : isRight 
                    ? "after:right-4" 
                    : "after:left-1/2 after:-translate-x-1/2"
              )}>
                <Link href={`/produto/${marker.product.id}`} className="block">
                  <div className="aspect-square relative rounded-md overflow-hidden mb-2 bg-brand-50">
                    {marker.product.images?.[0] && (
                      <Image
                        src={marker.product.images[0]}
                        alt={marker.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-brand-900 line-clamp-1 truncate">
                    {marker.product.name}
                  </h4>
                  <p className="text-xs text-brand-600 mt-0.5">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(marker.product.price)}
                  </p>
                </Link>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
