import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { fetchGalleryPieceDetail, primeGalleryPieceDetail } from '../lib/gallery-client';
import { defaultContactContent } from '../lib/contactContent';
import { resolveContactLinks } from '../lib/contactLinks';
import { type PublicGalleryPieceDetail, type PublicGalleryPieceSummary } from '../lib/gallery-public';
import { GalleryImage } from './GalleryImage';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

type GalleryPieceViewerProps = {
  piece: PublicGalleryPieceSummary | null;
  assetVersion?: number | null;
  open: boolean;
  initialImageIndex?: number;
  onOpenChange: (open: boolean) => void;
};

export function GalleryPieceViewer({
  piece,
  assetVersion = null,
  open,
  initialImageIndex = 0,
  onOpenChange,
}: GalleryPieceViewerProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(initialImageIndex);
  const [detail, setDetail] = useState<PublicGalleryPieceDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const mainImageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveImageIndex(initialImageIndex);
  }, [initialImageIndex, piece?.id]);

  useEffect(() => {
    if (!open || !piece) {
      return;
    }

    const controller = new AbortController();

    setDetail(null);
    setDetailError(null);
    setIsLoadingDetail(true);

    fetchGalleryPieceDetail(piece.id, { signal: controller.signal })
      .then((nextDetail) => {
        primeGalleryPieceDetail(nextDetail);
        setDetail(nextDetail);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setDetailError(error instanceof Error ? error.message : 'Unable to load gallery frames.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingDetail(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [open, piece]);

  const pieceData = detail ?? piece;
  const images = detail?.images ?? (piece ? [piece.image] : []);
  const currentContentVersion = detail?.contentVersion ?? assetVersion ?? undefined;
  const contactLinks = resolveContactLinks(defaultContactContent.directContacts);
  const whatsappLink = contactLinks.find((contact) => contact.kind === 'whatsapp');
  const instagramLink = contactLinks.find((contact) => contact.kind === 'instagram');
  const facebookLink = contactLinks.find((contact) => contact.kind === 'facebook');

  useEffect(() => {
    if (!open || images.length < 2) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        setActiveImageIndex((current) => (current + 1) % images.length);
      } else if (event.key === 'ArrowLeft') {
        setActiveImageIndex((current) => (current - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [images.length, open]);

  const safeImageIndex = useMemo(() => {
    if (images.length === 0) {
      return 0;
    }

    return Math.min(Math.max(activeImageIndex, 0), images.length - 1);
  }, [activeImageIndex, images.length]);

  const activeImage = images[safeImageIndex] ?? piece?.image ?? null;

  const moveImage = (direction: 1 | -1) => {
    if (images.length < 2) {
      return;
    }

    setActiveImageIndex((current) => (current + direction + images.length) % images.length);
  };

  const handleFrameSelect = (index: number) => {
    setActiveImageIndex(index);

    if (!open || !mainImageRef.current) {
      return;
    }

    mainImageRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid h-[min(94dvh,60rem)] max-h-[94dvh] w-[min(1440px,calc(100vw-1rem))] max-w-[min(1440px,calc(100vw-1rem))] gap-0 overflow-y-auto overscroll-contain border-border bg-[#f6f1ea] p-0 shadow-[0_42px_120px_rgba(28,24,21,0.24)] [touch-action:pan-y] [-webkit-overflow-scrolling:touch] sm:max-w-[min(1440px,calc(100vw-2rem))] md:overflow-hidden md:[touch-action:auto] md:grid-cols-[minmax(0,1.15fr)_22rem] xl:grid-cols-[minmax(0,1.4fr)_24rem] 2xl:grid-cols-[minmax(0,1.55fr)_26rem] [&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:border [&>button]:border-border [&>button]:bg-white/90 [&>button]:p-2 [&>button]:backdrop-blur-sm">
        {pieceData && activeImage ? (
          <>
            <div className="relative flex min-h-0 flex-col bg-[#ece4d8] md:max-h-[94dvh]">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-5">
                <p className="text-[0.72rem] uppercase tracking-[0.28em] text-foreground/48">
                  {pieceData.category} / {pieceData.subcategory}
                </p>
                <p className="text-[0.72rem] uppercase tracking-[0.24em] text-foreground/40">
                  {safeImageIndex + 1} of {detail ? detail.images.length : pieceData.archiveCount}
                </p>
              </div>

              <div ref={mainImageRef} className="relative min-h-0 flex-1 p-3 sm:p-4 xl:p-5">
                <div className="relative h-[20rem] overflow-hidden rounded-[1.6rem] bg-[linear-gradient(180deg,#f6efe6,#e9decf)] shadow-[0_26px_70px_rgba(45,41,38,0.12)] sm:h-[24rem] md:h-full">
                  <GalleryImage
                    asset={activeImage}
                    className="h-full w-full"
                    imageClassName="object-contain"
                    priority
                    variant={{ width: 1600, quality: 80, format: 'webp', version: currentContentVersion }}
                    sizes="(min-width: 1536px) 68rem, (min-width: 1280px) 60rem, (min-width: 768px) 62vw, 100vw"
                  />
                  {detail && detail.images.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => moveImage(-1)}
                        className="absolute left-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-black/28 text-white backdrop-blur-sm transition-colors hover:bg-black/42"
                        aria-label="Show previous image"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(1)}
                        className="absolute right-4 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-black/28 text-white backdrop-blur-sm transition-colors hover:bg-black/42"
                        aria-label="Show next image"
                      >
                        <ArrowRight size={18} />
                      </button>
                    </>
                  ) : null}
                  {isLoadingDetail ? (
                    <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
                      <div className="rounded-full border border-white/55 bg-black/30 px-4 py-2 text-[0.7rem] uppercase tracking-[0.24em] text-white backdrop-blur-sm">
                        Loading gallery frames
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <aside className="flex min-h-0 flex-col border-t border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(255,255,255,0.97))] md:max-h-[94dvh] md:border-l md:border-t-0">
              <div className="space-y-5 border-b border-border/70 px-5 py-5 sm:px-6">
                <div>
                  <p className="text-[0.72rem] uppercase tracking-[0.26em] text-foreground/44">
                    {pieceData.category} / {pieceData.subcategory}
                  </p>
                  <DialogTitle className="mt-3 text-left text-[1.8rem] font-medium leading-[1.02] text-foreground sm:text-[2.4rem]">
                    {pieceData.title}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-sm leading-7 text-foreground/68 sm:text-[0.98rem]">
                  {pieceData.material}
                </DialogDescription>
                <p className="text-sm leading-7 text-foreground/64 sm:text-[0.98rem]">{pieceData.note}</p>
                <div className="flex flex-wrap gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-3 text-xs uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:border-accent hover:bg-accent"
                      >
                        Inquire for Details
                        <ChevronDown size={15} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[13rem]">
                      {whatsappLink ? (
                        <DropdownMenuItem asChild>
                          <a href={whatsappLink.href} className="cursor-pointer">
                            <MessageCircle size={16} />
                            WhatsApp
                          </a>
                        </DropdownMenuItem>
                      ) : null}
                      {instagramLink ? (
                        <DropdownMenuItem asChild>
                          <a href={instagramLink.href} className="cursor-pointer">
                            <Instagram size={16} />
                            Instagram
                          </a>
                        </DropdownMenuItem>
                      ) : null}
                      {facebookLink ? (
                        <DropdownMenuItem asChild>
                          <a href={facebookLink.href} className="cursor-pointer">
                            <Facebook size={16} />
                            Facebook
                          </a>
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem asChild>
                        <a href="/#contact" className="cursor-pointer">
                          <ArrowUpRight size={16} />
                          Contact Us
                        </a>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-visible px-5 py-5 sm:px-6 md:overflow-y-auto md:overscroll-contain md:[-webkit-overflow-scrolling:touch]">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-[0.75rem] uppercase tracking-[0.28em] text-foreground/48">
                    Gallery Images
                  </p>
                  <p className="text-[0.72rem] uppercase tracking-[0.24em] text-foreground/38">
                    {detail ? 'Select a frame' : 'Loading frames'}
                  </p>
                </div>

                {detailError ? (
                  <div className="rounded-[1.1rem] border border-dashed border-border bg-white/75 px-4 py-5 text-sm leading-7 text-foreground/62">
                    {detailError}
                  </div>
                ) : null}

                {detail ? (
                  <div className="grid grid-cols-2 gap-3">
                    {detail.images.map((image, index) => {
                      const isActive = index === safeImageIndex;

                      return (
                        <button
                          key={`${pieceData.id}-${image.src}-${index}`}
                          type="button"
                          onClick={() => handleFrameSelect(index)}
                          className={`overflow-hidden rounded-[1.15rem] border bg-white text-left shadow-[0_16px_35px_rgba(45,41,38,0.08)] transition-all ${
                            isActive
                              ? 'border-accent ring-1 ring-accent'
                              : 'border-border hover:border-accent/60'
                          }`}
                          aria-label={`Show image ${index + 1} of ${detail.images.length}`}
                        >
                          <div className="h-28 sm:h-32">
                            <GalleryImage
                              asset={image}
                              className="h-full w-full"
                              imageClassName="object-cover"
                              variant={{ width: 420, quality: 70, format: 'webp', version: currentContentVersion }}
                              sizes="(min-width: 1280px) 14rem, 40vw"
                            />
                          </div>
                          <div className="border-t border-border/70 px-3 py-2">
                            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/45">
                              Frame {index + 1}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: Math.max(Math.min(pieceData.archiveCount, 4), 2) }).map((_, index) => (
                      <div
                        key={`gallery-piece-skeleton-${index}`}
                        className="overflow-hidden rounded-[1.15rem] border border-border bg-white shadow-[0_16px_35px_rgba(45,41,38,0.08)]"
                      >
                        <div className="h-28 animate-pulse bg-secondary/45 sm:h-32" />
                        <div className="border-t border-border/70 px-3 py-2">
                          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-foreground/40">
                            Loading
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
