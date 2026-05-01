import type { ContactLink } from './contactContent';

const DEFAULT_EMAIL = 'mailto:info@artofnatureeg.com';
const DEFAULT_PHONE = 'tel:+201030422422';
const DEFAULT_INSTAGRAM = 'https://www.instagram.com/artofnatureeg';
const DEFAULT_FACEBOOK = 'https://www.facebook.com/artofnatureeg';

export type ContactLinkKind = 'email' | 'phone' | 'whatsapp' | 'instagram' | 'facebook' | 'link';

export type ResolvedContactLink = ContactLink & {
  kind: ContactLinkKind;
};

function normalizeHref(href: string) {
  return href.trim();
}

function normalizeLabel(label: string) {
  return label.trim();
}

function extractDigits(value: string) {
  return value.replace(/\D+/g, '');
}

export function getWhatsAppHrefFromPhone(phoneHref: string) {
  const phoneNumber = extractDigits(phoneHref);
  return phoneNumber ? `https://wa.me/${phoneNumber}` : '';
}

export function getContactLinkKind(href: string): ContactLinkKind {
  const normalizedHref = href.trim().toLowerCase();

  if (normalizedHref.startsWith('mailto:')) {
    return 'email';
  }

  if (normalizedHref.startsWith('tel:')) {
    return 'phone';
  }

  if (normalizedHref.includes('wa.me/') || normalizedHref.includes('whatsapp.com/')) {
    return 'whatsapp';
  }

  if (normalizedHref.includes('instagram.com/')) {
    return 'instagram';
  }

  if (normalizedHref.includes('facebook.com/') || normalizedHref.includes('fb.com/')) {
    return 'facebook';
  }

  return 'link';
}

function dedupeResolvedLinks(links: ResolvedContactLink[]) {
  const seenKinds = new Set<ContactLinkKind>();
  const seenHrefs = new Set<string>();

  return links.filter((link) => {
    const hrefKey = link.href.toLowerCase();

    if (seenHrefs.has(hrefKey)) {
      return false;
    }

    if (
      (link.kind === 'email' || link.kind === 'phone' || link.kind === 'whatsapp' || link.kind === 'instagram' || link.kind === 'facebook') &&
      seenKinds.has(link.kind)
    ) {
      return false;
    }

    seenHrefs.add(hrefKey);
    seenKinds.add(link.kind);
    return true;
  });
}

export function resolveContactLinks(directContacts: ContactLink[]) {
  const trimmedLinks = directContacts
    .map((contact) => ({
      href: normalizeHref(contact.href),
      label: normalizeLabel(contact.label),
    }))
    .filter((contact) => Boolean(contact.href && contact.label));

  const phoneLink = trimmedLinks.find((contact) => getContactLinkKind(contact.href) === 'phone');
  const hasInstagram = trimmedLinks.some((contact) => getContactLinkKind(contact.href) === 'instagram');
  const hasFacebook = trimmedLinks.some((contact) => getContactLinkKind(contact.href) === 'facebook');
  const hasWhatsApp = trimmedLinks.some((contact) => getContactLinkKind(contact.href) === 'whatsapp');

  const enhancedLinks = [...trimmedLinks];

  if (!trimmedLinks.some((contact) => getContactLinkKind(contact.href) === 'email')) {
    enhancedLinks.unshift({ href: DEFAULT_EMAIL, label: 'info@artofnatureeg.com' });
  }

  if (!phoneLink) {
    enhancedLinks.push({ href: DEFAULT_PHONE, label: '+201030422422' });
  }

  const effectivePhoneLink = phoneLink ?? enhancedLinks.find((contact) => getContactLinkKind(contact.href) === 'phone');
  const whatsappHref = effectivePhoneLink ? getWhatsAppHrefFromPhone(effectivePhoneLink.href) : '';

  if (!hasWhatsApp && whatsappHref) {
    enhancedLinks.push({
      href: whatsappHref,
      label: effectivePhoneLink?.label || '+201030422422',
    });
  }

  if (!hasInstagram) {
    enhancedLinks.push({ href: DEFAULT_INSTAGRAM, label: 'Instagram' });
  }

  if (!hasFacebook) {
    enhancedLinks.push({ href: DEFAULT_FACEBOOK, label: 'Facebook' });
  }

  return dedupeResolvedLinks(
    enhancedLinks.map((contact) => ({
      ...contact,
      kind: getContactLinkKind(contact.href),
    }))
  );
}
