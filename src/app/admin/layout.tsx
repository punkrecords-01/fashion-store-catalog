'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutGrid, 
  Package, 
  FolderHeart, 
  LogOut, 
  Menu, 
  X,
  Plus,
  Home
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session && pathname !== '/admin/login') {
        router.push('/admin/login')
        return
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [router, pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="animate-pulse text-brand-400">Carregando...</div>
      </div>
    )
  }

  const navItems = [
    { href: '/admin', icon: LayoutGrid, label: 'Dashboard' },
    { href: '/admin/produtos', icon: Package, label: 'Peças' },
    { href: '/admin/colecoes', icon: FolderHeart, label: 'Coleções' },
  ]

  return (
    <div className="min-h-screen bg-brand-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-brand-100 z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-brand-600 hover:text-brand-900"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-logo text-lg tracking-widest text-brand-950 uppercase">it&apos;s couture</span>
        <Link href="/admin/produtos/novo" className="p-2 text-brand-900">
          <Plus className="w-6 h-6" />
        </Link>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 h-full w-64 bg-white border-r border-brand-100 z-50 transform transition-transform duration-200',
        'lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-brand-100">
          <span className="font-logo text-lg tracking-widest text-brand-950 uppercase">it&apos;s couture</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-brand-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                pathname === item.href
                  ? 'bg-brand-900 text-white'
                  : 'text-brand-600 hover:bg-brand-100'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-brand-100">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-sm text-brand-600 hover:text-brand-900 transition-colors"
          >
            <Home className="w-5 h-5" />
            Ver Catálogo
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:text-red-700 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
