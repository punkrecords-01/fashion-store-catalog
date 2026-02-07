'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { HowItWorksModal } from '../ui/HowItWorksModal'

export function Footer() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) return null

  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="container-app">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* About */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold tracking-[0.2em] text-brand-900 uppercase">Sobre Nós</h4>
            <p className="text-xs leading-relaxed text-brand-500 max-w-xs">
              {siteConfig.description || "Moda feminina com estilo e personalidade, trazendo as últimas tendências com curadorias exclusivas."}
            </p>
            <HowItWorksModal showTrigger />
          </div>

          {/* Quick Links 1 */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold tracking-[0.2em] text-brand-900 uppercase">Links Úteis</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-[10px] font-medium text-brand-500 hover:text-brand-900 uppercase tracking-widest">Privacidade</Link></li>
              <li><Link href="#" className="text-[10px] font-medium text-brand-500 hover:text-brand-900 uppercase tracking-widest">FAQ</Link></li>
              <li><Link href="#" className="text-[10px] font-medium text-brand-500 hover:text-brand-900 uppercase tracking-widest">Envios</Link></li>
            </ul>
          </div>

          {/* Quick Links 2 */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold tracking-[0.2em] text-brand-900 uppercase">Suporte</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-[10px] font-medium text-brand-500 hover:text-brand-900 uppercase tracking-widest">Termos</Link></li>
              <li><Link href="#" className="text-[10px] font-medium text-brand-500 hover:text-brand-900 uppercase tracking-widest">Carreiras</Link></li>
              <li><Link href="#" className="text-[10px] font-medium text-brand-500 hover:text-brand-900 uppercase tracking-widest">Lojas</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold tracking-[0.2em] text-brand-900 uppercase">Assine nossa News</h4>
            <div className="flex flex-col space-y-4">
              <div className="relative group">
                <input 
                  type="email" 
                  placeholder="SEU E-MAIL" 
                  className="w-full bg-brand-50 border-none px-4 py-3 text-[10px] font-bold tracking-widest focus:ring-1 focus:ring-brand-900 transition-all outline-none"
                />
                <button className="absolute right-0 top-0 h-full px-4 bg-brand-900 text-white text-[10px] font-bold tracking-widest hover:bg-brand-800 transition-colors uppercase">
                  Assinar
                </button>
              </div>
              
              {/* Social Icons (matching ref style) */}
              <div className="flex items-center space-x-4 pt-2">
                <a href="#" className="text-brand-400 hover:text-brand-900 transition-colors"><Facebook className="w-4 h-4" /></a>
                <a href="#" className="text-brand-400 hover:text-brand-900 transition-colors"><Instagram className="w-4 h-4" /></a>
                <a href="#" className="text-brand-400 hover:text-brand-900 transition-colors"><Twitter className="w-4 h-4" /></a>
                <a href="#" className="text-brand-400 hover:text-brand-900 transition-colors"><Mail className="w-4 h-4" /></a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-gray-100 gap-4">
          <p className="text-[10px] font-medium tracking-widest text-brand-400 uppercase">
            © {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
          </p>
          <Link href="/" className="font-logo text-xl tracking-widest text-brand-900 uppercase">
            it&apos;s couture
          </Link>
        </div>
      </div>
    </footer>
  )
}
