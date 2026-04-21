import { defaultCraftsmanshipContent, type CraftsmanshipContent } from '../src/app/lib/craftsmanshipContent';
import { CraftsmanshipContentModel } from './models/CraftsmanshipContent';

const CRAFTSMANSHIP_KEY = 'primary-craftsmanship';

type CraftsmanshipContentDocument = CraftsmanshipContent & {
  key: string;
};

export async function getCraftsmanshipContent(): Promise<CraftsmanshipContent> {
  const doc = await CraftsmanshipContentModel.findOne<CraftsmanshipContentDocument>({ key: CRAFTSMANSHIP_KEY }).lean();

  if (!doc) {
    return defaultCraftsmanshipContent;
  }

  return {
    eyebrow: doc.eyebrow ?? defaultCraftsmanshipContent.eyebrow,
    heading: doc.heading ?? defaultCraftsmanshipContent.heading,
    description: doc.description ?? defaultCraftsmanshipContent.description,
    items: Array.isArray(doc.items) ? doc.items : defaultCraftsmanshipContent.items,
  };
}

export async function upsertCraftsmanshipContent(content: CraftsmanshipContent): Promise<CraftsmanshipContent> {
  await CraftsmanshipContentModel.findOneAndUpdate(
    { key: CRAFTSMANSHIP_KEY },
    { ...content, key: CRAFTSMANSHIP_KEY },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return content;
}
