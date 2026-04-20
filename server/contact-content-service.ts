import { defaultContactContent, type ContactContent } from '../src/app/lib/contactContent';
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
    eyebrow: doc.eyebrow,
    heading: doc.heading,
    description: doc.description,
    nameLabel: doc.nameLabel,
    namePlaceholder: doc.namePlaceholder,
    emailLabel: doc.emailLabel,
    emailPlaceholder: doc.emailPlaceholder,
    projectTypeLabel: doc.projectTypeLabel,
    projectDefaultOption: doc.projectDefaultOption,
    projectOptions: doc.projectOptions,
    messageLabel: doc.messageLabel,
    messagePlaceholder: doc.messagePlaceholder,
    submitText: doc.submitText,
    directContactLabel: doc.directContactLabel,
    directContacts: doc.directContacts,
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
