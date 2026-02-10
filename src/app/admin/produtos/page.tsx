'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product, STATUS_LABELS, CATEGORY_LABELS } from '@/types'
import { formatPrice, cn } from '@/lib/utils'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setProducts(data as Product[])
    }
    setLoading(false)
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredProducts.map(p => p.id))
    }
  }

  const toggleSelectProduct = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir ${selectedIds.length} peças?`)) return
    
    setLoading(true)
    const { error } = await supabase
      .from('products')
      .delete()
      .in('id', selectedIds)
    
    if (error) {
      console.error('Erro ao excluir produtos:', error)
      alert('Erro ao excluir produtos. Algumas peças podem estar vinculadas a outros registros.')
    } else {
      setProducts(products.filter(p => !selectedIds.includes(p.id)))
      setSelectedIds([])
    }
    setLoading(false)
  }

  const handleBulkStatusUpdate = async (status: string) => {
    setLoading(true)
    const { error } = await supabase
      .from('products')
      .update({ status })
      .in('id', selectedIds)
    
    if (error) {
      console.error('Erro ao atualizar produtos:', error)
      alert('Erro ao atualizar status dos produtos.')
    } else {
      setProducts(products.map(p => 
        selectedIds.includes(p.id) ? { ...p, status: status as Product['status'] } : p
      ))
      setSelectedIds([])
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('products')
      .update({ status })
      .eq('id', id)
    
    if (error) {
      alert('Erro ao atualizar status.')
    } else {
      setProducts(products.map(p => 
        p.id === id ? { ...p, status: status as Product['status'] } : p
      ))
    }
    setMenuOpen(null)
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta peça?')) return
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Erro ao excluir produto:', error)
      alert('Erro ao excluir peça. Ela pode estar vinculada a um item da fila de aprovação.')
    } else {
      setProducts(products.filter(p => p.id !== id))
    }
    setMenuOpen(null)
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.reference_code?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || p.status === filter
    return matchesSearch && matchesFilter
  })

  const statusColors: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    last_unit: 'bg-amber-100 text-amber-700',
    outlet: 'bg-red-100 text-red-700',
    sold: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-semibold">Peças</h1>
          <p className="text-brand-500 text-sm mt-1">{products.length} peças cadastradas</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-900 text-white rounded-xl hover:bg-brand-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Peça
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou referência..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-brand-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-900"
        >
          <option value="all">Todos os status</option>
          <option value="available">Disponíveis</option>
          <option value="last_unit">Última unidade</option>
          <option value="outlet">Outlet</option>
          <option value="sold">Vendidos</option>
        </select>
      </div>

      {/* Bulk Actions BAR */}
      {selectedIds.length > 0 && (
        <div className="mb-6 p-4 bg-brand-900 text-white rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <span className="font-medium">{selectedIds.length} selecionados</span>
            <div className="h-6 w-px bg-brand-700" />
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkStatusUpdate('available')}
                className="px-3 py-1 text-xs bg-brand-800 hover:bg-brand-700 rounded-lg transition-colors"
              >
                Marcar Disponível
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('sold')}
                className="px-3 py-1 text-xs bg-brand-800 hover:bg-brand-700 rounded-lg transition-colors"
              >
                Marcar Vendido
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('outlet')}
                className="px-3 py-1 text-xs bg-brand-800 hover:bg-brand-700 rounded-lg transition-colors"
              >
                Mover p/ Outlet
              </button>
            </div>
          </div>
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl transition-colors font-medium text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Excluir {selectedIds.length === filteredProducts.length ? 'Tudo' : ''}
          </button>
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <div className="text-center py-12 text-brand-400">Carregando...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-brand-100">
          <p className="text-brand-500">Nenhuma peça encontrada.</p>
          <Link href="/admin/produtos/novo" className="text-brand-900 underline mt-2 inline-block">
            Cadastrar primeira peça
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-brand-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-100">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-brand-300 text-brand-900 focus:ring-brand-900"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-500 uppercase">Peça</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-500 uppercase hidden sm:table-cell">Categoria</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-500 uppercase">Preço</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-brand-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-brand-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {filteredProducts.map((product) => (
                  <tr 
                    key={product.id} 
                    className={cn(
                      "hover:bg-brand-50 transition-colors",
                      selectedIds.includes(product.id) && "bg-brand-50"
                    )}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        className="w-4 h-4 rounded border-brand-300 text-brand-900 focus:ring-brand-900"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-brand-100 rounded-lg overflow-hidden flex-shrink-0">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-300 text-xs">
                              Sem foto
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-brand-900 truncate">{product.name}</p>
                          <p className="text-xs text-brand-400">{product.reference_code || 'Sem ref.'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-brand-600">
                        {CATEGORY_LABELS[product.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-brand-900">{formatPrice(product.price)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-block px-2 py-1 text-xs font-medium rounded-full',
                        statusColors[product.status]
                      )}>
                        {STATUS_LABELS[product.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() => setMenuOpen(menuOpen === product.id ? null : product.id)}
                          className="p-2 hover:bg-brand-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-brand-500" />
                        </button>
                        
                        {menuOpen === product.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setMenuOpen(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-brand-100 z-20 py-1">
                              <Link
                                href={`/produto/${product.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-brand-600 hover:bg-brand-50"
                              >
                                <Eye className="w-4 h-4" /> Ver no catálogo
                              </Link>
                              <Link
                                href={`/admin/produtos/${product.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-brand-600 hover:bg-brand-50"
                              >
                                <Edit className="w-4 h-4" /> Editar
                              </Link>
                              <hr className="my-1" />
                              <button
                                onClick={() => updateStatus(product.id, 'available')}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                              >
                                Marcar Disponível
                              </button>
                              <button
                                onClick={() => updateStatus(product.id, 'sold')}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-brand-600 hover:bg-brand-50"
                              >
                                Marcar Vendido
                              </button>
                              <button
                                onClick={() => updateStatus(product.id, 'outlet')}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Mover p/ Outlet
                              </button>
                              <hr className="my-1" />
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" /> Excluir
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
