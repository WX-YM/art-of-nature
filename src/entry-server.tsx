import { renderToString } from 'react-dom/server';
import App from './app/App';
import type { GalleryContent } from './app/lib/gallery';
import type { HeroContent } from './app/lib/heroContent';
import type { AboutContent } from './app/lib/aboutContent';
import type { ContactContent } from './app/lib/contactContent';
import type { CraftsmanshipContent } from './app/lib/craftsmanshipContent';

export function render(
  heroContent: HeroContent,
  aboutContent: AboutContent,
  galleryContent: GalleryContent,
  contactContent: ContactContent,
  craftsmanshipContent: CraftsmanshipContent,
  routePath: string = '/'
): string {
  return renderToString(
    <App
      heroContent={heroContent}
      aboutContent={aboutContent}
      galleryContent={galleryContent}
      contactContent={contactContent}
      craftsmanshipContent={craftsmanshipContent}
      routePath={routePath}
    />
  );
}
