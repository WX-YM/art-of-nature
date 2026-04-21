export type CraftsmanshipItem = {
  title: string;
  description: string;
};

export type CraftsmanshipContent = {
  eyebrow: string;
  heading: string;
  description: string;
  items: CraftsmanshipItem[];
};

export const defaultCraftsmanshipContent: CraftsmanshipContent = {
  eyebrow: 'OUR APPROACH',
  heading: 'Why Custom-Made Matters',
  description:
    'In a world of mass production, we believe in the value of pieces created with intention, skill, and respect for both material and maker.',
  items: [
    {
      title: 'Made to Order',
      description:
        'Every piece begins with a conversation. We design specifically for your space, your needs, and your vision.',
    },
    {
      title: 'Natural Materials',
      description:
        'We work primarily with sustainably sourced hardwoods, celebrating the inherent beauty and character of each piece of timber.',
    },
    {
      title: 'Traditional Techniques',
      description:
        'Time-honored joinery methods combined with contemporary design sensibilities create pieces that endure.',
    },
    {
      title: 'Built to Last',
      description:
        'Our commitment to quality means furniture that becomes part of your life for generations, not seasons.',
    },
  ],
};
