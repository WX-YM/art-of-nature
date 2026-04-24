import { useState } from 'react';
import {
  buildGalleryCategories,
  getGalleryCategoryId,
  type GalleryContent,
  type GalleryPiece,
  type GallerySubcategory,
} from '../lib/gallery';
import { GalleryImage } from './GalleryImage';
import { GalleryPieceViewer } from './GalleryPieceViewer';

type GalleryPageProps = {
  content: GalleryContent;
};

function getPieceCount(category: {
  subcategories: Array<{ pieces: GalleryPiece[] }>;
}) {
  return category.subcategories.reduce((total, subcategory) => total + subcategory.pieces.length, 0);
}

function getImageCount(category: {
  subcategories: Array<{ pieces: GalleryPiece[] }>;
}) {
  return category.subcategories.reduce(
    (total, subcategory) =>
      total + subcategory.pieces.reduce((pieceTotal, piece) => pieceTotal + piece.images.length, 0),
    0
  );
}

function getLeadPiece(category: {
  subcategories: Array<{ pieces: GalleryPiece[] }>;
}) {
  const pieces = category.subcategories.flatMap((subcategory) => subcategory.pieces);
  return pieces.find((piece) => piece.featured) ?? pieces[0] ?? null;
}

function EmptyCollectionCard({
  categoryName,
  subcategory,
}: {
  categoryName: string;
  subcategory: GallerySubcategory;
}) {
  return (
    <div className="border border-dashed border-border/85 bg-[rgba(255,255,255,0.58)] px-6 py-7 sm:px-7">
      <div>
        <p className="text-[0.72rem] uppercase tracking-[0.28em] text-foreground/42">
          {categoryName} / {subcategory.name}
        </p>
        <h4 className="mt-3 text-[1.2rem] leading-tight text-foreground/78">Archive forthcoming</h4>
        <p className="mt-3 max-w-md text-sm leading-7 text-foreground/58 sm:text-[0.98rem]">
          The first documentation set for this section is still being curated and will join the archive once the
          final photography is assembled.
        </p>
      </div>
      <p className="mt-6 text-[0.68rem] uppercase tracking-[0.24em] text-foreground/34">Collection in progress</p>
    </div>
  );
}

function PieceCard({
  piece,
  index,
  onOpen,
}: {
  piece: GalleryPiece;
  index: number;
  onOpen: (piece: GalleryPiece, imageIndex?: number) => void;
}) {
  const imageCount = piece.images.length;
  const previewImages = imageCount === 1 ? piece.images : piece.images.slice(0, Math.min(imageCount, 3));
  const hiddenImageCount = Math.max(imageCount - previewImages.length, 0);

  return (
    <article
      className="gallery-masonry-item reveal-up group overflow-hidden border border-border bg-white shadow-[0_18px_48px_rgba(45,41,38,0.08)]"
      style={{ animationDelay: `${0.07 * (index + 1)}s` }}
    >
      <div className="space-y-3 border-b border-border/70 p-5 sm:p-6">
        <button
          type="button"
          onClick={() => onOpen(piece, 0)}
          className="text-left text-[1.45rem] leading-tight transition-colors hover:text-accent sm:text-[1.75rem]"
        >
          {piece.title}
        </button>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
        {previewImages.map((asset, assetIndex) => {
          const isLastVisibleImage = assetIndex === previewImages.length - 1;
          const showMoreOverlay = hiddenImageCount > 0 && isLastVisibleImage;

          return (
            <button
              type="button"
              key={asset.src}
              onClick={() => onOpen(piece, assetIndex)}
              className={
                imageCount === 1
                  ? 'h-[20rem] w-full overflow-hidden text-left sm:col-span-2 sm:h-[24rem]'
                  : assetIndex === 0
                    ? 'h-[20rem] w-full overflow-hidden text-left sm:col-span-2 sm:h-[28rem]'
                    : 'h-[13rem] w-full overflow-hidden text-left sm:h-[15rem]'
              }
            >
              <div className="relative h-full w-full">
                <GalleryImage
                  asset={asset}
                  className="h-full w-full transition-transform duration-700 group-hover:scale-[1.02]"
                  sizes={
                    imageCount === 1 || assetIndex === 0
                      ? '(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw'
                      : '(min-width: 1024px) 12rem, (min-width: 640px) 24rem, 50vw'
                  }
                />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/38 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
                {showMoreOverlay ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/26 text-center text-lg font-medium text-white backdrop-blur-[1px]">
                    +{hiddenImageCount} more
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </article>
  );
}

export function GalleryPage({ content }: GalleryPageProps) {
  const galleryCategories = buildGalleryCategories(content);
  const [viewerState, setViewerState] = useState<{ piece: GalleryPiece | null; imageIndex: number }>({
    piece: null,
    imageIndex: 0,
  });

  return (
    <main className="pb-20 pt-28 sm:pt-32 lg:pb-32">
      <section className="gallery-shell">
        <div className="reveal-up">
          <div>
            <p className="section-kicker">{content.pageEyebrow}</p>
            <h1 style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', lineHeight: '0.95' }}>
              {content.pageHeading}
            </h1>
          </div>
        </div>
      </section>

      <section className="gallery-shell mt-14 sm:mt-16">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {galleryCategories.map((category, index) => {
            const pieceCount = getPieceCount(category);
            return (
              <a
                key={category.name}
                href={`#${getGalleryCategoryId(category.name)}`}
                className="reveal-center panel-surface flex min-h-[9rem] items-center justify-center p-5 transition-transform duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${0.06 * (index + 1)}s` }}
              >
                <h2 className="w-full text-center flex items-center justify-center text-[1.55rem] leading-tight">
                  {category.name}
                </h2>
              </a>
            );
          })}
        </div>
      </section>

      <section className="gallery-shell mt-16 space-y-16 sm:space-y-20 lg:mt-20 lg:space-y-24">
        {galleryCategories.map((category, categoryIndex) => (
          <section key={category.name} id={getGalleryCategoryId(category.name)} className="scroll-mt-28">
            {(() => {
              const pieceCount = getPieceCount(category);
              const imageCount = getImageCount(category);
              const leadPiece = getLeadPiece(category);

              return (
                <>
                  <div className="mb-9 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(21rem,28rem)] xl:items-end 2xl:gap-10">
                    <div
                      className="reveal-up border-t border-border/80 pt-5"
                      style={{ animationDelay: `${0.05 * (categoryIndex + 1)}s` }}
                    >
                      <p className="section-kicker">{category.eyebrow}</p>
                      <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)', lineHeight: '1.02' }}>
                        {category.name}
                      </h2>
                      <p className="mt-4 max-w-4xl text-[1rem] leading-8 text-foreground/68 sm:text-[1.05rem]">
                        {category.description}
                      </p>
                      <div className="mt-6 flex flex-wrap gap-3 text-[0.72rem] uppercase tracking-[0.24em] text-foreground/42">
                        <span>{category.subcategories.length} sections</span>
                        <span>{pieceCount} pieces</span>
                        <span>{imageCount} archive images</span>
                      </div>
                    </div>

                    <div
                      className="reveal-up panel-surface overflow-hidden p-3 sm:p-4"
                      style={{ animationDelay: `${0.09 * (categoryIndex + 1)}s` }}
                    >
                      {leadPiece ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setViewerState({ piece: leadPiece, imageIndex: 0 })}
                            className="group block w-full text-left"
                          >
                            <div className="h-[14rem] overflow-hidden sm:h-[16rem]">
                              <GalleryImage
                                asset={leadPiece.image}
                                className="h-full w-full transition-transform duration-700 group-hover:scale-[1.02]"
                                sizes="(min-width: 1024px) 23rem, 100vw"
                              />
                            </div>
                          </button>
                          <div className="border-t border-border/70 px-1 pb-1 pt-4">
                            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-foreground/42">
                              Lead piece
                            </p>
                            <button
                              type="button"
                              onClick={() => setViewerState({ piece: leadPiece, imageIndex: 0 })}
                              className="mt-2 text-left text-[1.25rem] leading-tight transition-colors hover:text-accent"
                            >
                              {leadPiece.title}
                            </button>
                            <div className="mt-4 flex items-center justify-between gap-3 text-[0.72rem] uppercase tracking-[0.22em] text-foreground/40">
                              <span>{leadPiece.archiveCount} images</span>
                              <span>{leadPiece.subcategory}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex h-full min-h-[14rem] flex-col justify-between border border-dashed border-border/70 bg-white/55 p-5">
                          <div>
                            <p className="text-[0.72rem] uppercase tracking-[0.24em] text-foreground/40">Room note</p>
                            <p className="mt-3 text-[1.15rem] leading-tight text-foreground/76">
                              Documentation for this room is still being assembled.
                            </p>
                          </div>
                          <p className="text-[0.68rem] uppercase tracking-[0.22em] text-foreground/34">Archive forthcoming</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-8">
                    {category.subcategories.map((subcategory) => (
                      <section key={`${category.name}-${subcategory.name}`} className="space-y-4">
                        <div className="flex items-center justify-between gap-4 border-b border-border/80 pb-3">
                          <h3 className="text-[1.45rem] leading-tight">{subcategory.name}</h3>
                          <span className="text-xs uppercase tracking-[0.22em] text-foreground/42">
                            {subcategory.pieces.length > 0
                              ? `${subcategory.pieces.length} piece${subcategory.pieces.length > 1 ? 's' : ''}`
                              : 'Archive pending'}
                          </span>
                        </div>

                        {subcategory.pieces.length > 0 ? (
                          <div className="gallery-masonry">
                            {subcategory.pieces.map((piece, index) => (
                              <PieceCard
                                key={piece.id}
                                piece={piece}
                                index={index}
                                onOpen={(selectedPiece, imageIndex = 0) => {
                                  setViewerState({ piece: selectedPiece, imageIndex });
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <EmptyCollectionCard categoryName={category.name} subcategory={subcategory} />
                        )}
                      </section>
                    ))}
                  </div>
                </>
              );
            })()}
          </section>
        ))}
      </section>

      <GalleryPieceViewer
        piece={viewerState.piece}
        open={Boolean(viewerState.piece)}
        initialImageIndex={viewerState.imageIndex}
        onOpenChange={(open) => {
          if (!open) {
            setViewerState({ piece: null, imageIndex: 0 });
          }
        }}
      />
    </main>
  );
}
