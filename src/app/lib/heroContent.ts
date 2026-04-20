export type HeroContent = {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  backgroundImageUrl: string;
  backgroundImageAlt: string;
};

export const defaultHeroContent: HeroContent = {
  eyebrow: 'BESPOKE CRAFTSMANSHIP',
  headingLine1: 'Custom-Made Pieces',
  headingLine2: 'with Authentic Character',
  description:
    'Every piece we create is tailored to your space, handcrafted from natural materials with meticulous attention to detail and timeless design.',
  ctaText: 'Explore Our Work',
  ctaHref: '#work',
  backgroundImageUrl:
    'https://images.unsplash.com/photo-1660796334938-cf0b03be7e6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000',
  backgroundImageAlt: 'Artisan crafting wood',
};
