import type {
  GalleryCategoryDefinition,
  GalleryContent,
  GalleryImageAsset,
  GalleryPiece,
} from '../src/app/lib/gallery';
import { GalleryContentModel } from './models/GalleryContent';
import { GalleryCategoryRecordModel } from './models/GalleryCategoryRecord';
import { GallerySubcategoryRecordModel } from './models/GallerySubcategoryRecord';
import { GalleryItemRecordModel } from './models/GalleryItemRecord';

const GALLERY_KEY = 'primary-gallery';

const gallerySettingsFallback = {
  previewEyebrow: 'Gallery',
  previewHeading: 'Previous Work',
  previewDescription: 'A curated archive of bespoke pieces, arranged by room and atmosphere.',
  pageEyebrow: 'Gallery',
  pageHeading: 'Studio Gallery',
  pageDescription: 'A bespoke archive of furniture, lighting, and room-led craftsmanship.',
};

type GalleryContentDocument = {
  key: string;
  previewEyebrow?: string;
  previewHeading?: string;
  previewDescription?: string;
  pageEyebrow?: string;
  pageHeading?: string;
  pageDescription?: string;
};

function normalizeText(value: unknown, fallback: string, maxLength: number) {
  const parsed = typeof value === 'string' ? value.trim() : '';
  if (!parsed || parsed.length > maxLength) {
    return fallback;
  }

  return parsed;
}

function normalizeImageAsset(value: unknown, fallbackTitle: string, index: number): GalleryImageAsset | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const src = typeof (value as { src?: unknown }).src === 'string' ? (value as { src: string }).src.trim() : '';
  if (!src || src.length > 4000) {
    return null;
  }

  const altCandidate =
    typeof (value as { alt?: unknown }).alt === 'string' ? (value as { alt: string }).alt.trim() : '';
  const alt = altCandidate || `${fallbackTitle} image ${index + 1}`;
  const widthValue =
    typeof (value as { width?: unknown }).width === 'number' ? (value as { width: number }).width : undefined;
  const heightValue =
    typeof (value as { height?: unknown }).height === 'number' ? (value as { height: number }).height : undefined;

  return {
    src,
    alt: alt.slice(0, 300),
    ...(widthValue !== undefined ? { width: widthValue } : {}),
    ...(heightValue !== undefined ? { height: heightValue } : {}),
  };
}

function normalizePiece(value: unknown): GalleryPiece | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const raw = value as Partial<GalleryPiece>;
  const title = normalizeText(raw.title, '', 220);
  const material = normalizeText(raw.material, '', 220);
  const note = normalizeText(raw.note, '', 2000);
  const id = normalizeText(raw.id, '', 220).toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');

  if (!title || !material || !note || !id) {
    return null;
  }

  const category = typeof raw.category === 'string' ? normalizeText(raw.category, '', 120) : '';
  const subcategory = typeof raw.subcategory === 'string' ? normalizeText(raw.subcategory, '', 120) : '';

  if (!category || !subcategory) {
    return null;
  }

  const imageAssets = Array.isArray(raw.images)
    ? raw.images
        .map((asset, index) => normalizeImageAsset(asset, title, index))
        .filter((asset): asset is GalleryImageAsset => asset !== null)
    : [];

  const coverImage = normalizeImageAsset(raw.image, title, 0);
  const images = imageAssets.length > 0 ? imageAssets : coverImage ? [coverImage] : [];

  if (images.length === 0) {
    return null;
  }

  const preferredCoverImage =
    coverImage && images.some((asset) => asset.src === coverImage.src)
      ? images.find((asset) => asset.src === coverImage.src) ?? images[0]
      : coverImage ?? images[0];

  return {
    id,
    title,
    category,
    subcategory,
    material,
    note,
    archiveCount: images.length,
    featured: raw.featured === true,
    rank: typeof raw.rank === 'number' && Number.isFinite(raw.rank) ? raw.rank : 0,
    image: preferredCoverImage,
    images,
  };
}

function normalizeCategories(categories: unknown): GalleryCategoryDefinition[] {
  const inputCategories = Array.isArray(categories) ? categories : [];

  return inputCategories
    .map((category, rank) => {
      if (!category || typeof category !== 'object') {
        return null;
      }

      const rawCategory = category as Partial<GalleryCategoryDefinition>;
      const name = normalizeText(rawCategory.name, '', 120);
      if (!name) {
        return null;
      }

      const subcategories = Array.isArray(rawCategory.subcategories)
        ? rawCategory.subcategories
            .filter((subcategory): subcategory is string => typeof subcategory === 'string' && subcategory.trim().length > 0)
            .map((subcategory) => normalizeText(subcategory, '', 120))
            .filter(Boolean)
        : [];

      return {
        name,
        eyebrow: normalizeText(rawCategory.eyebrow, '', 120),
        description: normalizeText(rawCategory.description, '', 3000),
        subcategories,
        rank: typeof rawCategory.rank === 'number' && Number.isFinite(rawCategory.rank) ? rawCategory.rank : rank,
      };
    })
    .filter((category): category is GalleryCategoryDefinition => category !== null);
}

async function getGallerySettings() {
  const doc = await GalleryContentModel.findOne<GalleryContentDocument>({ key: GALLERY_KEY }).lean();

  return {
    previewEyebrow: normalizeText(doc?.previewEyebrow, gallerySettingsFallback.previewEyebrow, 120),
    previewHeading: normalizeText(doc?.previewHeading, gallerySettingsFallback.previewHeading, 200),
    previewDescription: normalizeText(doc?.previewDescription, gallerySettingsFallback.previewDescription, 2000),
    pageEyebrow: normalizeText(doc?.pageEyebrow, gallerySettingsFallback.pageEyebrow, 120),
    pageHeading: normalizeText(doc?.pageHeading, gallerySettingsFallback.pageHeading, 220),
    pageDescription: normalizeText(doc?.pageDescription, gallerySettingsFallback.pageDescription, 3000),
  };
}

async function getRankedGalleryCategoriesAndPieces() {
  const [categoryDocs, subcategoryDocs, itemDocs] = await Promise.all([
    GalleryCategoryRecordModel.find({}).sort({ rank: 1, name: 1 }).lean(),
    GallerySubcategoryRecordModel.find({}).sort({ categoryKey: 1, rank: 1, name: 1 }).lean(),
    GalleryItemRecordModel.find({}).sort({ categoryKey: 1, subcategoryKey: 1, rank: 1, title: 1 }).lean(),
  ]);

  const subcategoriesByCategoryKey = new Map<string, string[]>();
  subcategoryDocs.forEach((subcategoryDoc) => {
    const existing = subcategoriesByCategoryKey.get(subcategoryDoc.categoryKey) ?? [];
    existing.push(subcategoryDoc.name);
    subcategoriesByCategoryKey.set(subcategoryDoc.categoryKey, existing);
  });

  const categories: GalleryCategoryDefinition[] = categoryDocs.map((categoryDoc) => ({
    name: categoryDoc.name,
    eyebrow: categoryDoc.eyebrow,
    description: categoryDoc.description,
    subcategories: subcategoriesByCategoryKey.get(categoryDoc.key) ?? [],
    rank: categoryDoc.rank,
  }));

  const pieces = itemDocs
    .map((itemDoc) =>
      normalizePiece({
        id: itemDoc.key,
        title: itemDoc.title,
        category: itemDoc.categoryName,
        subcategory: itemDoc.subcategoryName,
        material: itemDoc.material,
        note: itemDoc.note,
        archiveCount: itemDoc.archiveCount,
        featured: itemDoc.featured,
        rank: itemDoc.rank,
        image: itemDoc.image,
        images: itemDoc.images,
      })
    )
    .filter((piece): piece is GalleryPiece => piece !== null);

  return { categories, pieces };
}

async function syncGalleryCollections(content: GalleryContent) {
  const categories = content.categories.map((category, categoryRank) => ({
    key: category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name: category.name,
    eyebrow: category.eyebrow,
    description: category.description,
    rank: category.rank ?? categoryRank,
  }));

  const subcategories = content.categories.flatMap((category, categoryRank) => {
    const categoryKey = categories[categoryRank]?.key;
    const categorySlug = categories[categoryRank]?.slug;

    return category.subcategories.map((subcategory, subcategoryRank) => {
      const subcategorySlug = subcategory.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return {
        key: `${categoryKey}:${subcategorySlug}`,
        slug: subcategorySlug,
        name: subcategory,
        categoryKey,
        categorySlug,
        categoryName: category.name,
        rank: subcategoryRank,
      };
    });
  });

  const categoryKeySet = new Set(categories.map((category) => category.key));
  const subcategoryKeySet = new Set(subcategories.map((subcategory) => subcategory.key));

  const pieces = content.pieces
    .map((piece, pieceRank) => {
      const categoryKey = piece.category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const subcategorySlug = piece.subcategory.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const subcategoryKey = `${categoryKey}:${subcategorySlug}`;
      if (!categoryKeySet.has(categoryKey) || !subcategoryKeySet.has(subcategoryKey)) {
        return null;
      }

      return {
        key: piece.id,
        slug: piece.id,
        title: piece.title,
        categoryKey,
        categorySlug: categoryKey,
        categoryName: piece.category,
        subcategoryKey,
        subcategorySlug,
        subcategoryName: piece.subcategory,
        material: piece.material,
        note: piece.note,
        archiveCount: piece.images.length,
        featured: piece.featured === true,
        rank: piece.rank ?? pieceRank,
        image: piece.image,
        images: piece.images,
      };
    })
    .filter(Boolean);

  const pieceKeySet = new Set(pieces.map((piece) => piece!.key));

  await Promise.all(
    categories.map((category) =>
      GalleryCategoryRecordModel.findOneAndUpdate({ key: category.key }, category, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      })
    )
  );

  await GalleryCategoryRecordModel.deleteMany({ key: { $nin: Array.from(categoryKeySet) } });

  await Promise.all(
    subcategories.map((subcategory) =>
      GallerySubcategoryRecordModel.findOneAndUpdate({ key: subcategory.key }, subcategory, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      })
    )
  );

  await GallerySubcategoryRecordModel.deleteMany({ key: { $nin: Array.from(subcategoryKeySet) } });

  await Promise.all(
    pieces.map((piece) =>
      GalleryItemRecordModel.findOneAndUpdate({ key: piece!.key }, piece, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      })
    )
  );

  await GalleryItemRecordModel.deleteMany({ key: { $nin: Array.from(pieceKeySet) } });
}

export function normalizeGalleryContent(content: unknown): GalleryContent {
  const raw = content && typeof content === 'object' ? (content as Partial<GalleryContent>) : {};
  const normalizedPieces = Array.isArray(raw.pieces)
    ? raw.pieces
        .map((piece) => normalizePiece(piece))
        .filter((piece): piece is GalleryPiece => piece !== null)
    : [];

  return {
    previewEyebrow: normalizeText(raw.previewEyebrow, gallerySettingsFallback.previewEyebrow, 120),
    previewHeading: normalizeText(raw.previewHeading, gallerySettingsFallback.previewHeading, 200),
    previewDescription: normalizeText(raw.previewDescription, gallerySettingsFallback.previewDescription, 2000),
    pageEyebrow: normalizeText(raw.pageEyebrow, gallerySettingsFallback.pageEyebrow, 120),
    pageHeading: normalizeText(raw.pageHeading, gallerySettingsFallback.pageHeading, 220),
    pageDescription: normalizeText(raw.pageDescription, gallerySettingsFallback.pageDescription, 3000),
    categories: normalizeCategories(raw.categories),
    pieces: normalizedPieces,
  };
}

export async function getGalleryContent(): Promise<GalleryContent> {
  const [settings, collectionContent] = await Promise.all([
    getGallerySettings(),
    getRankedGalleryCategoriesAndPieces(),
  ]);

  return {
    ...settings,
    categories: collectionContent.categories,
    pieces: collectionContent.pieces,
  };
}

export async function upsertGalleryContent(content: unknown): Promise<GalleryContent> {
  const normalized = normalizeGalleryContent(content);

  await GalleryContentModel.findOneAndUpdate(
    { key: GALLERY_KEY },
    {
      key: GALLERY_KEY,
      previewEyebrow: normalized.previewEyebrow,
      previewHeading: normalized.previewHeading,
      previewDescription: normalized.previewDescription,
      pageEyebrow: normalized.pageEyebrow,
      pageHeading: normalized.pageHeading,
      pageDescription: normalized.pageDescription,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await syncGalleryCollections(normalized);

  return getGalleryContent();
}
