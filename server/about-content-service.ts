import { defaultAboutContent, type AboutContent } from '../src/app/lib/aboutContent';
import { AboutContentModel } from './models/AboutContent';

const ABOUT_KEY = 'primary-about';

type AboutContentDocument = AboutContent & {
  key: string;
};

export async function getAboutContent(): Promise<AboutContent> {
  const doc = await AboutContentModel.findOne<AboutContentDocument>({ key: ABOUT_KEY }).lean();

  if (!doc) {
    return defaultAboutContent;
  }

  return {
    eyebrow: doc.eyebrow ?? defaultAboutContent.eyebrow,
    heading: doc.heading ?? defaultAboutContent.heading,
    paragraph1: doc.paragraph1 ?? defaultAboutContent.paragraph1,
    paragraph2: doc.paragraph2 ?? defaultAboutContent.paragraph2,
    paragraph3: doc.paragraph3 ?? defaultAboutContent.paragraph3,
    focusPoints: Array.isArray(doc.focusPoints) ? doc.focusPoints : defaultAboutContent.focusPoints,
    processEyebrow: doc.processEyebrow ?? defaultAboutContent.processEyebrow,
    processDescription: doc.processDescription ?? defaultAboutContent.processDescription,
    imageUrl: doc.imageUrl ?? defaultAboutContent.imageUrl,
    imageAlt: doc.imageAlt ?? defaultAboutContent.imageAlt,
  };
}

export async function upsertAboutContent(content: AboutContent): Promise<AboutContent> {
  await AboutContentModel.findOneAndUpdate(
    { key: ABOUT_KEY },
    { ...content, key: ABOUT_KEY },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return content;
}
