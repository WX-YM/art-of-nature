import type { GalleryImageAsset } from './gallery';

export type GalleryShellContent = {
  previewEyebrow: string;
  previewHeading: string;
  previewDescription: string;
  pageEyebrow: string;
  pageHeading: string;
  pageDescription: string;
};

export type PublicGalleryPieceSummary = {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  material: string;
  note: string;
  archiveCount: number;
  featured?: boolean;
  rank?: number;
  image: GalleryImageAsset;
};

export type PublicGalleryPieceDetail = PublicGalleryPieceSummary & {
  images: GalleryImageAsset[];
};

export type PublicGallerySubcategory = {
  name: string;
  pieces: PublicGalleryPieceSummary[];
};

export type PublicGalleryCategory = {
  name: string;
  eyebrow: string;
  description: string;
  pieceCount: number;
  archiveImageCount: number;
  leadPiece: PublicGalleryPieceSummary | null;
  subcategories: PublicGallerySubcategory[];
};

export type PublicGallerySummary = GalleryShellContent & {
  categories: PublicGalleryCategory[];
};

export type GalleryPreviewContent = Pick<
  GalleryShellContent,
  'previewEyebrow' | 'previewHeading' | 'previewDescription'
> & {
  pieces: PublicGalleryPieceSummary[];
};

export type GalleryImageVariantFormat = 'webp' | 'avif' | 'jpeg' | 'png';

export type GalleryImageVariantOptions = {
  width: number;
  quality?: number;
  format?: GalleryImageVariantFormat;
};

export function getGalleryCategoryId(categoryName: string) {
  return categoryName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getGalleryCategoryHref(categoryName: string) {
  return `/gallery#${getGalleryCategoryId(categoryName)}`;
}

function isOptimizableUploadSource(src: string) {
  return src.startsWith('/uploads/');
}

function normalizeUploadVariantPath(src: string) {
  return src.startsWith('/uploads/') ? src : `/${src.replace(/^\/+/, '')}`;
}

export function buildGalleryImageVariantUrl(src: string, options?: GalleryImageVariantOptions) {
  if (!options || !isOptimizableUploadSource(src)) {
    return src;
  }

  const params = new URLSearchParams({
    path: normalizeUploadVariantPath(src),
    w: String(Math.max(64, Math.trunc(options.width))),
  });

  if (options.quality) {
    params.set('q', String(Math.max(20, Math.min(90, Math.trunc(options.quality)))));
  }

  if (options.format) {
    params.set('format', options.format);
  }

  return `/media/uploads?${params.toString()}`;
}
