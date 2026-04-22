import {
  defaultGalleryContent,
  type GalleryCategoryDefinition,
  type GalleryContent,
  type GalleryImageAsset,
  type GalleryPiece,
  type GalleryCategoryName,
  type GallerySubcategoryName,
} from '../src/app/lib/gallery';
import { GalleryContentModel } from './models/GalleryContent';

const GALLERY_KEY = 'primary-gallery';

type GalleryContentDocument = GalleryContent & {
  key: string;
};

const allowedCategoryNames = new Set<GalleryCategoryName>(
  defaultGalleryContent.categories.map((category) => category.name)
);

const allowedSubcategoryNames = new Set<GallerySubcategoryName>(
  defaultGalleryContent.categories.flatMap((category) => category.subcategories)
);

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
  const widthValue = typeof (value as { width?: unknown }).width === 'number'
    ? (value as { width: number }).width
    : undefined;
  const heightValue = typeof (value as { height?: unknown }).height === 'number'
    ? (value as { height: number }).height
    : undefined;

  return {
    src,
    alt: alt.slice(0, 300),
    width: widthValue,
    height: heightValue,
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

  const category = allowedCategoryNames.has(raw.category as GalleryCategoryName)
    ? (raw.category as GalleryCategoryName)
    : null;
  const subcategory = allowedSubcategoryNames.has(raw.subcategory as GallerySubcategoryName)
    ? (raw.subcategory as GallerySubcategoryName)
    : null;

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

  return {
    id,
    title,
    category,
    subcategory,
    material,
    note,
    archiveCount: images.length,
    featured: raw.featured === true,
    image: images[0],
    images,
  };
}

function normalizeCategories(categories: unknown): GalleryCategoryDefinition[] {
  const inputCategories = Array.isArray(categories) ? categories : [];

  return defaultGalleryContent.categories.map((defaultCategory) => {
    const match = inputCategories.find(
      (category) =>
        category &&
        typeof category === 'object' &&
        (category as { name?: unknown }).name === defaultCategory.name
    ) as Partial<GalleryCategoryDefinition> | undefined;

    return {
      name: defaultCategory.name,
      eyebrow: normalizeText(match?.eyebrow, defaultCategory.eyebrow, 120),
      description: normalizeText(match?.description, defaultCategory.description, 3000),
      subcategories: defaultCategory.subcategories,
    };
  });
}

export function normalizeGalleryContent(content: unknown): GalleryContent {
  const raw = content && typeof content === 'object' ? (content as Partial<GalleryContent>) : {};
  const normalizedPieces = Array.isArray(raw.pieces)
    ? raw.pieces
        .map((piece) => normalizePiece(piece))
        .filter((piece): piece is GalleryPiece => piece !== null)
    : [];

  return {
    previewEyebrow: normalizeText(raw.previewEyebrow, defaultGalleryContent.previewEyebrow, 120),
    previewHeading: normalizeText(raw.previewHeading, defaultGalleryContent.previewHeading, 200),
    previewDescription: normalizeText(raw.previewDescription, defaultGalleryContent.previewDescription, 2000),
    pageEyebrow: normalizeText(raw.pageEyebrow, defaultGalleryContent.pageEyebrow, 120),
    pageHeading: normalizeText(raw.pageHeading, defaultGalleryContent.pageHeading, 220),
    pageDescription: normalizeText(raw.pageDescription, defaultGalleryContent.pageDescription, 3000),
    categories: normalizeCategories(raw.categories),
    pieces: normalizedPieces.length > 0 ? normalizedPieces : defaultGalleryContent.pieces,
  };
}

export async function getGalleryContent(): Promise<GalleryContent> {
  const doc = await GalleryContentModel.findOne<GalleryContentDocument>({ key: GALLERY_KEY }).lean();

  if (!doc) {
    return defaultGalleryContent;
  }

  return normalizeGalleryContent(doc);
}

export async function upsertGalleryContent(content: unknown): Promise<GalleryContent> {
  const normalized = normalizeGalleryContent(content);

  await GalleryContentModel.findOneAndUpdate(
    { key: GALLERY_KEY },
    { ...normalized, key: GALLERY_KEY },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return normalized;
}
