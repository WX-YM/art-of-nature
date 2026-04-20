import { ImageWithFallback } from './figma/ImageWithFallback';

export function About() {
  return (
    <section id="about" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="mb-4 tracking-widest opacity-60">ABOUT US</p>
            <h2 className="mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: '1.2' }}>
              Craftsmanship Rooted in Authenticity
            </h2>
            <div className="space-y-6 opacity-80" style={{ fontSize: '1.0625rem', lineHeight: '1.8' }}>
              <p>
                Art of Nature is a custom craftsmanship studio dedicated to creating bespoke pieces that honor natural materials and traditional techniques.
              </p>
              <p>
                Each project begins with understanding your vision, your space, and the story you want to tell. We work closely with clients to design and build furniture, installations, and architectural elements that are as unique as the spaces they inhabit.
              </p>
              <p>
                Our work is not mass-produced. It's made to order, made by hand, and made to last.
              </p>
            </div>
          </div>

          <div className="relative h-[600px]">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1722411927625-0e478acf502b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
              alt="Artisan working on wood piece"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
