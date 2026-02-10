'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, FolderHeart, TrendingUp, AlertCircle, Inbox, Upload, MessageSquare, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  totalProducts: number
  availableProducts: number
  outletProducts: number
  soldProducts: number
  pendingItems: number
  whatsappItems: number
  csvItems: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    availableProducts: 0,
    outletProducts: 0,
    soldProducts: 0,
    pendingItems: 0,
    whatsappItems: 0,
    csvItems: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      const [{ data: products }, { data: pendingAll }] = await Promise.all([
        supabase.from('products').select('status'),
        supabase.from('pending_items').select('status, source').eq('status', 'pending'),
      ])

      if (products) {
        setStats({
          totalProducts: products.length,
          availableProducts: products.filter(p => p.status === 'available').length,
          outletProducts: products.filter(p => p.status === 'outlet').length,
          soldProducts: products.filter(p => p.status === 'sold').length,
          pendingItems: pendingAll?.length || 0,
          whatsappItems: pendingAll?.filter(p => p.source === 'whatsapp').length || 0,
          csvItems: pendingAll?.filter(p => p.source === 'csv').length || 0,
        })
      }
      setLoading(false)
    }

    fetchStats()
  }, [])

  const statCards = [
    { label: 'Total de Peças', value: stats.totalProducts, icon: Package, color: 'bg-brand-100 text-brand-700' },
    { label: 'Disponíveis', value: stats.availableProducts, icon: TrendingUp, color: 'bg-green-100 text-green-700' },
    { label: 'Em Outlet', value: stats.outletProducts, icon: AlertCircle, color: 'bg-red-100 text-red-700' },
    { label: 'Vendidas', value: stats.soldProducts, icon: FolderHeart, color: 'bg-blue-100 text-blue-700' },
  ]

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-semibold">Dashboard</h1>
        <p className="text-brand-500 text-sm mt-1">Visão geral do seu catálogo</p>
      </div>

      {/* Pending Items Alert */}
      {stats.pendingItems > 0 && (
        <Link
          href="/admin/pendentes"
          className="block mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl hover:bg-amber-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Inbox className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-amber-900">
                {stats.pendingItems} {stats.pendingItems === 1 ? 'item aguardando' : 'itens aguardando'} aprovação
              </p>
              <p className="text-sm text-amber-600">
                {stats.whatsappItems > 0 && `${stats.whatsappItems} via WhatsApp`}
                {stats.whatsappItems > 0 && stats.csvItems > 0 && ' • '}
                {stats.csvItems > 0 && `${stats.csvItems} via CSV`}
              </p>
            </div>
            <span className="text-amber-600 text-sm font-medium">Revisar →</span>
          </div>
        </Link>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-2xl p-4 border border-brand-100"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${stat.color} mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-brand-900">
              {loading ? '...' : stat.value}
            </p>
            <p className="text-sm text-brand-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-brand-100">
        <h2 className="font-semibold text-brand-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/importar"
            className="flex items-center gap-4 p-4 bg-brand-900 text-white rounded-xl hover:bg-brand-800 transition-colors"
          >
            <Upload className="w-6 h-6" />
            <div>
              <p className="font-medium">Importar Produtos</p>
              <p className="text-sm opacity-80">CSV, Excel ou texto livre</p>
            </div>
          </Link>
          <Link
            href="/admin/pendentes"
            className="flex items-center gap-4 p-4 bg-amber-50 text-amber-900 rounded-xl hover:bg-amber-100 transition-colors border border-amber-200"
          >
            <Inbox className="w-6 h-6" />
            <div>
              <p className="font-medium">Fila de Aprovação</p>
              <p className="text-sm text-amber-600">Revisar itens pendentes</p>
            </div>
          </Link>
          <Link
            href="/admin/produtos/novo"
            className="flex items-center gap-4 p-4 bg-brand-100 text-brand-900 rounded-xl hover:bg-brand-200 transition-colors"
          >
            <Package className="w-6 h-6" />
            <div>
              <p className="font-medium">Cadastrar Nova Peça</p>
              <p className="text-sm text-brand-600">Adicionar manualmente</p>
            </div>
          </Link>
          <Link
            href="/admin/produtos"
            className="flex items-center gap-4 p-4 bg-brand-100 text-brand-900 rounded-xl hover:bg-brand-200 transition-colors"
          >
            <TrendingUp className="w-6 h-6" />
            <div>
              <p className="font-medium">Gerenciar Estoque</p>
              <p className="text-sm text-brand-600">Editar status das peças</p>
            </div>
          </Link>
          <Link
            href="/admin/colecoes"
            className="flex items-center gap-4 p-4 bg-brand-100 text-brand-900 rounded-xl hover:bg-brand-200 transition-colors"
          >
            <FolderHeart className="w-6 h-6" />
            <div>
              <p className="font-medium">Curadoria & Coleções</p>
              <p className="text-sm text-brand-600">Organizar looks temáticos</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
