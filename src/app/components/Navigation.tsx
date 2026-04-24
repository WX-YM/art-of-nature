import { Menu, X } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';

// Assets from /uploads (served from project root). Use POSIX paths for web compatibility.
const logoSrc = '/uploads/banana-bee-font/AON-high-resolution-logo/AON-high-resolution-logo/AON-high-resolution-logo-transparent.png';
const bananaBeeFontUrl = '/uploads/banana-bee-font/banana-bee-font/BananaBee.otf';

type NavigationProps = {
  currentPath?: string;
  onNavigate?: (href: string) => void;
};

function shouldHandleClientNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith('/')) {
    return false;
  }

  return (
    event.button === 0 &&
    !event.defaultPrevented &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

export function Navigation({ currentPath = '/', onNavigate }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isDetachedPage = currentPath !== '/';
  const isJournalPage = currentPath === '/journal' || currentPath.startsWith('/journal/');
  const navigationItems = [
    { href: '/gallery', label: 'Gallery' },
    { href: isDetachedPage ? '/#about' : '#about', label: 'About' },
    { href: isJournalPage ? '/journal' : isDetachedPage ? '/#journal' : '#journal', label: 'Journal' },
  ];
  const homeHref = isDetachedPage ? '/' : '#top';
  const contactHref = isDetachedPage ? '/#contact' : '#contact';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleNavigationClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!onNavigate || !shouldHandleClientNavigation(event, href)) {
      return;
    }

    event.preventDefault();
    setIsMenuOpen(false);
    onNavigate(href);
  };

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-border bg-background/92 shadow-[0_18px_50px_rgba(45,41,38,0.08)] backdrop-blur-xl'
          : 'bg-background/72 backdrop-blur-md'
      }`}
    >
      <div className="section-shell flex items-center justify-between py-4 sm:py-5">
        <a href={homeHref} className="min-w-0 flex items-center" onClick={(event) => handleNavigationClick(event, homeHref)}>
          <style>{`
            @font-face {
              font-family: 'Banana Bee';
              src: url('${bananaBeeFontUrl}') format('opentype');
              font-weight: normal;
              font-style: normal;
              font-display: swap;
            }
            .nav-title { font-family: 'Banana Bee', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
          `}</style>

          <div className="mr-4 h-14 w-14 sm:h-16 sm:w-16 rounded-full overflow-hidden flex items-center justify-center">
            <picture>
              <source
                type="image/webp"
                srcSet={
                  '/uploads/banana-bee-font/AON-high-resolution-logo/AON-high-resolution-logo/AON-high-resolution-logo-transparent-48.webp 48w, ' +
                  '/uploads/banana-bee-font/AON-high-resolution-logo/AON-high-resolution-logo/AON-high-resolution-logo-transparent-96.webp 96w, ' +
                  '/uploads/banana-bee-font/AON-high-resolution-logo/AON-high-resolution-logo/AON-high-resolution-logo-transparent-192.webp 192w'
                }
                sizes="48px"
              />

              <img
                src="/uploads/banana-bee-font/AON-high-resolution-logo/AON-high-resolution-logo/AON-high-resolution-logo-transparent-96.png"
                srcSet={
                  '/uploads/banana-bee-font/AON-high-resolution-logo/AON-high-resolution-logo/AON-high-resolution-logo-transparent-48.png 48w, ' +
                  '/uploads/banana-bee-font/AON-high-resolution-logo/AON-high-resolution-logo/AON-high-resolution-logo-transparent-96.png 96w, ' +
                  '/uploads/banana-bee-font/AON-high-resolution-logo/AON-high-resolution-logo/AON-high-resolution-logo-transparent-192.png 192w'
                }
                alt="Art of Nature logo"
                className="h-full w-full object-cover border-0 shadow-none bg-transparent"
              />
            </picture>
          </div>

          <div className="text-sm font-bold uppercase tracking-[0.35em] text-foreground/75 sm:text-base nav-title">
            Art of Nature
          </div>
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm transition-colors hover:text-accent"
              onClick={(event) => handleNavigationClick(event, item.href)}
            >
              {item.label}
            </a>
          ))}
          <a
            href={contactHref}
            className="inline-flex items-center justify-center border border-primary bg-primary px-6 py-3 text-sm text-primary-foreground transition-all hover:border-accent hover:bg-accent"
            onClick={(event) => handleNavigationClick(event, contactHref)}
          >
            Get in Touch
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-12 w-12 items-center justify-center border border-border bg-white/85 text-foreground shadow-sm transition-colors hover:border-accent hover:text-accent lg:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={`absolute inset-x-0 top-full border-t border-border bg-background/96 px-6 pb-6 pt-4 shadow-[0_22px_50px_rgba(45,41,38,0.12)] backdrop-blur-xl transition-all duration-300 lg:hidden ${
          isMenuOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0'
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center justify-between border border-border/70 bg-white/80 px-4 py-4 text-base transition-colors hover:border-accent hover:text-accent"
              onClick={(event) => handleNavigationClick(event, item.href)}
            >
              {item.label}
              <span className="text-xl leading-none">+</span>
            </a>
          ))}
          <a
            href={contactHref}
            className="mt-2 inline-flex items-center justify-center bg-primary px-5 py-4 text-center text-sm text-primary-foreground transition-colors hover:bg-accent"
            onClick={(event) => handleNavigationClick(event, contactHref)}
          >
            Start Your Project
          </a>
        </div>
      </div>
    </nav>
  );
}
