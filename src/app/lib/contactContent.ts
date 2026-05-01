export type ContactLink = {
  href: string;
  label: string;
};

export type ContactContent = {
  eyebrow: string;
  heading: string;
  description: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  projectTypeLabel: string;
  projectDefaultOption: string;
  projectOptions: string[];
  messageLabel: string;
  messagePlaceholder: string;
  submitText: string;
  directContactLabel: string;
  directContacts: ContactLink[];
};

export const defaultContactContent: ContactContent = {
  eyebrow: 'GET IN TOUCH',
  heading: "Let's Create Something Together",
  description:
    "Whether you have a specific project in mind or are exploring possibilities, we'd love to hear from you. Share your vision, and let's discuss how we can bring it to life.",
  nameLabel: 'Name',
  namePlaceholder: 'Your name',
  emailLabel: 'Email',
  emailPlaceholder: 'your@email.com',
  projectTypeLabel: 'Project Type',
  projectDefaultOption: 'Select a category',
  projectOptions: ['Custom Furniture', 'Architectural Elements', 'Interior Details', 'Other / Not Sure'],
  messageLabel: 'Tell us about your project',
  messagePlaceholder: 'Share your vision, space details, timeline, or any questions you have...',
  submitText: 'Send Inquiry',
  directContactLabel: 'Prefer to reach out directly?',
  directContacts: [
    { href: 'mailto:info@artofnatureeg.com', label: 'info@artofnatureeg.com' },
    { href: 'tel:+201030422422', label: '+201030422422' },
    { href: 'https://wa.me/201030422422', label: '+201030422422' },
    { href: 'https://www.instagram.com/artofnatureeg', label: 'Instagram' },
    { href: 'https://www.facebook.com/artofnatureeg', label: 'Facebook' },
  ],
};
