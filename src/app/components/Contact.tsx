import type { ContactContent } from '../lib/contactContent';

type ContactProps = {
  content: ContactContent;
};

export function Contact({ content }: ContactProps) {
  const eyebrow = content.eyebrow?.trim();
  const heading = content.heading?.trim();
  const description = content.description?.trim();

  const nameLabel = content.nameLabel?.trim();
  const namePlaceholder = content.namePlaceholder?.trim();
  const emailLabel = content.emailLabel?.trim();
  const emailPlaceholder = content.emailPlaceholder?.trim();
  const projectTypeLabel = content.projectTypeLabel?.trim();
  const projectDefaultOption = content.projectDefaultOption?.trim();
  const projectOptions = content.projectOptions
    ?.map((option) => option?.trim())
    .filter((option): option is string => Boolean(option));
  const messageLabel = content.messageLabel?.trim();
  const messagePlaceholder = content.messagePlaceholder?.trim();
  const submitText = content.submitText?.trim();

  const directContactLabel = content.directContactLabel?.trim();
  const directContacts = content.directContacts
    .map((contact) => ({
      href: contact.href?.trim(),
      label: contact.label?.trim(),
    }))
    .filter((contact): contact is { href: string; label: string } => Boolean(contact.href && contact.label));

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

        <form className="space-y-6" action="/api/contact/messages" method="post">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {nameLabel && <label htmlFor="name" className="block mb-2">{nameLabel}</label>}
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 bg-input-background border border-border focus:outline-none focus:border-accent transition-colors"
                placeholder={namePlaceholder || undefined}
              />
            </div>
            <div>
              {emailLabel && <label htmlFor="email" className="block mb-2">{emailLabel}</label>}
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 bg-input-background border border-border focus:outline-none focus:border-accent transition-colors"
                placeholder={emailPlaceholder || undefined}
              />
            </div>
          </div>

          <div>
            {projectTypeLabel && <label htmlFor="project" className="block mb-2">{projectTypeLabel}</label>}
            <select
              id="project"
              name="projectType"
              required
              className="w-full px-4 py-3 bg-input-background border border-border focus:outline-none focus:border-accent transition-colors"
            >
              {projectDefaultOption && <option value="">{projectDefaultOption}</option>}
              {projectOptions?.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            {messageLabel && <label htmlFor="message" className="block mb-2">{messageLabel}</label>}
            <textarea
              id="message"
              name="message"
              required
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
