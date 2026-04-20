import { ImageWithFallback } from './figma/ImageWithFallback';
import type { HeroContent } from '../lib/heroContent';

type HeroProps = {
  content: HeroContent;
};

export function Hero({ content }: HeroProps) {
  const eyebrow = content.eyebrow?.trim();
  const headingLine1 = content.headingLine1?.trim();
  const headingLine2 = content.headingLine2?.trim();
  const description = content.description?.trim();
  const ctaText = content.ctaText?.trim();
  const ctaHref = content.ctaHref?.trim();
  const backgroundImageUrl = content.backgroundImageUrl?.trim();
  const backgroundImageAlt = content.backgroundImageAlt?.trim();

  return (
    <section className="relative h-screen flex items-center justify-center">
      <div className="absolute inset-0">
        {backgroundImageUrl && (
          <ImageWithFallback
            src={backgroundImageUrl}
            alt={backgroundImageAlt || 'Hero background'}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12 text-center text-white">
        {eyebrow && <p className="mb-4 tracking-widest opacity-90">{eyebrow}</p>}
        {(headingLine1 || headingLine2) && (
          <h1 className="mb-8 leading-tight max-w-3xl mx-auto" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)' }}>
            {headingLine1}
            {headingLine1 && headingLine2 && <br />}
            {headingLine2}
          </h1>
        )}
        {description && (
          <p className="max-w-2xl mx-auto mb-12 opacity-90" style={{ fontSize: '1.125rem', lineHeight: '1.8' }}>
            {description}
          </p>
        )}
        {ctaText && ctaHref && (
          <a href={ctaHref} className="inline-block px-8 py-4 bg-white text-primary hover:bg-opacity-90 transition-all">
            {ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
