'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, FolderHeart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Collection } from '@/types'

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCollections = async () => {
      const { data } = await supabase
        .from('collections')
        .select('*')
        .order('display_order', { ascending: true })

      if (data) {
        setCollections(data as Collection[])
      }
      setLoading(false)
    }

    fetchCollections()
  }, [])

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold">Coleções</h1>
          <p className="text-brand-500 text-sm mt-1">Curadorias editoriais</p>
        </div>
        <Link
          href="/admin/colecoes/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-900 text-white rounded-xl hover:bg-brand-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Coleção
        </Link>
      </div>

      {/* Info */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-amber-800">
          <strong>Dica:</strong> Coleções são agrupamentos temáticos de peças, como "Novidades da Semana" ou "Looks para Trabalho". 
          Ajudam a direcionar clientes do Instagram para peças específicas.
        </p>
      </div>

      {/* Collections List */}
      {loading ? (
        <div className="text-center py-12 text-brand-400">Carregando...</div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-brand-100">
          <FolderHeart className="w-12 h-12 text-brand-200 mx-auto mb-4" />
          <p className="text-brand-500">Nenhuma coleção criada ainda.</p>
          <p className="text-sm text-brand-400 mt-1">
            Use o SQL no Supabase para adicionar coleções de exemplo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/admin/colecoes/${collection.id}`}
              className="bg-white rounded-2xl p-6 border border-brand-100 hover:border-brand-300 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-brand-900 group-hover:text-brand-700 transition-colors">
                    {collection.title}
                  </h3>
                  <p className="text-sm text-brand-500 mt-1 line-clamp-2">{collection.description}</p>
                  <p className="text-xs text-brand-400 mt-2">
                    {collection.product_ids?.length || 0} peças
                  </p>
                </div>
                <span className={`flex-shrink-0 px-2 py-1 text-xs rounded-full ${
                  collection.published 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {collection.published ? 'Publicada' : 'Rascunho'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
