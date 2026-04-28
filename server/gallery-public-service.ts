import type {
  GalleryPreviewContent,
  GalleryShellContent,
  PublicGalleryCategory,
  PublicGalleryPieceDetail,
  PublicGalleryPieceSummary,
  PublicGallerySummary,
} from '../src/app/lib/gallery-public';
import {
  buildGalleryCategories,
  getHomepageGalleryPieces,
  type GalleryContent,
  type GalleryPiece,
} from '../src/app/lib/gallery';

function toPieceSummary(piece: GalleryPiece): PublicGalleryPieceSummary {
  return {
    id: piece.id,
    title: piece.title,
    category: piece.category,
    subcategory: piece.subcategory,
    material: piece.material,
    note: piece.note,
    archiveCount: piece.archiveCount,
    featured: piece.featured,
    rank: piece.rank,
    image: piece.image,
  };
}

export function buildGalleryShellContent(content: GalleryContent): GalleryShellContent {
  return {
    previewEyebrow: content.previewEyebrow,
    previewHeading: content.previewHeading,
    previewDescription: content.previewDescription,
    pageEyebrow: content.pageEyebrow,
    pageHeading: content.pageHeading,
    pageDescription: content.pageDescription,
  };
}

export function buildGalleryPreviewContent(content: GalleryContent, count: number = 6): GalleryPreviewContent {
  return {
    previewEyebrow: content.previewEyebrow,
    previewHeading: content.previewHeading,
    previewDescription: content.previewDescription,
    pieces: getHomepageGalleryPieces(content, count).map(toPieceSummary),
  };
}

export function buildPublicGallerySummary(content: GalleryContent): PublicGallerySummary {
  const categories: PublicGalleryCategory[] = buildGalleryCategories(content).map((category) => {
    const flatPieces = category.subcategories.flatMap((subcategory) => subcategory.pieces);
    const leadPiece = flatPieces.find((piece) => piece.featured) ?? flatPieces[0] ?? null;
    const archiveImageCount = flatPieces.reduce((total, piece) => total + piece.archiveCount, 0);

    return {
      name: category.name,
      eyebrow: category.eyebrow,
      description: category.description,
      pieceCount: flatPieces.length,
      archiveImageCount,
      leadPiece: leadPiece ? toPieceSummary(leadPiece) : null,
      subcategories: category.subcategories.map((subcategory) => ({
        name: subcategory.name,
        pieces: subcategory.pieces.map(toPieceSummary),
      })),
    };
  });

  return {
    ...buildGalleryShellContent(content),
    categories,
  };
}

export function buildPublicGalleryPieceDetail(
  content: GalleryContent,
  pieceId: string
): PublicGalleryPieceDetail | null {
  const piece = content.pieces.find((entry) => entry.id === pieceId);

  if (!piece) {
    return null;
  }

  return {
    ...toPieceSummary(piece),
    images: piece.images,
  };
}
