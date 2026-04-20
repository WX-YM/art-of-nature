import { ImageWithFallback } from './figma/ImageWithFallback';

const articles = [
  {
    title: 'The Art of Wood Selection',
    excerpt: 'How we choose timber for each project, considering grain patterns, durability, and character.',
    date: 'April 15, 2026',
    image: 'https://images.unsplash.com/photo-1763392199096-6efd9d28d8cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    category: 'Materials'
  },
  {
    title: 'Designing for Longevity',
    excerpt: 'Creating furniture that transcends trends and becomes part of your home\'s story.',
    date: 'April 8, 2026',
    image: 'https://images.unsplash.com/photo-1607073297082-07da3b1014dd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    category: 'Philosophy'
  },
  {
    title: 'Traditional Joinery Methods',
    excerpt: 'Exploring mortise and tenon, dovetails, and other time-honored woodworking techniques.',
    date: 'March 28, 2026',
    image: 'https://images.unsplash.com/photo-1761544775976-0c81b00e81d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    category: 'Technique'
  }
];

export function BlogPreview() {
  return (
    <section id="journal" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-end justify-between mb-16">
          <div>
            <p className="mb-4 tracking-widest opacity-60">INSIGHTS</p>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: '1.2' }}>
              Journal
            </h2>
          </div>
          <a href="#" className="hover:text-accent transition-colors">View All Articles →</a>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {articles.map((article, index) => (
            <article key={index} className="group">
              <div className="mb-6 overflow-hidden bg-secondary">
                <ImageWithFallback
                  src={article.image}
                  alt={article.title}
                  className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <p className="mb-3 tracking-wider opacity-60" style={{ fontSize: '0.8125rem' }}>
                {article.category.toUpperCase()} · {article.date}
              </p>
              <h3 className="mb-3 group-hover:text-accent transition-colors" style={{ fontSize: '1.5rem', lineHeight: '1.3' }}>
                {article.title}
              </h3>
              <p className="opacity-70" style={{ lineHeight: '1.7' }}>
                {article.excerpt}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
