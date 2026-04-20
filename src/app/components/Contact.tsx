export function Contact() {
  const eyebrow = 'GET IN TOUCH'.trim();
  const heading = "Let's Create Something Together".trim();
  const description =
    "Whether you have a specific project in mind or are exploring possibilities, we'd love to hear from you. Share your vision, and let's discuss how we can bring it to life.".trim();

  const nameLabel = 'Name'.trim();
  const namePlaceholder = 'Your name'.trim();
  const emailLabel = 'Email'.trim();
  const emailPlaceholder = 'your@email.com'.trim();
  const projectTypeLabel = 'Project Type'.trim();
  const projectDefaultOption = 'Select a category'.trim();
  const projectOptions = ['Custom Furniture', 'Architectural Elements', 'Interior Details', 'Other / Not Sure']
    .map((option) => option.trim())
    .filter(Boolean);
  const messageLabel = 'Tell us about your project'.trim();
  const messagePlaceholder = 'Share your vision, space details, timeline, or any questions you have...'.trim();
  const submitText = 'Send Inquiry'.trim();

  const directContactLabel = 'Prefer to reach out directly?'.trim();
  const directContacts = [
    { href: 'mailto:info@artofnatureeg.com', label: 'info@artofnatureeg.com' },
    { href: 'tel:+201030422422', label: '+201030422422' },
    { href: 'tel:+201030422422', label: '+201030422422' },
  ]
    .map((contact) => ({
      href: contact.href?.trim(),
      label: contact.label?.trim(),
    }))
    .filter((contact) => contact.href && contact.label);

  return (
    <section id="contact" className="py-32 bg-background">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          {eyebrow && <p className="mb-4 tracking-widest opacity-60">{eyebrow}</p>}
          {heading && (
            <h2 className="mb-8" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)', lineHeight: '1.2' }}>
              {heading}
            </h2>
          )}
          {description && (
            <p className="max-w-2xl mx-auto opacity-70" style={{ fontSize: '1.0625rem', lineHeight: '1.8' }}>
              {description}
            </p>
          )}
        </div>

        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {nameLabel && <label htmlFor="name" className="block mb-2">{nameLabel}</label>}
              <input
                type="text"
                id="name"
                className="w-full px-4 py-3 bg-input-background border border-border focus:outline-none focus:border-accent transition-colors"
                placeholder={namePlaceholder || undefined}
              />
            </div>
            <div>
              {emailLabel && <label htmlFor="email" className="block mb-2">{emailLabel}</label>}
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 bg-input-background border border-border focus:outline-none focus:border-accent transition-colors"
                placeholder={emailPlaceholder || undefined}
              />
            </div>
          </div>

          <div>
            {projectTypeLabel && <label htmlFor="project" className="block mb-2">{projectTypeLabel}</label>}
            <select
              id="project"
              className="w-full px-4 py-3 bg-input-background border border-border focus:outline-none focus:border-accent transition-colors"
            >
              {projectDefaultOption && <option>{projectDefaultOption}</option>}
              {projectOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            {messageLabel && <label htmlFor="message" className="block mb-2">{messageLabel}</label>}
            <textarea
              id="message"
              rows={6}
              className="w-full px-4 py-3 bg-input-background border border-border focus:outline-none focus:border-accent transition-colors resize-none"
              placeholder={messagePlaceholder || undefined}
            />
          </div>

          {submitText && (
            <button
              type="submit"
              className="w-full md:w-auto px-12 py-4 bg-primary text-primary-foreground hover:bg-accent transition-colors"
            >
              {submitText}
            </button>
          )}
        </form>

        <div className="mt-16 pt-16 border-t border-border text-center">
          {directContactLabel && <p className="mb-4 opacity-60">{directContactLabel}</p>}
          {directContacts.length > 0 && (
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center opacity-80">
              {directContacts.map((contact, index) => (
                <span key={`${contact.href}-${index}`} className="contents">
                  <a href={contact.href} className="hover:text-accent transition-colors">
                    {contact.label}
                  </a>
                  {index < directContacts.length - 1 && <span className="hidden md:inline opacity-30">·</span>}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
