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
    eyebrow: doc.eyebrow,
    heading: doc.heading,
    paragraph1: doc.paragraph1,
    paragraph2: doc.paragraph2,
    paragraph3: doc.paragraph3,
    imageUrl: doc.imageUrl,
    imageAlt: doc.imageAlt,
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
