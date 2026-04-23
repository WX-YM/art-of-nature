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
    ...(widthValue !== undefined ? { width: widthValue } : {}),
    ...(heightValue !== undefined ? { height: heightValue } : {}),
  };
}

const legacyPlacementOverrides = new Map<
  string,
  { category: GalleryCategoryName; subcategory: GallerySubcategoryName }
>([
  ['lighting-chandlier-from-tree-rings-with-live-edges', { category: 'Dining Room', subcategory: 'Lights' }],
  ['home-accessories-side-lamp-from-live-tree-trunk', { category: 'Bedroom', subcategory: 'Lights' }],
  ['chairs-diablo-side-chair-from-tree-stump-made-from-sisso-wood-whole-tree', { category: 'Dining Room', subcategory: 'Chairs' }],
  ['chairs-massive-beech-wood-chair', { category: 'Dining Room', subcategory: 'Chairs' }],
  ['chairs-massive-berry-wood-tree-side-chair', { category: 'Dining Room', subcategory: 'Chairs' }],
  ['chairs-olive-wood-side-chair', { category: 'Dining Room', subcategory: 'Chairs' }],
  ['chairs-rocking-chair-from-beech-wood', { category: 'Bedroom', subcategory: 'Chairs' }],
  ['chairs-corner-chair-shoe-rack-with-shelves', { category: 'Bedroom', subcategory: 'Chairs' }],
  ['chairs-mini-sofa-with-old-flank-wood', { category: 'Outdoor Seating', subcategory: 'Sofa' }],
  ['chairs-sofa-from-old-flank-wood', { category: 'Outdoor Seating', subcategory: 'Sofa' }],
  ['mirrors-oak-tree-wood-mirror-2-meter', { category: 'Dining Room', subcategory: 'Mirrors' }],
  ['mirrors-round-mirror-from-tree-trunks', { category: 'Dining Room', subcategory: 'Mirrors' }],
  ['mirrors-rectangelar-shape-mirror', { category: 'Bedroom', subcategory: 'Mirrors' }],
]);

function applyLegacyPlacementOverride(piece: GalleryPiece): GalleryPiece {
  const override = legacyPlacementOverrides.get(piece.id);

  if (!override) {
    return piece;
  }

  return {
    ...piece,
    category: override.category,
    subcategory: override.subcategory,
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

  const normalizedPiece: GalleryPiece = {
    id,
    title,
    category,
    subcategory,
    material,
    note,
    archiveCount: images.length,
    featured: raw.featured === true,
    image: preferredCoverImage,
    images,
  };

  return applyLegacyPlacementOverride(normalizedPiece);
}

function normalizeCategories(categories: unknown): GalleryCategoryDefinition[] {
  const inputCategories = Array.isArray(categories) ? categories : [];

  return inputCategories
    .map((category) => {
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
      };
    })
    .filter((category): category is GalleryCategoryDefinition => category !== null);
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
    return normalizeGalleryContent(defaultGalleryContent);
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
