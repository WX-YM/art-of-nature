import type { MouseEvent } from 'react';

type FooterProps = {
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

export function Footer({ currentPath = '/', onNavigate }: FooterProps) {
  const year = new Date().getFullYear();
  const isDetachedPage = currentPath !== '/';
  const isJournalPage = currentPath === '/journal' || currentPath.startsWith('/journal/');
  const kodeyardLogoSrc =
    '/uploads/banana-bee-font/AON-high-resolution-logo/AON-high-resolution-logo/ky-stamp-all-white.svg';
  const navigationItems = [
    { href: '/gallery', label: 'Gallery' },
    { href: isDetachedPage ? '/#about' : '#about', label: 'About' },
    { href: isJournalPage ? '/journal' : isDetachedPage ? '/#journal' : '#journal', label: 'Journal' },
    { href: isDetachedPage ? '/#contact' : '#contact', label: 'Contact' },
  ];
  const connectItems = [
    { href: 'mailto:info@artofnatureeg.com', label: 'Email the studio' },
    { href: 'tel:+201030422422', label: 'Call +20 103 042 2422' },
    { href: isDetachedPage ? '/' : '#top', label: 'Back to top' },
  ];

  const handleNavigationClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!onNavigate || !shouldHandleClientNavigation(event, href)) {
      return;
    }

    event.preventDefault();
    onNavigate(href);
  };

  return (
    <footer className="bg-primary pb-1 pt-16 text-primary-foreground md:py-16">
      <div className="section-shell">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <p className="text-sm uppercase tracking-[0.3em] text-primary-foreground/48">Art of Nature</p>
            <h3 className="mt-3 text-[2rem] leading-none sm:text-[2.3rem]">Built with patience and natural character.</h3>
            <p className="mt-5 max-w-md text-primary-foreground/70" style={{ lineHeight: '1.8' }}>
              Custom craftsmanship studio creating bespoke furniture and architectural elements from natural materials.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm uppercase tracking-[0.24em] text-primary-foreground/48">Navigation</h4>
            <nav className="flex flex-col gap-3 text-primary-foreground/74">
              {navigationItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="transition-opacity hover:opacity-100"
                  onClick={(event) => handleNavigationClick(event, item.href)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="mb-4 text-sm uppercase tracking-[0.24em] text-primary-foreground/48">Connect</h4>
            <nav className="flex flex-col gap-3 text-primary-foreground/74">
              {connectItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="transition-opacity hover:opacity-100"
                  onClick={(event) => handleNavigationClick(event, item.href)}
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/20 pt-8 text-sm text-primary-foreground/58">
          <div className="flex flex-col items-center gap-3 text-center md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-8 md:text-left">
            <p className="md:order-1">© {year} Art of Nature. Crafted for bespoke interiors in Egypt and beyond.</p>

            <div className="order-3 mt-2 flex w-full justify-center md:order-2 md:mt-1 md:w-auto md:translate-x-5 md:justify-self-center">
              <a
                href="https://kodeyard.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Visit Kodeyard"
                className="inline-flex transition-opacity hover:opacity-85"
              >
                <img
                  src={kodeyardLogoSrc}
                  alt="Created by Kodeyard"
                  className="h-auto w-[8rem] object-contain opacity-95 md:w-[9rem]"
                  loading="lazy"
                />
              </a>
            </div>

            <p className="order-2 md:order-3 md:text-right">
              Design consultations available for residential, hospitality, and one-off statement pieces.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
