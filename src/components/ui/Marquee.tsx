'use client'

import { cn } from '@/lib/utils'

interface MarqueeProps {
  items: string[]
  className?: string
  reverse?: boolean
  speed?: 'slow' | 'medium' | 'fast'
}

export function Marquee({ 
  items, 
  className, 
  reverse = false,
  speed = 'medium' 
}: MarqueeProps) {
  const speedMap = {
    slow: 'animate-marquee-slow',
    medium: 'animate-marquee',
    fast: 'animate-marquee-fast',
  }

  // Duplicate items to ensure smooth infinite loop
  const displayItems = [...items, ...items, ...items, ...items]

  return (
    <div className={cn("relative flex overflow-x-hidden border-y border-brand-100 bg-white py-3", className)}>
      <div className={cn(
        "flex whitespace-nowrap",
        speedMap[speed],
        reverse && "direction-reverse"
      )}>
        {displayItems.map((item, idx) => (
          <div key={idx} className="flex items-center mx-8">
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white">
              {item}
            </span>
            <span className="ml-16 text-[#D4AF37] text-[10px]">✦</span>
          </div>
        ))}
      </div>
    </div>
  )
}
