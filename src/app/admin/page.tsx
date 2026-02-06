'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, FolderHeart, TrendingUp, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  totalProducts: number
  availableProducts: number
  outletProducts: number
  soldProducts: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    availableProducts: 0,
    outletProducts: 0,
    soldProducts: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      const { data: products } = await supabase
        .from('products')
        .select('status')

      if (products) {
        setStats({
          totalProducts: products.length,
          availableProducts: products.filter(p => p.status === 'available').length,
          outletProducts: products.filter(p => p.status === 'outlet').length,
          soldProducts: products.filter(p => p.status === 'sold').length,
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
            href="/admin/produtos/novo"
            className="flex items-center gap-4 p-4 bg-brand-900 text-white rounded-xl hover:bg-brand-800 transition-colors"
          >
            <Package className="w-6 h-6" />
            <div>
              <p className="font-medium">Cadastrar Nova Peça</p>
              <p className="text-sm opacity-80">Adicionar produto ao catálogo</p>
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
        </div>
      </div>
    </div>
  )
}
