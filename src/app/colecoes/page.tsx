'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Collection } from '@/types'

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCollections = async () => {
      const { data } = await supabase
        .from('collections')
        .select('*')
        .eq('published', true)
        .order('display_order', { ascending: true })

      if (data) {
        setCollections(data as Collection[])
      }
      setLoading(false)
    }

    fetchCollections()
  }, [])

  return (
    <div className="container-app py-24">
      <div className="text-center mb-16">
        <span className="text-[10px] font-bold tracking-[0.4em] text-brand-400 uppercase">Acervo</span>
        <h1 className="font-logo text-5xl md:text-7xl tracking-tighter uppercase mt-2">Todas as Coleções</h1>
        <p className="text-brand-500 font-serif italic text-lg mt-4">Editoriais curados das nossas temporadas mais recentes.</p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="aspect-[3/4] bg-gray-100" />
              <div className="h-6 bg-gray-100 w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-24 bg-brand-50">
          <p className="text-[10px] font-bold tracking-[0.2em] text-brand-400 uppercase">Novas coleções em breve.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/colecoes/${collection.slug}`}
              className="relative group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden mb-6">
                {collection.cover_image ? (
                  <Image
                    src={collection.cover_image}
                    alt={collection.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 bg-brand-100" />
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="bg-white text-black px-6 py-3 text-[10px] font-bold tracking-[0.2em] uppercase">
                    Explore
                  </span>
                </div>
              </div>

              <div className="text-center space-y-1">
                {collection.subtitle && (
                  <span className="text-[10px] font-bold tracking-[0.3em] text-brand-400 uppercase block">
                    {collection.subtitle}
                  </span>
                )}
                <h3 className="font-logo text-3xl tracking-tighter uppercase group-hover:text-brand-500 transition-colors">
                  {collection.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
