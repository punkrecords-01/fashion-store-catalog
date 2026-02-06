export const siteConfig = {
  name: "It's Couture",
  description: 'Catálogo de moda feminina - Encontre a peça perfeita para você',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5566996805109',
  instagram: '@itscouture', // Ajustar quando tiver
  
  // SEO
  keywords: [
    'moda feminina',
    'roupas femininas',
    'vestidos',
    'blusas',
    'calças',
    'acessórios',
    'outlet',
    'Its Couture',
  ],
  
  // Mensagens padrão
  messages: {
    whatsappDefault: 'Oi! Vi o catálogo e gostaria de mais informações.',
    whatsappProduct: (name: string) => `Oi! Gostei da peça "${name}". Tem no meu tamanho?`,
    whatsappCollection: (productName: string, collectionName: string) => 
      `Oi! Gostei da peça "${productName}" da coleção "${collectionName}". Tem no meu tamanho?`,
  },
}

export type SiteConfig = typeof siteConfig
