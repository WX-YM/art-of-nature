import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { defaultHeroContent, type HeroContent } from './app/lib/heroContent';
import type { AboutContent } from './app/lib/aboutContent';
import { defaultContactContent, type ContactContent } from './app/lib/contactContent';
import type { CraftsmanshipContent } from './app/lib/craftsmanshipContent';
import type { JournalContent } from './app/lib/journal';
import { markVisitTracked, shouldTrackVisit } from './app/lib/siteVisitTracking';
import type { GalleryPreviewContent, GalleryShellContent } from './app/lib/gallery-public';

declare global {
  interface Window {
    __INITIAL_HERO__?: HeroContent;
    __INITIAL_ABOUT__?: AboutContent;
    __INITIAL_GALLERY_PREVIEW__?: GalleryPreviewContent;
    __INITIAL_GALLERY_SHELL__?: GalleryShellContent;
    __INITIAL_JOURNAL__?: JournalContent;
    __INITIAL_CONTACT__?: ContactContent;
    __INITIAL_CRAFTSMANSHIP__?: CraftsmanshipContent;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found.');
}

const heroContent = window.__INITIAL_HERO__ ?? defaultHeroContent;
const aboutContent = window.__INITIAL_ABOUT__ ?? null;
const galleryPreviewContent = window.__INITIAL_GALLERY_PREVIEW__ ?? null;
const galleryShellContent = window.__INITIAL_GALLERY_SHELL__ ?? null;
const journalContent = window.__INITIAL_JOURNAL__ ?? null;
const contactContent = window.__INITIAL_CONTACT__ ?? defaultContactContent;
const craftsmanshipContent = window.__INITIAL_CRAFTSMANSHIP__ ?? null;
const routePath = window.location.pathname;

if (rootElement.hasChildNodes()) {
  hydrateRoot(
    rootElement,
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
} else {
  createRoot(rootElement).render(
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

const now = Date.now();

if (shouldTrackVisit(window.localStorage, now)) {
  fetch('/api/visits/track', {
    method: 'POST',
    keepalive: true,
  })
    .then((response) => {
      if (response.ok) {
        markVisitTracked(window.localStorage, now);
      }
    })
    .catch(() => {});
}
