'use client'

import { X, Trash2, ShoppingBag } from 'lucide-react'
import { WhatsAppIcon } from '../ui/WhatsAppIcon'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import { siteConfig } from '@/config/site'
import { useEffect, useState } from 'react'

interface BagDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function BagDrawer({ isOpen, onClose }: BagDrawerProps) {
  const { items, removeItem, totalCount, generateCartWhatsAppMessage } = useCart()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${generateCartWhatsAppMessage()}`

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-[1000] bg-black/40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-[1001] w-full max-w-md bg-white shadow-2xl transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-950 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Minha Sacola ({totalCount})
            </h2>
            <button 
              onClick={onClose}
              className="p-2 -mr-2 text-brand-400 hover:text-brand-950 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <p className="text-brand-400 text-sm uppercase tracking-widest">Sua sacola está vazia</p>
                <button 
                  onClick={onClose}
                  className="text-[10px] font-bold tracking-[0.2em] uppercase underline underline-offset-4 hover:text-brand-600"
                >
                  Continuar explorando
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="relative w-24 aspect-square bg-gray-50 flex-shrink-0">
                      {item.images[0] && (
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex justify-between items-start">
                        <h3 className="text-[10px] font-bold uppercase tracking-wider text-brand-950 truncate pr-4">
                          {item.name}
                        </h3>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-brand-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-brand-400 mt-1 uppercase tracking-widest leading-loose">
                        Qtd: {item.quantity}
                      </p>
                      <p className="text-[10px] text-brand-900 mt-2 font-bold tracking-widest">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-400">Total Estimado</span>
                <span className="text-sm font-bold tracking-widest text-brand-950">{formatPrice(total)}</span>
              </div>
              
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 bg-green-500 text-white text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-green-600 transition-all group"
              >
                <WhatsAppIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {items.length > 1 ? 'Quero essas' : 'Quero essa'}
              </a>
              
              <p className="text-[10px] text-brand-500 text-center uppercase tracking-widest font-medium">
                Você será direcionada para finalizar com nossa equipe
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
