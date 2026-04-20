import { ImageWithFallback } from './figma/ImageWithFallback';

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1660796334938-cf0b03be7e6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000"
          alt="Artisan crafting wood"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 text-center text-white">
        <p className="mb-4 tracking-widest opacity-90">BESPOKE CRAFTSMANSHIP</p>
        <h1 className="mb-8 leading-tight max-w-3xl mx-auto" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
          Custom-Made Pieces<br />with Authentic Character
        </h1>
        <p className="max-w-2xl mx-auto mb-12 opacity-90" style={{ fontSize: '1.125rem', lineHeight: '1.8' }}>
          Every piece we create is tailored to your space, handcrafted from natural materials with meticulous attention to detail and timeless design.
        </p>
        <a href="#work" className="inline-block px-8 py-4 bg-white text-primary hover:bg-opacity-90 transition-all">
          Explore Our Work
        </a>
      </div>
    </section>
  );
}
