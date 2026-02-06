import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

export function generateWhatsAppLink(productName: string, collectionName?: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5566996805109'
  
  let message = `Oi! Gostei da peça "${productName}"`
  if (collectionName) {
    message += ` da coleção "${collectionName}"`
  }
  message += '. Tem no meu tamanho?'
  
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}
