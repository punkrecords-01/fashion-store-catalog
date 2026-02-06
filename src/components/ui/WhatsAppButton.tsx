'use client'

import { WhatsAppIcon } from './WhatsAppIcon'
import { usePathname } from 'next/navigation'
import { siteConfig } from '@/config/site'

export function WhatsAppButton() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith('/admin')

  if (isAdmin) return null

  const whatsappUrl = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(siteConfig.messages.whatsappDefault)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all hover:scale-110"
      aria-label="Eu quero"
    >
      <WhatsAppIcon className="w-7 h-7" />
    </a>
  )
}
