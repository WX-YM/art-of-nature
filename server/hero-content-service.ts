import { defaultHeroContent, type HeroContent } from '../src/app/lib/heroContent';
import { HeroContentModel } from './models/HeroContent';

const HERO_KEY = 'primary-hero';

type HeroContentDocument = HeroContent & {
  key: string;
};

export async function getHeroContent(): Promise<HeroContent> {
  const doc = await HeroContentModel.findOne<HeroContentDocument>({ key: HERO_KEY }).lean();

  if (!doc) {
    return defaultHeroContent;
  }

  return {
    eyebrow: doc.eyebrow,
    headingLine1: doc.headingLine1,
    headingLine2: doc.headingLine2,
    description: doc.description,
    ctaText: doc.ctaText,
    ctaHref: doc.ctaHref,
    backgroundImageUrl: doc.backgroundImageUrl,
    backgroundImageAlt: doc.backgroundImageAlt,
  };
}

export async function upsertHeroContent(content: HeroContent): Promise<HeroContent> {
  await HeroContentModel.findOneAndUpdate(
    { key: HERO_KEY },
    { ...content, key: HERO_KEY },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return content;
}
