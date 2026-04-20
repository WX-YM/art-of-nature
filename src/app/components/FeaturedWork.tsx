import { ImageWithFallback } from './figma/ImageWithFallback';

const categories = [
  {
    title: 'Custom Furniture',
    description: 'Bespoke tables, seating, and storage',
    image: 'https://images.unsplash.com/photo-1612022565287-136b9c669781?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    featured: true
  },
  {
    title: 'Architectural Elements',
    description: 'Wall panels, doors, and fixtures',
    image: 'https://images.unsplash.com/photo-1772442364436-6ee6e42302a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    featured: false
  },
  {
    title: 'Interior Details',
    description: 'Shelving, accents, and custom joinery',
    image: 'https://images.unsplash.com/photo-1693904456872-af57325d0dbd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    featured: false
  },
  {
    title: 'Material Studies',
    description: 'Exploring wood grain and natural finishes',
    image: 'https://images.unsplash.com/photo-1763392199096-6efd9d28d8cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
    featured: false
  }
];

export function FeaturedWork() {
  return (
    <section id="work" className="py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="mb-16">
          <p className="mb-4 tracking-widest opacity-60">PORTFOLIO</p>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: '1.2' }}>
            Previous Work
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden bg-white ${
                category.featured ? 'lg:col-span-2 h-[600px]' : 'h-[500px]'
              }`}
            >
              <ImageWithFallback
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="mb-2" style={{ fontSize: '1.75rem' }}>{category.title}</h3>
                <p className="opacity-90">{category.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
