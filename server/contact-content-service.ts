import { defaultContactContent, type ContactContent } from '../src/app/lib/contactContent';
import { resolveContactLinks } from '../src/app/lib/contactLinks';
import { ContactContentModel } from './models/ContactContent';

const CONTACT_KEY = 'primary-contact';

type ContactContentDocument = ContactContent & {
  key: string;
};

export async function getContactContent(): Promise<ContactContent> {
  const doc = await ContactContentModel.findOne<ContactContentDocument>({ key: CONTACT_KEY }).lean();

  if (!doc) {
    return defaultContactContent;
  }

  return {
    eyebrow: doc.eyebrow ?? defaultContactContent.eyebrow,
    heading: doc.heading ?? defaultContactContent.heading,
    description: doc.description ?? defaultContactContent.description,
    nameLabel: doc.nameLabel ?? defaultContactContent.nameLabel,
    namePlaceholder: doc.namePlaceholder ?? defaultContactContent.namePlaceholder,
    emailLabel: doc.emailLabel ?? defaultContactContent.emailLabel,
    emailPlaceholder: doc.emailPlaceholder ?? defaultContactContent.emailPlaceholder,
    projectTypeLabel: doc.projectTypeLabel ?? defaultContactContent.projectTypeLabel,
    projectDefaultOption: doc.projectDefaultOption ?? defaultContactContent.projectDefaultOption,
    projectOptions: Array.isArray(doc.projectOptions) ? doc.projectOptions : defaultContactContent.projectOptions,
    messageLabel: doc.messageLabel ?? defaultContactContent.messageLabel,
    messagePlaceholder: doc.messagePlaceholder ?? defaultContactContent.messagePlaceholder,
    submitText: doc.submitText ?? defaultContactContent.submitText,
    directContactLabel: doc.directContactLabel ?? defaultContactContent.directContactLabel,
    directContacts: resolveContactLinks(
      Array.isArray(doc.directContacts) ? doc.directContacts : defaultContactContent.directContacts
    ).map(({ href, label }) => ({ href, label })),
  };
}

export async function upsertContactContent(content: ContactContent): Promise<ContactContent> {
  await ContactContentModel.findOneAndUpdate(
    { key: CONTACT_KEY },
    { ...content, key: CONTACT_KEY },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return content;
}
