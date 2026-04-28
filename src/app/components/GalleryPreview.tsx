import { ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import type { GalleryPreviewContent } from '../lib/gallery-public';
import { GalleryImage } from './GalleryImage';
import { GalleryPieceViewer } from './GalleryPieceViewer';

type GalleryPreviewProps = {
  content: GalleryPreviewContent | null;
};

export function GalleryPreview({ content }: GalleryPreviewProps) {
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);

  if (!content) {
    return null;
  }

  const selectedPiece = content.pieces.find((piece) => piece.id === selectedPieceId) ?? null;

  return (
    <section id="gallery-preview" className="scroll-mt-28 bg-background py-20 sm:py-24 lg:py-32">
      <div className="section-shell">
        <div className="mb-14 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="reveal-up max-w-2xl">
            <p className="section-kicker">{content.previewEyebrow}</p>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 4.25rem)', lineHeight: '1.02' }}>
              {content.previewHeading}
            </h2>
            <p className="mt-5 max-w-xl text-[1.03rem] leading-8 text-foreground/72">
              {content.previewDescription}
            </p>
          </div>

          <a
            href="/gallery"
            className="reveal-up inline-flex items-center gap-2 self-start border border-border bg-white px-5 py-3 text-sm transition-colors hover:border-accent hover:text-accent"
            style={{ animationDelay: '0.08s' }}
          >
            View All
            <ArrowUpRight size={16} />
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-6 sm:grid-cols-2">
            {content.pieces.slice(0, 4).map((piece, index) => (
              <button
                type="button"
                key={piece.id}
                onClick={() => setSelectedPieceId(piece.id)}
                className={`reveal-up group overflow-hidden border border-border bg-white shadow-[0_18px_45px_rgba(45,41,38,0.08)] ${
                  index === 0 ? 'sm:col-span-2' : ''
                } text-left`}
                style={{ animationDelay: `${0.1 * (index + 1)}s` }}
              >
                <div className={index === 0 ? 'h-[22rem] sm:h-[34rem]' : 'h-[20rem] sm:h-[26rem]'}>
                  <GalleryImage
                    asset={piece.image}
                    className="h-full w-full"
                    priority={index < 2}
                    variant={{ width: index === 0 ? 1200 : 900, quality: 72, format: 'webp' }}
                    sizes={index === 0 ? '(min-width: 1024px) 42rem, 100vw' : '(min-width: 1024px) 20rem, 100vw'}
                  />
                </div>
                <div className="space-y-3 p-5 sm:p-6">
                  <p className="text-[0.78rem] uppercase tracking-[0.28em] text-foreground/50">
                    {piece.category} / {piece.subcategory}
                  </p>
                  <h3 className="text-[1.45rem] leading-tight transition-colors group-hover:text-accent sm:text-[1.8rem]">
                    {piece.title}
                  </h3>
                  <p className="text-sm leading-7 text-foreground/68 sm:text-base">{piece.material}</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-foreground/42">
                    Archive set · {piece.archiveCount} image{piece.archiveCount === 1 ? '' : 's'}
                  </p>
                  <div className="inline-flex items-center gap-2 pt-1 text-xs uppercase tracking-[0.2em] text-foreground/55 transition-colors group-hover:text-accent">
                    Open archive
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            {content.pieces.slice(4, 6).map((piece, index) => (
              <button
                type="button"
                key={piece.id}
                onClick={() => setSelectedPieceId(piece.id)}
                className="reveal-up group overflow-hidden border border-border bg-white text-left shadow-[0_18px_45px_rgba(45,41,38,0.08)]"
                style={{ animationDelay: `${0.16 + 0.1 * index}s` }}
              >
                <div className="h-[18rem] sm:h-[22rem]">
                  <GalleryImage
                    asset={piece.image}
                    className="h-full w-full"
                    variant={{ width: 900, quality: 72, format: 'webp' }}
                    sizes="(min-width: 1024px) 24rem, 100vw"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <p className="text-[0.78rem] uppercase tracking-[0.28em] text-foreground/50">
                    {piece.category}
                  </p>
                  <h3 className="mt-3 text-[1.5rem] leading-tight transition-colors group-hover:text-accent">
                    {piece.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-foreground/68">{piece.note}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.22em] text-foreground/42">
                    Archive set · {piece.archiveCount} image{piece.archiveCount === 1 ? '' : 's'}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/55 transition-colors group-hover:text-accent">
                    Open archive
                    <ArrowUpRight size={14} />
                  </div>
                </div>
              </button>
            ))}

            <div className="reveal-up panel-surface flex flex-1 flex-col justify-between p-6 sm:p-8" style={{ animationDelay: '0.34s' }}>
              <div>
                <p className="section-kicker mb-3">Editorial Note</p>
                <h3 className="text-[2rem] leading-tight text-foreground sm:text-[2.5rem]">
                  A living archive of bespoke craftsmanship and material character.
                </h3>
                <p className="mt-4 text-sm leading-8 text-foreground/72 sm:text-base">
                  This gallery is a showcase of Art of Nature&apos;s work across furniture, lighting, and handcrafted details, brought together as a record of making rather than a catalogue of products.
                </p>
                <p className="mt-4 text-sm leading-8 text-foreground/72 sm:text-base">
                  Each piece is presented for its grain, form, finish, and atmosphere, so the collection reads as a body of craft shaped by patience, material honesty, and the character of the wood itself.
                </p>
              </div>
              <a href="/gallery" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-accent">
                View the full gallery
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <a
            href="/gallery"
            className="inline-flex items-center gap-2 border border-primary bg-primary px-7 py-3.5 text-sm text-primary-foreground transition-colors hover:border-accent hover:bg-accent"
          >
            View All
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>

      <GalleryPieceViewer
        piece={selectedPiece}
        open={Boolean(selectedPiece)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPieceId(null);
          }
        }}
      />
    </section>
  );
}
