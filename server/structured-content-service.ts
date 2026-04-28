import { defaultHeroContent } from '../src/app/lib/heroContent';
import { defaultAboutContent } from '../src/app/lib/aboutContent';
import {
  defaultGalleryContent,
  type GalleryCategoryDefinition,
  type GalleryPiece,
} from '../src/app/lib/gallery';
import {
  defaultJournalContent,
  slugifyJournalValue,
  type JournalPost,
} from '../src/app/lib/journal';
import { defaultContactContent } from '../src/app/lib/contactContent';
import { defaultCraftsmanshipContent } from '../src/app/lib/craftsmanshipContent';
import { seedContentSnapshot } from './seed-content-snapshot';
import { upsertHeroContent } from './hero-content-service';
import { upsertAboutContent } from './about-content-service';
import { upsertGalleryContent } from './gallery-content-service';
import { upsertJournalContent } from './journal-content-service';
import { upsertContactContent } from './contact-content-service';
import { upsertCraftsmanshipContent } from './craftsmanship-content-service';
import { GalleryCategoryRecordModel } from './models/GalleryCategoryRecord';
import { GallerySubcategoryRecordModel } from './models/GallerySubcategoryRecord';
import { GalleryItemRecordModel } from './models/GalleryItemRecord';
import { JournalPostRecordModel } from './models/JournalPostRecord';

export type GalleryCategoryRecord = {
  key: string;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  rank: number;
};

export type GallerySubcategoryRecord = {
  key: string;
  slug: string;
  name: string;
  categoryKey: string;
  categorySlug: string;
  categoryName: string;
  rank: number;
};

export type GalleryItemRecord = {
  key: string;
  slug: string;
  title: string;
  categoryKey: string;
  categorySlug: string;
  categoryName: string;
  subcategoryKey: string;
  subcategorySlug: string;
  subcategoryName: string;
  material: string;
  note: string;
  archiveCount: number;
  featured: boolean;
  rank: number;
  image: GalleryPiece['image'];
  images: GalleryPiece['images'];
};

export type JournalPostRecord = JournalPost & {
  key: string;
  rank: number;
};

export type StructuredContentSeed = {
  categories: GalleryCategoryRecord[];
  subcategories: GallerySubcategoryRecord[];
  galleryItems: GalleryItemRecord[];
  journalPosts: JournalPostRecord[];
};

function toKey(value: string) {
  return slugifyJournalValue(value);
}

function compareRankedByName(
  left: { rank?: unknown; name?: unknown },
  right: { rank?: unknown; name?: unknown },
) {
  const leftRank = normalizeRank(left.rank, Number.MAX_SAFE_INTEGER);
  const rightRank = normalizeRank(right.rank, Number.MAX_SAFE_INTEGER);
  if (leftRank !== rightRank) {
    return leftRank - rightRank;
  }

  const leftName = typeof left.name === 'string' ? left.name : '';
  const rightName = typeof right.name === 'string' ? right.name : '';
  return leftName.localeCompare(rightName);
}

function deriveGalleryCategoryRecord(category: GalleryCategoryDefinition, rank: number): GalleryCategoryRecord {
  const slug = toKey(category.name);
  return {
    key: slug,
    slug,
    name: category.name,
    eyebrow: category.eyebrow,
    description: category.description,
    rank,
  };
}

function deriveGallerySubcategoryRecord(
  category: GalleryCategoryDefinition,
  categoryRecord: GalleryCategoryRecord,
  subcategoryName: string,
  rank: number,
): GallerySubcategoryRecord {
  const slug = toKey(subcategoryName);
  return {
    key: `${categoryRecord.key}:${slug}`,
    slug,
    name: subcategoryName,
    categoryKey: categoryRecord.key,
    categorySlug: categoryRecord.slug,
    categoryName: category.name,
    rank,
  };
}

function deriveGalleryItemRecord(
  piece: GalleryPiece,
  rank: number,
): GalleryItemRecord {
  const categoryKey = toKey(piece.category);
  const subcategorySlug = toKey(piece.subcategory);
  return {
    key: piece.id,
    slug: piece.id || toKey(piece.title),
    title: piece.title,
    categoryKey,
    categorySlug: categoryKey,
    categoryName: piece.category,
    subcategoryKey: `${categoryKey}:${subcategorySlug}`,
    subcategorySlug,
    subcategoryName: piece.subcategory,
    material: piece.material,
    note: piece.note,
    archiveCount: piece.archiveCount,
    featured: piece.featured === true,
    rank,
    image: piece.image,
    images: piece.images,
  };
}

function deriveJournalPostRecord(post: JournalPost, rank: number): JournalPostRecord {
  return {
    ...post,
    key: post.id || post.slug,
    rank,
  };
}

export function deriveStructuredContentSeedFromDefaults(): StructuredContentSeed {
  const categories = defaultGalleryContent.categories.map((category, rank) =>
    deriveGalleryCategoryRecord(category, rank)
  );

  const subcategories = defaultGalleryContent.categories.flatMap((category) => {
    const categoryRecord = deriveGalleryCategoryRecord(
      category,
      defaultGalleryContent.categories.findIndex((entry) => entry.name === category.name)
    );

    return category.subcategories.map((subcategory, rank) =>
      deriveGallerySubcategoryRecord(category, categoryRecord, subcategory, rank)
    );
  });

  const galleryItems = defaultGalleryContent.pieces.map((piece, rank) =>
    deriveGalleryItemRecord(piece, rank)
  );

  const journalPosts = defaultJournalContent.posts.map((post, rank) =>
    deriveJournalPostRecord(post, rank)
  );

  return {
    categories,
    subcategories,
    galleryItems,
    journalPosts,
  };
}

function getSeedSourceContent() {
  return {
    heroContent: seedContentSnapshot?.heroContent ?? defaultHeroContent,
    aboutContent: seedContentSnapshot?.aboutContent ?? defaultAboutContent,
    galleryContent: seedContentSnapshot?.galleryContent ?? defaultGalleryContent,
    journalContent: seedContentSnapshot?.journalContent ?? defaultJournalContent,
    contactContent: seedContentSnapshot?.contactContent ?? defaultContactContent,
    craftsmanshipContent: seedContentSnapshot?.craftsmanshipContent ?? defaultCraftsmanshipContent,
  };
}

export function deriveStructuredContentSeedFromConfiguredSource(): StructuredContentSeed {
  const source = getSeedSourceContent();
  const categories = source.galleryContent.categories.map((category, rank) =>
    deriveGalleryCategoryRecord(category, rank)
  );

  const subcategories = source.galleryContent.categories.flatMap((category) => {
    const categoryRecord = deriveGalleryCategoryRecord(
      category,
      source.galleryContent.categories.findIndex((entry) => entry.name === category.name)
    );

    return category.subcategories.map((subcategory, rank) =>
      deriveGallerySubcategoryRecord(category, categoryRecord, subcategory, rank)
    );
  });

  const galleryItems = source.galleryContent.pieces.map((piece, rank) =>
    deriveGalleryItemRecord(piece, rank)
  );

  const journalPosts = source.journalContent.posts.map((post, rank) =>
    deriveJournalPostRecord(post, rank)
  );

  return {
    categories,
    subcategories,
    galleryItems,
    journalPosts,
  };
}

export async function seedStructuredContent(options?: { reset?: boolean; syncLegacyContent?: boolean }) {
  const { reset = false, syncLegacyContent = true } = options ?? {};
  const seed = deriveStructuredContentSeedFromConfiguredSource();
  const source = getSeedSourceContent();

  if (reset) {
    await Promise.all([
      GalleryItemRecordModel.deleteMany({}),
      GallerySubcategoryRecordModel.deleteMany({}),
      GalleryCategoryRecordModel.deleteMany({}),
      JournalPostRecordModel.deleteMany({}),
    ]);
  }

  if (syncLegacyContent) {
    await Promise.all([
      upsertHeroContent(source.heroContent),
      upsertAboutContent(source.aboutContent),
      upsertGalleryContent(source.galleryContent),
      upsertJournalContent(source.journalContent),
      upsertContactContent(source.contactContent),
      upsertCraftsmanshipContent(source.craftsmanshipContent),
    ]);
  }

  await Promise.all(
    seed.categories.map((category) =>
      GalleryCategoryRecordModel.findOneAndUpdate(
        { key: category.key },
        category,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  await Promise.all(
    seed.subcategories.map((subcategory) =>
      GallerySubcategoryRecordModel.findOneAndUpdate(
        { key: subcategory.key },
        subcategory,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  await Promise.all(
    seed.galleryItems.map((item) =>
      GalleryItemRecordModel.findOneAndUpdate(
        { key: item.key },
        item,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  await Promise.all(
    seed.journalPosts.map((post) =>
      JournalPostRecordModel.findOneAndUpdate(
        { key: post.key },
        post,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  return seed;
}

export function normalizeRank(value: unknown, fallback: number = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) {
      const parsed = Number(trimmed);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
}

export function normalizeGalleryCategoryPayload(
  input: unknown,
  fallbackRank: number = 0,
): GalleryCategoryRecord | null {
  if (!input || typeof input !== 'object') {
    return null;
  }

  const raw = input as Partial<GalleryCategoryRecord>;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!name || name.length > 120) {
    return null;
  }

  const slugCandidate = typeof raw.slug === 'string' ? raw.slug.trim() : '';
  const slug = toKey(slugCandidate || name);
  if (!slug) {
    return null;
  }

  const eyebrow = typeof raw.eyebrow === 'string' ? raw.eyebrow.trim() : '';
  const description = typeof raw.description === 'string' ? raw.description.trim() : '';

  return {
    key: typeof raw.key === 'string' && raw.key.trim() ? toKey(raw.key) : slug,
    slug,
    name,
    eyebrow: eyebrow.slice(0, 120),
    description: description.slice(0, 3000),
    rank: normalizeRank(raw.rank, fallbackRank),
  };
}

export async function getRankedGalleryCategories() {
  const categories = await GalleryCategoryRecordModel.find({}).lean();

  return categories
    .map((category) => ({
      ...category,
      rank: normalizeRank(category.rank, Number.MAX_SAFE_INTEGER),
    }))
    .sort(compareRankedByName);
}

export async function upsertGalleryCategoryRecord(input: unknown) {
  const fallbackRank = await GalleryCategoryRecordModel.countDocuments({});
  const normalized = normalizeGalleryCategoryPayload(input, fallbackRank);

  if (!normalized) {
    throw new Error('Invalid category payload.');
  }

  const saved = await GalleryCategoryRecordModel.findOneAndUpdate(
    { key: normalized.key },
    normalized,
    { upsert: true, new: true, setDefaultsOnInsert: true, lean: true }
  );

  return saved ?? normalized;
}

function normalizeGallerySubcategoryNames(input: unknown) {
  if (!Array.isArray(input)) {
    return [];
  }

  return Array.from(
    new Set(
      input
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => value.slice(0, 120))
    )
  );
}

export async function upsertGalleryCategoryStructure(input: unknown) {
  const fallbackRank = await GalleryCategoryRecordModel.countDocuments({});
  const normalized = normalizeGalleryCategoryPayload(input, fallbackRank);

  if (!normalized) {
    throw new Error('Invalid category payload.');
  }

  const raw = input as { subcategories?: unknown };
  const subcategoryNames = normalizeGallerySubcategoryNames(raw?.subcategories);

  const savedCategory = await GalleryCategoryRecordModel.findOneAndUpdate(
    { key: normalized.key },
    normalized,
    { upsert: true, new: true, setDefaultsOnInsert: true, lean: true }
  );

  const existingSubcategories = await GallerySubcategoryRecordModel.find({ categoryKey: normalized.key }).lean();
  const existingBySlug = new Map(existingSubcategories.map((subcategory) => [subcategory.slug, subcategory]));

  const subcategoryRecords = subcategoryNames.map((name, rank) => {
    const slug = toKey(name);
    const existing = existingBySlug.get(slug);
    return {
      key: `${normalized.key}:${slug}`,
      slug,
      name,
      categoryKey: normalized.key,
      categorySlug: normalized.slug,
      categoryName: normalized.name,
      rank: normalizeRank(existing?.rank, rank),
    };
  });

  await Promise.all(
    subcategoryRecords.map((subcategory) =>
      GallerySubcategoryRecordModel.findOneAndUpdate(
        { key: subcategory.key },
        subcategory,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  await GallerySubcategoryRecordModel.deleteMany({
    categoryKey: normalized.key,
    key: { $nin: subcategoryRecords.map((subcategory) => subcategory.key) },
  });

  await GalleryItemRecordModel.updateMany(
    { categoryKey: normalized.key },
    {
      $set: {
        categoryName: normalized.name,
        categorySlug: normalized.slug,
      },
    }
  );

  return {
    category: savedCategory ?? normalized,
    subcategories: subcategoryRecords.sort(compareRankedByName),
  };
}

export async function deleteGalleryCategoryRecord(categoryIdentifier: string) {
  const normalizedIdentifier = toKey(categoryIdentifier);
  if (!normalizedIdentifier) {
    throw new Error('Invalid category identifier.');
  }

  const category = await GalleryCategoryRecordModel.findOneAndDelete({
    $or: [{ key: normalizedIdentifier }, { slug: normalizedIdentifier }],
  }).lean();

  if (!category) {
    throw new Error('Category not found.');
  }

  await Promise.all([
    GallerySubcategoryRecordModel.deleteMany({ categoryKey: category.key }),
    GalleryItemRecordModel.deleteMany({ categoryKey: category.key }),
  ]);

  return category;
}
