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
    <div className="container-app py-8">
      <h1 className="font-display text-3xl font-semibold mb-2">Coleções</h1>
      <p className="text-brand-500 mb-8">Curadorias especiais selecionadas para você.</p>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-video bg-brand-100 rounded-xl" />
              <div className="mt-3 h-6 bg-brand-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12 bg-brand-50 rounded-2xl">
          <p className="text-brand-500">Em breve, nossas curadorias especiais estarão aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/colecoes/${collection.slug}`}
              className="group relative aspect-video bg-brand-100 rounded-xl overflow-hidden border border-brand-200 hover:border-brand-400 transition-colors"
            >
              {collection.cover_image && (
                <Image
                  src={collection.cover_image}
                  alt={collection.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="font-display text-xl font-semibold text-white">
                  {collection.title}
                </h3>
                {collection.description && (
                  <p className="text-white/80 text-sm mt-1 line-clamp-2">
                    {collection.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
