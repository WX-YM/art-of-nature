import { useEffect, useState } from 'react';
import { fetchGallerySummary } from '../lib/gallery-client';
import {
  getGalleryCategoryId,
  type GalleryShellContent,
  type PublicGalleryPieceSummary,
  type PublicGallerySubcategory,
  type PublicGallerySummary,
} from '../lib/gallery-public';
import { GalleryImage } from './GalleryImage';
import { GalleryPieceViewer } from './GalleryPieceViewer';

type GalleryPageProps = {
  shell: GalleryShellContent | null;
};

function EmptyCollectionCard({
  categoryName,
  subcategory,
}: {
  categoryName: string;
  subcategory: PublicGallerySubcategory;
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
  contentVersion,
  index,
  onOpen,
}: {
  piece: PublicGalleryPieceSummary;
  contentVersion: number;
  index: number;
  onOpen: (piece: PublicGalleryPieceSummary, imageIndex?: number) => void;
}) {
  return (
    <article
      className="gallery-masonry-item reveal-up group overflow-hidden border border-border bg-white shadow-[0_18px_48px_rgba(45,41,38,0.08)]"
      style={{ animationDelay: `${0.07 * (index + 1)}s` }}
    >
      <button type="button" onClick={() => onOpen(piece, 0)} className="block w-full text-left">
        <div className="space-y-3 border-b border-border/70 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h4 className="text-[1.45rem] leading-tight transition-colors group-hover:text-accent sm:text-[1.75rem]">
              {piece.title}
            </h4>
            <span className="shrink-0 text-[0.68rem] uppercase tracking-[0.24em] text-foreground/42">
              {piece.archiveCount} frame{piece.archiveCount === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-[0.74rem] uppercase tracking-[0.24em] text-foreground/44">
            {piece.category} / {piece.subcategory}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="h-[20rem] overflow-hidden sm:h-[24rem]">
            <GalleryImage
              asset={piece.image}
              className="h-full w-full transition-transform duration-700 group-hover:scale-[1.02]"
              variant={{ width: 1200, quality: 72, format: 'webp', version: contentVersion }}
              sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
            />
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-[0.72rem] uppercase tracking-[0.22em] text-foreground/40">
            <span>{piece.material}</span>
            <span>Open archive</span>
          </div>
        </div>
      </button>
    </article>
  );
}

function GalleryLoadingState() {
  return (
    <section className="gallery-shell mt-16 space-y-8">
      <div className="rounded-[2rem] border border-border bg-white/70 p-6 shadow-[0_18px_48px_rgba(45,41,38,0.06)]">
        <p className="text-[0.72rem] uppercase tracking-[0.28em] text-foreground/42">Loading gallery</p>
        <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`gallery-card-skeleton-${index}`}
              className="overflow-hidden border border-border bg-white shadow-[0_18px_48px_rgba(45,41,38,0.08)]"
            >
              <div className="h-[18rem] animate-pulse bg-secondary/45" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-24 animate-pulse bg-secondary/45" />
                <div className="h-7 w-3/4 animate-pulse bg-secondary/45" />
                <div className="h-4 w-1/2 animate-pulse bg-secondary/45" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function GalleryPage({ shell }: GalleryPageProps) {
  const [summary, setSummary] = useState<PublicGallerySummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [viewerState, setViewerState] = useState<{ piece: PublicGalleryPieceSummary | null; imageIndex: number }>({
    piece: null,
    imageIndex: 0,
  });

  useEffect(() => {
    const controller = new AbortController();

    setIsLoadingSummary(true);
    setSummaryError(null);

    fetchGallerySummary({ signal: controller.signal })
      .then((nextSummary) => {
        setSummary(nextSummary);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setSummaryError(error instanceof Error ? error.message : 'Unable to load gallery.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingSummary(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  const displayShell = summary ?? shell;
  const currentContentVersion = summary?.contentVersion ?? shell?.contentVersion ?? 0;

  return (
    <main className="pb-20 pt-28 sm:pt-32 lg:pb-32">
      <section className="gallery-shell">
        <div className="reveal-up">
          <div>
            <p className="section-kicker">{displayShell?.pageEyebrow ?? 'Gallery'}</p>
            <h1 style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', lineHeight: '0.95' }}>
              {displayShell?.pageHeading ?? 'Gallery'}
            </h1>
            {displayShell?.pageDescription ? (
              <p className="mt-5 max-w-3xl text-[1rem] leading-8 text-foreground/66 sm:text-[1.04rem]">
                {displayShell.pageDescription}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {summary ? (
        <>
          <section className="gallery-shell mt-14 sm:mt-16">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {summary.categories.map((category, index) => (
                <a
                  key={category.name}
                  href={`#${getGalleryCategoryId(category.name)}`}
                  className="reveal-center panel-surface flex min-h-[9rem] items-center justify-center p-5 transition-transform duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${0.06 * (index + 1)}s` }}
                >
                  <h2 className="flex w-full items-center justify-center text-center text-[1.55rem] leading-tight">
                    {category.name}
                  </h2>
                </a>
              ))}
            </div>
          </section>

          <section className="gallery-shell mt-16 space-y-16 sm:space-y-20 lg:mt-20 lg:space-y-24">
            {summary.categories.map((category, categoryIndex) => (
              <section key={category.name} id={getGalleryCategoryId(category.name)} className="scroll-mt-28">
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
                      <span>{category.pieceCount} pieces</span>
                      <span>{category.archiveImageCount} archive images</span>
                    </div>
                  </div>

                  <div
                    className="reveal-up panel-surface overflow-hidden p-3 sm:p-4"
                    style={{ animationDelay: `${0.09 * (categoryIndex + 1)}s` }}
                  >
                    {category.leadPiece ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setViewerState({ piece: category.leadPiece, imageIndex: 0 })}
                          className="group block w-full text-left"
                        >
                          <div className="h-[14rem] overflow-hidden sm:h-[16rem]">
                            <GalleryImage
                              asset={category.leadPiece.image}
                              className="h-full w-full transition-transform duration-700 group-hover:scale-[1.02]"
                              variant={{ width: 1100, quality: 72, format: 'webp', version: summary.contentVersion }}
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
                            onClick={() => setViewerState({ piece: category.leadPiece, imageIndex: 0 })}
                            className="mt-2 text-left text-[1.25rem] leading-tight transition-colors hover:text-accent"
                          >
                            {category.leadPiece.title}
                          </button>
                          <div className="mt-4 flex items-center justify-between gap-3 text-[0.72rem] uppercase tracking-[0.22em] text-foreground/40">
                            <span>{category.leadPiece.archiveCount} images</span>
                            <span>{category.leadPiece.subcategory}</span>
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
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                          {subcategory.pieces.map((piece, index) => (
                            <PieceCard
                              key={piece.id}
                              piece={piece}
                              contentVersion={summary.contentVersion}
                              index={index}
                              onOpen={(nextPiece, imageIndex = 0) =>
                                setViewerState({ piece: nextPiece, imageIndex })
                              }
                            />
                          ))}
                        </div>
                      ) : (
                        <EmptyCollectionCard categoryName={category.name} subcategory={subcategory} />
                      )}
                    </section>
                  ))}
                </div>
              </section>
            ))}
          </section>
        </>
      ) : isLoadingSummary ? (
        <GalleryLoadingState />
      ) : (
        <section className="gallery-shell mt-16">
          <div className="rounded-[1.8rem] border border-dashed border-border bg-white/72 px-6 py-8 text-sm leading-7 text-foreground/64 sm:px-8">
            <p className="text-[0.72rem] uppercase tracking-[0.28em] text-foreground/42">Gallery unavailable</p>
            <p className="mt-4">{summaryError ?? 'Unable to load the gallery right now.'}</p>
          </div>
        </section>
      )}

      <GalleryPieceViewer
        piece={viewerState.piece}
        assetVersion={currentContentVersion}
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
