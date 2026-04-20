export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
        <div className="tracking-wide">Art of Nature</div>
        <div className="flex gap-8 items-center">
          <a href="#work" className="hover:text-accent transition-colors">Work</a>
          <a href="#about" className="hover:text-accent transition-colors">About</a>
          <a href="#journal" className="hover:text-accent transition-colors">Journal</a>
          <a href="#contact" className="px-6 py-3 bg-primary text-primary-foreground hover:bg-accent transition-colors">
            Get in Touch
          </a>
        </div>
      </div>
    </nav>
  );
}
