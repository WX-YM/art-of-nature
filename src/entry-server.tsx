import { renderToString } from 'react-dom/server';
import App from './app/App';
import type { HeroContent } from './app/lib/heroContent';
import type { AboutContent } from './app/lib/aboutContent';
import type { ContactContent } from './app/lib/contactContent';
import type { CraftsmanshipContent } from './app/lib/craftsmanshipContent';
import type { JournalContent } from './app/lib/journal';
import type { GalleryPreviewContent, GalleryShellContent } from './app/lib/gallery-public';

export function render(
  heroContent: HeroContent | null,
  aboutContent: AboutContent | null,
  galleryPreviewContent: GalleryPreviewContent | null,
  galleryShellContent: GalleryShellContent | null,
  journalContent: JournalContent | null,
  contactContent: ContactContent,
  craftsmanshipContent: CraftsmanshipContent | null,
  routePath: string = '/'
): string {
  return renderToString(
    <App
      heroContent={heroContent}
      aboutContent={aboutContent}
      galleryPreviewContent={galleryPreviewContent}
      galleryShellContent={galleryShellContent}
      journalContent={journalContent}
      contactContent={contactContent}
      craftsmanshipContent={craftsmanshipContent}
      routePath={routePath}
    />
  );
}
