'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, ShoppingBag } from 'lucide-react'
import { siteConfig } from '@/config/site'
import { cn } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { BagDrawer } from './BagDrawer'
import { useEffect, useRef } from 'react'
import { HowItWorksModal } from '../ui/HowItWorksModal'

export function Header() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isBagOpen, setIsBagOpen] = useState(false)
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false)
  const { totalCount, isInitialized } = useCart()
  const prevCountRef = useRef(totalCount)
  const isHydratedRef = useRef(false)

  // Wait for cart initialization before allowing auto-open
  useEffect(() => {
    if (isInitialized) {
      // Small delay to ensure we don't trigger on the very first render after init
      setTimeout(() => {
        isHydratedRef.current = true
        prevCountRef.current = totalCount
      }, 100)
    }
  }, [isInitialized, totalCount])

  // Open bag drawer when items are added (only after hydration)
  useEffect(() => {
    if (isHydratedRef.current && totalCount > prevCountRef.current && !isAdmin) {
      setIsBagOpen(true)
    }
    prevCountRef.current = totalCount
  }, [totalCount, isAdmin])

  // Onboarding logic (only in Header, once)
  useEffect(() => {
    if (isAdmin) return

    const hasSeenOnboarding = localStorage.getItem('itscouture_onboarding_seen')
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setIsHowItWorksOpen(true)
        localStorage.setItem('itscouture_onboarding_seen', 'true')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isAdmin])

  const navLinks = [
    { label: 'CATÁLOGO', href: '/' },
    { label: 'COLEÇÕES', href: '/colecoes' },
  ]

  if (isAdmin) {
    return (
      <header className="fixed top-0 z-[100] w-full bg-white/90 backdrop-blur-sm lg:hidden">
        <div className="px-6">
          <div className="flex h-16 items-center justify-between border-b border-gray-100">
            <Link href="/" className="group">
              <span className="font-logo text-lg tracking-widest text-brand-950 transition-colors group-hover:text-brand-600 uppercase">
                it&apos;s couture
              </span>
            </Link>
            <span className="text-[10px] font-bold tracking-[0.2em] text-brand-400 uppercase">ADMIN</span>
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="fixed top-0 z-[100] w-full bg-white/90 backdrop-blur-sm">
      <div className="px-6 md:px-12">
        <div className="flex h-16 items-center justify-between border-b border-gray-100">
          {/* Logo */}
          <Link href="/" className="group">
            <span className="font-logo text-lg tracking-widest text-brand-950 transition-colors group-hover:text-brand-600 uppercase">
              it&apos;s couture
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.label}
                href={link.href} 
                className="text-[10px] font-bold tracking-[0.2em] text-brand-800 hover:text-brand-950 transition-all uppercase"
              >
                {link.label}
              </Link>
            ))}
            <button 
              onClick={() => setIsHowItWorksOpen(true)}
              className="text-[10px] font-bold tracking-[0.2em] text-brand-800 hover:text-brand-950 transition-all uppercase"
            >
              COMO FUNCIONA?
            </button>
            <button 
              onClick={() => setIsBagOpen(true)}
              className="p-1 text-brand-800 hover:text-brand-950 transition-colors relative" 
              aria-label="Minha Sacola"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                  {totalCount}
                </span>
              )}
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 sm:hidden">
            <button 
              onClick={() => setIsBagOpen(true)}
              className="p-1 text-brand-800 hover:text-brand-950 transition-colors relative" 
              aria-label="Minha Sacola"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-bold text-white">
                  {totalCount}
                </span>
              )}
            </button>
            <button
              className="p-1 text-brand-800 hover:text-brand-950"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Navigation Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 top-16 z-[95] bg-white sm:hidden animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-8 space-y-8">
            {navLinks.map((link) => (
              <Link 
                key={link.label}
                href={link.href} 
                onClick={() => setIsMenuOpen(false)}
                className="text-sm font-bold tracking-[0.3em] text-brand-950 uppercase"
              >
                {link.label}
              </Link>
            ))}
            <button 
              onClick={() => {
                setIsHowItWorksOpen(true)
                setIsMenuOpen(false)
              }}
              className="text-left text-sm font-bold tracking-[0.3em] text-brand-950 uppercase"
            >
              COMO FUNCIONA?
            </button>
          </nav>
        </div>
      )}

      <BagDrawer isOpen={isBagOpen} onClose={() => setIsBagOpen(false)} />
      <HowItWorksModal open={isHowItWorksOpen} onOpenChange={setIsHowItWorksOpen} />
    </>
  )
}

