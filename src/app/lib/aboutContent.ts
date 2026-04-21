export type AboutContent = {
  eyebrow: string;
  heading: string;
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  focusPoints: string[];
  processEyebrow: string;
  processDescription: string;
  imageUrl: string;
  imageAlt: string;
};

export const defaultAboutContent: AboutContent = {
  eyebrow: 'ABOUT US',
  heading: 'Craftsmanship Rooted in Authenticity',
  paragraph1:
    'Art of Nature is a custom craftsmanship studio dedicated to creating bespoke pieces that honor natural materials and traditional techniques.',
  paragraph2:
    'Each project begins with understanding your vision, your space, and the story you want to tell. We work closely with clients to design and build furniture, installations, and architectural elements that are as unique as the spaces they inhabit.',
  paragraph3: "Our work is not mass-produced. It's made to order, made by hand, and made to last.",
  focusPoints: [
    'Material-led design decisions',
    'Collaborative sketches and revisions',
    'Built for daily use and longevity',
  ],
  processEyebrow: 'Process',
  processDescription: 'Every project is shaped around proportion, material, and the atmosphere you want a room to hold.',
  imageUrl:
    'https://images.unsplash.com/photo-1722411927625-0e478acf502b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  imageAlt: 'Artisan working on wood piece',
};
