'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Collection } from '@/types'
import { cn } from '@/lib/utils'

interface CollectionsCarouselProps {
  collections: Collection[]
}

export function CollectionsCarousel({ collections }: CollectionsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeftArrow(scrollLeft > 10)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [collections])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const { clientWidth } = scrollRef.current
    const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  if (collections.length === 0) return null

  return (
    <div className="relative group/carousel">
      {/* Arrows */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      )}
      
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      )}

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {collections.map((collection) => (
          <Link
            key={collection.id}
            href={`/colecoes/${collection.slug}`}
            className="relative flex-none w-[80vw] sm:w-[50vw] md:w-[33vw] lg:w-[25vw] aspect-[3/4] overflow-hidden snap-start group"
          >
            {collection.cover_image ? (
              <Image
                src={collection.cover_image}
                alt={collection.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 640px) 80vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 bg-brand-100" />
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300" />
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              {collection.subtitle && (
                <span className="text-[10px] font-bold tracking-[0.4em] mb-2 drop-shadow-md uppercase">
                  {collection.subtitle}
                </span>
              )}
              <h3 className="font-logo text-3xl md:text-5xl tracking-tighter uppercase mb-8 drop-shadow-lg leading-none">
                {collection.title}
              </h3>
              
              <div className="overflow-hidden">
                <span className="inline-block text-[10px] font-bold tracking-[0.2em] uppercase border-b border-white pb-1 translate-y-full group-hover:translate-y-0 transition-transform duration-500 delay-100">
                  Shop Collection
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
