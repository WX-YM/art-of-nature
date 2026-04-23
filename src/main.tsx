import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { defaultGalleryContent, type GalleryContent } from './app/lib/gallery';
import { defaultHeroContent, type HeroContent } from './app/lib/heroContent';
import { defaultAboutContent, type AboutContent } from './app/lib/aboutContent';
import { defaultContactContent, type ContactContent } from './app/lib/contactContent';
import { defaultCraftsmanshipContent, type CraftsmanshipContent } from './app/lib/craftsmanshipContent';
import { markVisitTracked, shouldTrackVisit } from './app/lib/siteVisitTracking';

declare global {
  interface Window {
    __INITIAL_HERO__?: HeroContent;
    __INITIAL_ABOUT__?: AboutContent;
    __INITIAL_GALLERY__?: GalleryContent;
    __INITIAL_CONTACT__?: ContactContent;
    __INITIAL_CRAFTSMANSHIP__?: CraftsmanshipContent;
  }
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element was not found.');
}

const heroContent = window.__INITIAL_HERO__ ?? defaultHeroContent;
const aboutContent = window.__INITIAL_ABOUT__ ?? defaultAboutContent;
const galleryContent = window.__INITIAL_GALLERY__ ?? defaultGalleryContent;
const contactContent = window.__INITIAL_CONTACT__ ?? defaultContactContent;
const craftsmanshipContent = window.__INITIAL_CRAFTSMANSHIP__ ?? defaultCraftsmanshipContent;
const routePath = window.location.pathname;

if (rootElement.hasChildNodes()) {
  hydrateRoot(
    rootElement,
    <App
      heroContent={heroContent}
      aboutContent={aboutContent}
      galleryContent={galleryContent}
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
      galleryContent={galleryContent}
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
