export function Contact() {
  return (
    <section id="contact" className="py-32 bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <p className="mb-4 tracking-widest opacity-60">GET IN TOUCH</p>
          <h2 className="mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: '1.2' }}>
            Let's Create Something Together
          </h2>
          <p className="max-w-2xl mx-auto opacity-70" style={{ fontSize: '1.0625rem', lineHeight: '1.8' }}>
            Whether you have a specific project in mind or are exploring possibilities, we'd love to hear from you. Share your vision, and let's discuss how we can bring it to life.
          </p>
        </div>

        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block mb-2">Name</label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-3 bg-input-background border border-border focus:outline-none focus:border-accent transition-colors"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block mb-2">Email</label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 bg-input-background border border-border focus:outline-none focus:border-accent transition-colors"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="project" className="block mb-2">Project Type</label>
            <select
              id="project"
              className="w-full px-4 py-3 bg-input-background border border-border focus:outline-none focus:border-accent transition-colors"
            >
              <option>Select a category</option>
              <option>Custom Furniture</option>
              <option>Architectural Elements</option>
              <option>Interior Details</option>
              <option>Other / Not Sure</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className="block mb-2">Tell us about your project</label>
            <textarea
              id="message"
              rows={6}
              className="w-full px-4 py-3 bg-input-background border border-border focus:outline-none focus:border-accent transition-colors resize-none"
              placeholder="Share your vision, space details, timeline, or any questions you have..."
            />
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-12 py-4 bg-primary text-primary-foreground hover:bg-accent transition-colors"
          >
            Send Inquiry
          </button>
        </form>

        <div className="mt-16 pt-16 border-t border-border text-center">
          <p className="mb-4 opacity-60">Prefer to reach out directly?</p>
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center opacity-80">
            <a href="mailto:info@artofnatureeg.com" className="hover:text-accent transition-colors">
              info@artofnatureeg.com
            </a>
            <span className="hidden md:inline opacity-30">·</span>
            <a href="tel:+201030422422" className="hover:text-accent transition-colors">
              +201030422422
            </a>
            <span className="hidden md:inline opacity-30">·</span>
            <a href="tel:+201030422422" className="hover:text-accent transition-colors">
              +201030422422
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
