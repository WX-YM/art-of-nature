export function Footer() {
  return (
    <footer className="py-16 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <h3 className="mb-4" style={{ fontSize: '1.25rem' }}>Art of Nature</h3>
            <p className="opacity-70 max-w-sm" style={{ lineHeight: '1.7' }}>
              Custom craftsmanship studio creating bespoke furniture and architectural elements from natural materials.
            </p>
          </div>

          <div>
            <h4 className="mb-4">Navigation</h4>
            <nav className="flex flex-col gap-3 opacity-70">
              <a href="#work" className="hover:opacity-100 transition-opacity">Work</a>
              <a href="#about" className="hover:opacity-100 transition-opacity">About</a>
              <a href="#journal" className="hover:opacity-100 transition-opacity">Journal</a>
              <a href="#contact" className="hover:opacity-100 transition-opacity">Contact</a>
            </nav>
          </div>

          <div>
            <h4 className="mb-4">Connect</h4>
            <nav className="flex flex-col gap-3 opacity-70">
              <a href="#" className="hover:opacity-100 transition-opacity">Instagram</a>
              <a href="#" className="hover:opacity-100 transition-opacity">Pinterest</a>
              <a href="#" className="hover:opacity-100 transition-opacity">LinkedIn</a>
            </nav>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4 opacity-60">
          <p>© 2026 Art of Nature. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
