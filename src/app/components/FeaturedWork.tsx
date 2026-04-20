import { ArrowUpRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const categories = [
  {
    title: 'Custom Furniture',
    description: 'Bespoke tables, seating, and storage',
    image: 'https://images.unsplash.com/photo-1612022565287-136b9c669781?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    featured: true,
    label: 'Signature build',
  },
  {
    title: 'Architectural Elements',
    description: 'Wall panels, doors, and fixtures',
    image: 'https://images.unsplash.com/photo-1772442364436-6ee6e42302a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    featured: false,
    label: 'Spatial details',
  },
  {
    title: 'Interior Details',
    description: 'Shelving, accents, and custom joinery',
    image: 'https://images.unsplash.com/photo-1693904456872-af57325d0dbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    featured: false,
    label: 'Storage systems',
  },
  {
    title: 'Material Studies',
    description: 'Exploring wood grain and natural finishes',
    image: 'https://images.unsplash.com/photo-1763392199096-6efd9d28d8cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    featured: false,
    label: 'Surface language',
  },
];

export function FeaturedWork() {
  return (
    <section id="work" className="scroll-mt-28 bg-background py-20 sm:py-24 lg:py-32">
      <div className="section-shell">
        <div className="mb-14 flex flex-col gap-5 sm:mb-16 lg:flex-row lg:items-end lg:justify-between">
          <div className="reveal-up max-w-2xl">
            <p className="section-kicker">Portfolio</p>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 4.2rem)', lineHeight: '1.02' }}>
              Previous Work
            </h2>
            <p className="mt-5 max-w-xl text-[1.03rem] leading-8 text-foreground/72">
              A mix of statement pieces, architectural interventions, and refined details designed to feel rooted in place.
            </p>
          </div>

          <a
            href="#contact"
            className="reveal-up inline-flex items-center gap-2 self-start border border-border bg-white px-5 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
            style={{ animationDelay: '0.1s' }}
          >
            Start a Similar Project
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {categories.map((category, index) => (
            <a
              href="#contact"
              key={category.title}
              className={`reveal-up group relative overflow-hidden border border-border bg-white shadow-[0_20px_60px_rgba(45,41,38,0.08)] ${
                category.featured ? 'md:col-span-2 min-h-[28rem] sm:min-h-[36rem]' : 'min-h-[24rem] sm:min-h-[30rem]'
              }`}
              style={{ animationDelay: `${0.12 * (index + 1)}s` }}
            >
              <ImageWithFallback
                src={category.image}
                alt={category.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/18 to-black/0 opacity-100 md:opacity-95" />
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 sm:p-7">
                <span className="border border-white/18 bg-black/20 px-3 py-2 text-[0.72rem] font-medium uppercase tracking-[0.28em] text-white/84 backdrop-blur-sm">
                  {category.label}
                </span>
                {category.featured && (
                  <span className="border border-white/18 bg-white/10 px-3 py-2 text-[0.72rem] uppercase tracking-[0.28em] text-white/84 backdrop-blur-sm">
                    Featured
                  </span>
                )}
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 lg:p-10">
                <div className="max-w-xl">
                  <h3 className="text-[1.7rem] leading-tight sm:text-[2rem]">{category.title}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-white/82 sm:text-base">
                    {category.description}
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white">
                    Discuss this direction
                    <ArrowUpRight size={16} />
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
