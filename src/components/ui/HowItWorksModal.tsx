'use client'

import { useState, useEffect } from 'react'
import { X, HelpCircle, MessageSquare, ShoppingBag, ArrowRight } from 'lucide-react'
import { WhatsAppIcon } from './WhatsAppIcon'
import { usePathname } from 'next/navigation'

interface HowItWorksModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export function HowItWorksModal({ open, onOpenChange, showTrigger = false }: HowItWorksModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  
  const isOpen = open !== undefined ? open : internalIsOpen
  const setIsOpen = onOpenChange !== undefined ? onOpenChange : setInternalIsOpen

  const steps = [
    {
      icon: HelpCircle,
      title: "Explore o Catálogo",
      description: "Navegue por nossas peças exclusivas. Cada item é selecionado para oferecer o melhor da alta-costura e tendências premium."
    },
    {
      icon: ShoppingBag,
      title: "Monte sua Sacola",
      description: "Adicione as peças que você gostou na sacola. Isso ajuda você a organizar seu pedido e enviar tudo de uma vez."
    },
    {
      icon: WhatsAppIcon,
      title: "Chame no WhatsApp",
      description: "Ao finalizar, você será direcionado para o WhatsApp de uma de nossas atendentes para confirmar tamanhos e frete."
    },
    {
      icon: MessageSquare,
      title: "Finalize sua Compra",
      description: "Não realizamos pagamentos pelo site. Tudo é feito de forma personalizada e segura via atendimento direto."
    }
  ]

  return (
    <>
      {showTrigger && (
        <button 
          onClick={() => setIsOpen(true)}
          className="text-[10px] font-bold tracking-[0.2em] text-brand-900 border-b border-brand-900 pb-1 hover:text-brand-600 hover:border-brand-600 transition-colors uppercase"
        >
          Como funciona?
        </button>
      )}

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-brand-950">Como Comprar</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 text-brand-400 hover:text-brand-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-brand-50 flex items-center justify-center rounded-full text-brand-900">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-brand-950">
                      {idx + 1}. {step.title}
                    </h3>
                    <p className="text-[11px] leading-relaxed text-brand-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 bg-brand-50 text-center">
              <p className="text-[9px] font-medium tracking-widest text-brand-400 uppercase">
                Atendimento personalizado para você
              </p>
              <button 
                onClick={() => setIsOpen(false)}
                className="mt-4 flex items-center justify-center gap-2 mx-auto text-[10px] font-bold tracking-[0.2em] uppercase text-brand-950 hover:gap-3 transition-all underline underline-offset-4"
              >
                Entendi, vamos lá <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
