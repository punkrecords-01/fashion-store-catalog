import Image from 'next/image'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative h-[90vh] w-full bg-brand-50 overflow-hidden">
      {/* Background Image - Using a placeholder or the first collection image logic might be better but for now let's use a nice layout */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
          alt="Fashion Hero"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
        <span className="text-xs md:text-sm font-bold tracking-[0.4em] uppercase mb-4 drop-shadow-md">
          Featured Collection
        </span>
        <h1 className="font-logo text-6xl md:text-9xl tracking-tighter mb-8 drop-shadow-xl leading-[0.8]">
          IT&apos;S THE <br />
          COLLECTIONS
        </h1>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <Link 
            href="/colecoes" 
            className="px-10 py-4 bg-white text-brand-900 text-xs font-bold tracking-[0.2em] uppercase hover:bg-brand-900 hover:text-white transition-all"
          >
            Explore Collections
          </Link>
          <Link 
            href="#shop" 
            className="px-10 py-4 bg-transparent border border-white text-white text-xs font-bold tracking-[0.2em] uppercase hover:bg-white hover:text-brand-900 transition-all"
          >
            Shop All
          </Link>
        </div>
      </div>

      {/* Seasonal Text Vertical */}
      <div className="absolute right-8 bottom-24 hidden lg:block rotate-90 origin-right">
        <span className="text-[10px] font-bold tracking-[0.4em] uppercase text-white/60">
          Fall / Winter 2024
        </span>
      </div>
    </section>
  )
}
