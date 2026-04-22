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
  ctaText: 'View Gallery',
  ctaHref: '/gallery',
  backgroundImageUrl: '/uploads/aon%20imgaes/entry%20pictures/FB_IMG_1660169241995.jpg',
  backgroundImageAlt: 'Interior bedroom crafted by Art of Nature',
};
