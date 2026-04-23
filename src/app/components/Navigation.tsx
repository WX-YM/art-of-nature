import { Menu, X } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';

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
  const isGalleryPage = currentPath === '/gallery';
  const navigationItems = [
    { href: '/gallery', label: 'Gallery' },
    { href: isGalleryPage ? '/#about' : '#about', label: 'About' },
    { href: isGalleryPage ? '/#journal' : '#journal', label: 'Journal' },
  ];
  const homeHref = isGalleryPage ? '/' : '#top';
  const contactHref = isGalleryPage ? '/#contact' : '#contact';

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
        <a href={homeHref} className="min-w-0" onClick={(event) => handleNavigationClick(event, homeHref)}>
          <div className="text-sm font-semibold uppercase tracking-[0.35em] text-foreground/75 sm:text-base">
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
