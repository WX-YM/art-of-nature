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
  const imageUrl = content.imageUrl?.trim();
  const imageAlt = content.imageAlt?.trim();

  return (
    <section id="about" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            {eyebrow && <p className="mb-4 tracking-widest opacity-60">{eyebrow}</p>}
            {heading && (
              <h2 className="mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: '1.2' }}>
                {heading}
              </h2>
            )}
            {(paragraph1 || paragraph2 || paragraph3) && (
              <div className="space-y-6 opacity-80" style={{ fontSize: '1.0625rem', lineHeight: '1.8' }}>
                {paragraph1 && <p>{paragraph1}</p>}
                {paragraph2 && <p>{paragraph2}</p>}
                {paragraph3 && <p>{paragraph3}</p>}
              </div>
            )}
          </div>

          {imageUrl && (
            <div className="relative h-[600px]">
              <ImageWithFallback
                src={imageUrl}
                alt={imageAlt || 'About image'}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
