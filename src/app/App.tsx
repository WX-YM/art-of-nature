import { startTransition, useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { GalleryPreview } from './components/GalleryPreview';
import { GalleryPage } from './components/GalleryPage';
import { Craftsmanship } from './components/Craftsmanship';
import { BlogPreview } from './components/BlogPreview';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import type { GalleryContent } from './lib/gallery';
import type { HeroContent } from './lib/heroContent';
import type { AboutContent } from './lib/aboutContent';
import type { ContactContent } from './lib/contactContent';
import type { CraftsmanshipContent } from './lib/craftsmanshipContent';

type AppProps = {
  heroContent: HeroContent;
  aboutContent: AboutContent;
  galleryContent: GalleryContent;
  contactContent: ContactContent;
  craftsmanshipContent: CraftsmanshipContent;
  routePath?: string;
};

type ClientLocation = {
  path: string;
  hash: string;
};

function normalizePath(pathname: string) {
  return pathname === '' ? '/' : pathname.replace(/\/+$/, '') || '/';
}

function readClientLocation(fallbackPath: string): ClientLocation {
  if (typeof window === 'undefined') {
    return { path: fallbackPath, hash: '' };
  }

  return {
    path: normalizePath(window.location.pathname),
    hash: window.location.hash,
  };
}

function scrollToHash(hash: string) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!hash || hash === '#top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const targetId = decodeURIComponent(hash.slice(1));
  const targetElement = document.getElementById(targetId);

  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export default function App({
  heroContent,
  aboutContent,
  galleryContent,
  contactContent,
  craftsmanshipContent,
  routePath = '/',
}: AppProps) {
  const normalizedPath = normalizePath(routePath);
  const [clientLocation, setClientLocation] = useState<ClientLocation>(() => readClientLocation(normalizedPath));
  const isGalleryPage = clientLocation.path === '/gallery';

  useEffect(() => {
    const syncLocation = () => {
      setClientLocation(readClientLocation(normalizedPath));
    };

    syncLocation();
    window.addEventListener('popstate', syncLocation);
    window.addEventListener('hashchange', syncLocation);

    return () => {
      window.removeEventListener('popstate', syncLocation);
      window.removeEventListener('hashchange', syncLocation);
    };
  }, [normalizedPath]);

  useEffect(() => {
    if (clientLocation.path !== '/') {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    if (!clientLocation.hash) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      scrollToHash(clientLocation.hash);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [clientLocation.hash, clientLocation.path]);

  const handleNavigate = (href: string) => {
    if (typeof window === 'undefined') {
      return;
    }

    const destination = new URL(href, window.location.origin);

    if (destination.origin !== window.location.origin) {
      window.location.assign(destination.toString());
      return;
    }

    const nextLocation = {
      path: normalizePath(destination.pathname),
      hash: destination.hash,
    };
    const nextUrl = `${nextLocation.path}${destination.search}${nextLocation.hash}`;

    if (
      nextLocation.path === clientLocation.path &&
      nextLocation.hash === clientLocation.hash &&
      destination.search === window.location.search
    ) {
      scrollToHash(nextLocation.hash);
      return;
    }

    const applyNavigation = () => {
      window.history.pushState({}, '', nextUrl);
      startTransition(() => {
        setClientLocation(nextLocation);
      });
    };

    type ViewTransitionDocument = Document & {
      startViewTransition?: (callback: () => void) => unknown;
    };

    const transitionDocument = document as ViewTransitionDocument;
    if (transitionDocument.startViewTransition && nextLocation.path !== clientLocation.path) {
      transitionDocument.startViewTransition(() => {
        applyNavigation();
      });
      return;
    }

    applyNavigation();
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(168,153,110,0.18),transparent_65%)]" />
        <div className="absolute left-[-8rem] top-[32rem] h-72 w-72 rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute right-[-10rem] top-[58rem] h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </div>
      <Navigation currentPath={clientLocation.path} onNavigate={handleNavigate} />
      {isGalleryPage ? (
        <GalleryPage content={galleryContent} />
      ) : (
        <>
          <Hero content={heroContent} />
          <About content={aboutContent} />
          <GalleryPreview content={galleryContent} />
          <Craftsmanship content={craftsmanshipContent} />
          <BlogPreview />
        </>
      )}
      <Contact content={contactContent} />
      <Footer currentPath={clientLocation.path} onNavigate={handleNavigate} />
    </div>
  );
}
