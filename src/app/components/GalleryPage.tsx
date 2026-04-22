import { ArrowUpRight } from 'lucide-react';
import {
  buildGalleryCategories,
  getGalleryCategoryId,
  type GalleryContent,
  type GalleryPiece,
  type GallerySubcategory,
} from '../lib/gallery';
import { GalleryImage } from './GalleryImage';

type GalleryPageProps = {
  content: GalleryContent;
};

function getPieceCount(category: {
  subcategories: Array<{ pieces: GalleryPiece[] }>;
}) {
  return category.subcategories.reduce((total, subcategory) => total + subcategory.pieces.length, 0);
}

function EmptyCollectionCard({ subcategory }: { subcategory: GallerySubcategory }) {
  return (
    <div className="panel-surface flex min-h-[17rem] flex-col justify-between p-6 sm:p-7">
      <div>
        <p className="text-[0.78rem] uppercase tracking-[0.28em] text-foreground/46">{subcategory.name}</p>
        <h4 className="mt-4 text-[1.5rem] leading-tight text-foreground">Collection in Progress</h4>
        <p className="mt-4 max-w-sm text-sm leading-8 text-foreground/68 sm:text-base">
          This part of the gallery is being assembled with forthcoming documentation and installation photography.
        </p>
      </div>
      <p className="mt-8 text-xs uppercase tracking-[0.24em] text-foreground/40">Coming soon</p>
    </div>
  );
}

function PieceCard({ piece, index }: { piece: GalleryPiece; index: number }) {
  const imageCount = piece.images.length;

  return (
    <article
      className="gallery-masonry-item reveal-up group overflow-hidden border border-border bg-white shadow-[0_18px_48px_rgba(45,41,38,0.08)]"
      style={{ animationDelay: `${0.07 * (index + 1)}s` }}
    >
      <div className="space-y-3 border-b border-border/70 p-5 sm:p-6">
        <p className="text-[0.78rem] uppercase tracking-[0.28em] text-foreground/50">{piece.subcategory}</p>
        <h4 className="text-[1.45rem] leading-tight transition-colors group-hover:text-accent sm:text-[1.75rem]">
          {piece.title}
        </h4>
        <p className="text-sm leading-7 text-foreground/68 sm:text-base">{piece.material}</p>
        <p className="text-sm leading-7 text-foreground/62">{piece.note}</p>
        <p className="text-xs uppercase tracking-[0.22em] text-foreground/42">
          Archive set · {piece.archiveCount} image{piece.archiveCount === 1 ? '' : 's'}
        </p>
        <p className="pt-2 text-sm font-medium text-foreground/80">Inquire for Details</p>
      </div>
      <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
        {piece.images.map((asset, assetIndex) => (
          <div
            key={asset.src}
            className={
              imageCount === 1
                ? 'h-[20rem] sm:h-[24rem]'
                : assetIndex === 0
                  ? 'h-[20rem] sm:col-span-2 sm:h-[28rem]'
                  : 'h-[13rem] sm:h-[15rem]'
            }
          >
            <GalleryImage
              asset={asset}
              className="h-full w-full"
              sizes={
                imageCount === 1 || assetIndex === 0
                  ? '(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw'
                  : '(min-width: 1024px) 12rem, (min-width: 640px) 24rem, 50vw'
              }
            />
          </div>
        ))}
      </div>
    </article>
  );
}

export function GalleryPage({ content }: GalleryPageProps) {
  const galleryCategories = buildGalleryCategories(content);

  return (
    <main className="pb-20 pt-28 sm:pt-32 lg:pb-32">
      <section className="section-shell">
        <div className="reveal-up grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="section-kicker">{content.pageEyebrow}</p>
            <h1 style={{ fontSize: 'clamp(3rem, 7vw, 6rem)', lineHeight: '0.95' }}>
              {content.pageHeading}
            </h1>
          </div>
          <div className="max-w-xl lg:justify-self-end">
            <p className="text-[1.02rem] leading-8 text-foreground/72 sm:text-[1.08rem]">
              {content.pageDescription}
            </p>
          </div>
        </div>
      </section>

      <section className="section-shell mt-14 sm:mt-16">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {galleryCategories.map((category, index) => {
            const pieceCount = getPieceCount(category);

            return (
              <a
                key={category.name}
                href={`#${getGalleryCategoryId(category.name)}`}
                className="reveal-up panel-surface flex min-h-[9rem] flex-col justify-between p-5 transition-transform duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${0.06 * (index + 1)}s` }}
              >
                <p className="text-[0.74rem] uppercase tracking-[0.26em] text-foreground/45">
                  {category.eyebrow}
                </p>
                <div>
                  <h2 className="text-[1.55rem] leading-tight">{category.name}</h2>
                  <p className="mt-2 text-sm leading-7 text-foreground/62">
                    {category.subcategories.length} sections · {pieceCount} piece
                    {pieceCount === 1 ? '' : 's'}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="section-shell mt-16 space-y-16 sm:space-y-20 lg:mt-20 lg:space-y-24">
        {galleryCategories.map((category, categoryIndex) => (
          <section
            key={category.name}
            id={getGalleryCategoryId(category.name)}
            className="scroll-mt-28"
          >
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="reveal-up max-w-2xl" style={{ animationDelay: `${0.05 * (categoryIndex + 1)}s` }}>
                <p className="section-kicker">{category.eyebrow}</p>
                <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)', lineHeight: '1.02' }}>
                  {category.name}
                </h2>
                <p className="mt-4 text-[1rem] leading-8 text-foreground/68 sm:text-[1.05rem]">
                  {category.description}
                </p>
              </div>
              <a href="/#contact" className="reveal-up inline-flex items-center gap-2 self-start text-sm font-medium text-foreground transition-colors hover:text-accent" style={{ animationDelay: `${0.08 * (categoryIndex + 1)}s` }}>
                Inquire for Details
                <ArrowUpRight size={16} />
              </a>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.28fr_0.72fr]">
              <div className="reveal-up panel-surface h-fit p-6" style={{ animationDelay: `${0.1 * (categoryIndex + 1)}s` }}>
                <p className="text-[0.78rem] uppercase tracking-[0.28em] text-foreground/46">Sections</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {category.subcategories.map((subcategory) => (
                    <span
                      key={subcategory.name}
                      className="border border-border bg-white px-3 py-2 text-xs uppercase tracking-[0.18em] text-foreground/62"
                    >
                      {subcategory.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                {category.subcategories.map((subcategory) => (
                  <section key={`${category.name}-${subcategory.name}`} className="space-y-4">
                    <div className="flex items-center justify-between gap-4 border-b border-border/80 pb-3">
                      <h3 className="text-[1.45rem] leading-tight">{subcategory.name}</h3>
                      <span className="text-xs uppercase tracking-[0.22em] text-foreground/42">
                        {subcategory.pieces.length > 0 ? `${subcategory.pieces.length} piece${subcategory.pieces.length > 1 ? 's' : ''}` : 'Archive pending'}
                      </span>
                    </div>

                    {subcategory.pieces.length > 0 ? (
                      <div className="gallery-masonry">
                        {subcategory.pieces.map((piece, index) => (
                          <PieceCard key={piece.id} piece={piece} index={index} />
                        ))}
                      </div>
                    ) : (
                      <EmptyCollectionCard subcategory={subcategory} />
                    )}
                  </section>
                ))}
              </div>
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
