export function Craftsmanship() {
  const principles = [
    {
      title: 'Made to Order',
      description: 'Every piece begins with a conversation. We design specifically for your space, your needs, and your vision.'
    },
    {
      title: 'Natural Materials',
      description: 'We work primarily with sustainably sourced hardwoods, celebrating the inherent beauty and character of each piece of timber.'
    },
    {
      title: 'Traditional Techniques',
      description: 'Time-honored joinery methods combined with contemporary design sensibilities create pieces that endure.'
    },
    {
      title: 'Built to Last',
      description: 'Our commitment to quality means furniture that becomes part of your life for generations, not seasons.'
    }
  ];

  return (
    <section className="py-32 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="max-w-3xl mb-20">
          <p className="mb-4 tracking-widest opacity-70">OUR APPROACH</p>
          <h2 className="mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: '1.2' }}>
            Why Custom-Made Matters
          </h2>
          <p className="opacity-80" style={{ fontSize: '1.125rem', lineHeight: '1.8' }}>
            In a world of mass production, we believe in the value of pieces created with intention, skill, and respect for both material and maker.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {principles.map((principle, index) => (
            <div key={index}>
              <div className="mb-4 w-12 h-px bg-primary-foreground/30" />
              <h3 className="mb-4" style={{ fontSize: '1.25rem' }}>{principle.title}</h3>
              <p className="opacity-70" style={{ lineHeight: '1.7' }}>{principle.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
