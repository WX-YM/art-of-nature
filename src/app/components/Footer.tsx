export function Footer() {
  const year = new Date().getFullYear();
  const navigationItems = [
    { href: '#work', label: 'Work' },
    { href: '#about', label: 'About' },
    { href: '#journal', label: 'Journal' },
    { href: '#contact', label: 'Contact' },
  ];
  const connectItems = [
    { href: 'mailto:info@artofnatureeg.com', label: 'Email the studio' },
    { href: 'tel:+201030422422', label: 'Call +20 103 042 2422' },
    { href: '#top', label: 'Back to top' },
  ];

  return (
    <footer className="bg-primary py-16 text-primary-foreground">
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
                <a key={item.href} href={item.href} className="transition-opacity hover:opacity-100">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="mb-4 text-sm uppercase tracking-[0.24em] text-primary-foreground/48">Connect</h4>
            <nav className="flex flex-col gap-3 text-primary-foreground/74">
              {connectItems.map((item) => (
                <a key={item.href} href={item.href} className="transition-opacity hover:opacity-100">
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-primary-foreground/20 pt-8 text-sm text-primary-foreground/58 md:flex-row md:items-center md:justify-between">
          <p>© {year} Art of Nature. Crafted for bespoke interiors in Egypt and beyond.</p>
          <p>Design consultations available for residential, hospitality, and one-off statement pieces.</p>
        </div>
      </div>
    </footer>
  );
}
