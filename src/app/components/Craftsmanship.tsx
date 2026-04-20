export function Craftsmanship() {
  const eyebrow = 'OUR APPROACH'.trim();
  const heading = 'Why Custom-Made Matters'.trim();
  const description =
    'In a world of mass production, we believe in the value of pieces created with intention, skill, and respect for both material and maker.'.trim();

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
  ]
    .map((principle) => ({
      title: principle.title?.trim(),
      description: principle.description?.trim(),
    }))
    .filter((principle) => principle.title || principle.description);

  return (
    <section className="overflow-hidden bg-primary py-20 text-primary-foreground sm:py-24 lg:py-32">
      <div className="section-shell relative">
        <div className="absolute right-0 top-0 hidden h-64 w-64 translate-x-1/3 rounded-full bg-white/6 blur-3xl lg:block" />
        <div className="reveal-up max-w-3xl">
          {eyebrow && <p className="section-kicker text-primary-foreground/65">{eyebrow}</p>}
          {heading && (
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)', lineHeight: '1.02' }}>
              {heading}
            </h2>
          )}
          {description && (
            <p className="mt-6 max-w-2xl text-base text-primary-foreground/78 sm:text-lg" style={{ lineHeight: '1.9' }}>
              {description}
            </p>
          )}
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {principles.map((principle, index) => (
            <div
              key={principle.title ?? index}
              className="reveal-up border border-white/12 bg-white/6 p-6 backdrop-blur-sm"
              style={{ animationDelay: `${0.12 * (index + 1)}s` }}
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="h-px w-12 bg-primary-foreground/30" />
                <span className="text-sm text-primary-foreground/45">0{index + 1}</span>
              </div>
              {principle.title && <h3 className="text-[1.4rem] leading-tight">{principle.title}</h3>}
              {principle.description && (
                <p className="mt-4 text-sm text-primary-foreground/72 sm:text-base" style={{ lineHeight: '1.8' }}>
                  {principle.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
