'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Product } from '@/types'

type CartItem = Product & {
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  totalCount: number
  isInitialized: boolean
  generateCartWhatsAppMessage: () => string
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('fashion-store-cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error('Failed to parse cart', e)
      }
    }
    setIsInitialized(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('fashion-store-cart', JSON.stringify(items))
    }
  }, [items, isInitialized])

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId))
  }

  const clearCart = () => {
    setItems([])
  }

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const generateCartWhatsAppMessage = () => {
    if (items.length === 0) return ''
    
    let message = '*SACOLA - IT\'S COUTURE*\n\n'
    message += 'Oi! Gostaria de pedir estas peças:\n\n'
    items.forEach((item) => {
      message += `• ${item.name.toUpperCase()}\n`
      message += `  Quantidade: ${item.quantity}\n`
      message += `  Preço: ${item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n\n`
    })
    
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    message += `*Total Estimado: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*\n\n`
    message += 'Obrigada!'
    
    return encodeURIComponent(message)
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, totalCount, isInitialized, generateCartWhatsAppMessage }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
