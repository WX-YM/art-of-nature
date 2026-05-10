import { ImageWithFallback } from './figma/ImageWithFallback';
import type { AboutContent } from '../lib/aboutContent';

type AboutProps = {
  content: AboutContent;
};

export function About({ content }: AboutProps) {
  const eyebrow = content.eyebrow?.trim();
  const heading = content.heading?.trim();
  const paragraph1 = content.paragraph1?.trim();
  const paragraph2 = content.paragraph2?.trim();
  const paragraph3 = content.paragraph3?.trim();
  const focusPoints = (content.focusPoints ?? [])
    .map((point) => point?.trim())
    .filter((point): point is string => Boolean(point));
  const processEyebrow = content.processEyebrow?.trim();
  const processDescription = content.processDescription?.trim();
  const imageUrl = content.imageUrl?.trim();
  const imageAlt = content.imageAlt?.trim();

  if (
    !eyebrow &&
    !heading &&
    !paragraph1 &&
    !paragraph2 &&
    !paragraph3 &&
    focusPoints.length === 0 &&
    !processEyebrow &&
    !processDescription &&
    !imageUrl
  ) {
    return null;
  }

  return (
    <section id="about" className="scroll-mt-28 bg-white py-20 sm:py-24 lg:py-32">
      <div className="section-shell">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="reveal-up">
            {eyebrow && <p className="section-kicker">{eyebrow}</p>}
            {heading && (
              <h2 className="max-w-2xl" style={{ fontSize: 'clamp(2.2rem, 4vw, 4.2rem)', lineHeight: '1.02' }}>
                {heading}
              </h2>
            )}
            {(paragraph1 || paragraph2 || paragraph3) && (
              <div className="mt-8 space-y-6 text-[1.03rem] opacity-78 sm:text-[1.08rem]" style={{ lineHeight: '1.9' }}>
                {paragraph1 && <p>{paragraph1}</p>}
                {paragraph2 && <p>{paragraph2}</p>}
                {paragraph3 && <p>{paragraph3}</p>}
              </div>
            )}

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {focusPoints.map((point, index) => (
                <div
                  key={point}
                  className="panel-surface reveal-up px-4 py-5"
                  style={{ animationDelay: `${0.12 * (index + 1)}s` }}
                >
                  <div className="mb-4 h-px w-10 bg-accent/40" />
                  <p className="text-sm font-medium text-foreground/80">{point}</p>
                </div>
              ))}
            </div>
          </div>

          {imageUrl && (
            <div className="reveal-up relative" style={{ animationDelay: '0.12s' }}>
              <div className="absolute -left-4 top-10 hidden h-40 w-40 border border-accent/20 bg-secondary/70 lg:block" />
              <div className="relative overflow-hidden border border-border bg-secondary p-3 shadow-[0_28px_80px_rgba(45,41,38,0.12)]">
                <div className="relative h-[22rem] overflow-hidden sm:h-[30rem] lg:h-[38rem]">
                  <ImageWithFallback
                    src={imageUrl}
                    alt={imageAlt || 'About image'}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="panel-surface absolute bottom-4 left-4 max-w-xs px-4 py-4 sm:bottom-6 sm:left-6">
                  {processEyebrow && <p className="text-xs uppercase tracking-[0.3em] text-foreground/55">{processEyebrow}</p>}
                  {processDescription && <p className="mt-2 text-sm leading-7 text-foreground/78">{processDescription}</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
