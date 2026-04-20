import type { FormEvent } from 'react';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react';

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
  ]
    .map((contact) => ({
      href: contact.href?.trim(),
      label: contact.label?.trim(),
    }))
    .filter((contact) => contact.href && contact.label);

  const studioDetails = [
    {
      icon: Mail,
      label: 'Email',
      value: 'info@artofnatureeg.com',
      href: 'mailto:info@artofnatureeg.com',
    },
    {
      icon: Phone,
      label: 'Phone',
      value: '+20 103 042 2422',
      href: 'tel:+201030422422',
    },
    {
      icon: MapPin,
      label: 'Based In',
      value: 'Cairo, Egypt',
      href: '#top',
    },
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get('name') ?? '').trim();
    const email = String(formData.get('email') ?? '').trim();
    const projectType = String(formData.get('projectType') ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();
    const subject = encodeURIComponent(
      `Project inquiry from ${name || 'Art of Nature website visitor'}`
    );
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        `Project type: ${projectType || 'Not specified'}`,
        '',
        'Project details:',
        message,
      ].join('\n')
    );

    window.location.href = `mailto:info@artofnatureeg.com?subject=${subject}&body=${body}`;
  }

  return (
    <section id="contact" className="scroll-mt-28 bg-background py-20 sm:py-24 lg:py-32">
      <div className="section-shell">
        <div className="reveal-up mb-12 max-w-2xl">
          {eyebrow && <p className="section-kicker">{eyebrow}</p>}
          {heading && (
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 4rem)', lineHeight: '1.02' }}>
              {heading}
            </h2>
          )}
          {description && (
            <p className="mt-5 max-w-2xl text-[1.03rem] text-foreground/72" style={{ lineHeight: '1.9' }}>
              {description}
            </p>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="reveal-up panel-surface flex flex-col justify-between gap-8 p-6 sm:p-8" style={{ animationDelay: '0.08s' }}>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-foreground/45">Direct contact</p>
              <div className="mt-6 space-y-4">
                {studioDetails.map((detail) => {
                  const Icon = detail.icon;

                  return (
                    <a
                      key={detail.label}
                      href={detail.href}
                      className="flex items-start gap-4 border border-border/80 bg-white/70 p-4 transition-colors hover:border-accent"
                    >
                      <span className="mt-1 inline-flex h-10 w-10 items-center justify-center border border-border bg-background">
                        <Icon size={18} />
                      </span>
                      <span>
                        <span className="block text-xs uppercase tracking-[0.24em] text-foreground/45">
                          {detail.label}
                        </span>
                        <span className="mt-1 block text-sm font-medium text-foreground/82 sm:text-base">
                          {detail.value}
                        </span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-xs uppercase tracking-[0.24em] text-foreground/45">Good to know</p>
              <div className="mt-4 space-y-3 text-sm leading-7 text-foreground/68">
                <p>Best results come from sharing your dimensions, inspiration references, and timeline up front.</p>
                <p>Submitting the form opens your email app with the project brief pre-filled, so you can review it before sending.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="reveal-up panel-surface space-y-6 p-6 sm:p-8" style={{ animationDelay: '0.16s' }}>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                {nameLabel && (
                  <label htmlFor="name" className="mb-2 block text-sm uppercase tracking-[0.2em] text-foreground/55">
                    {nameLabel}
                  </label>
                )}
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full border border-border bg-input-background px-4 py-3.5 focus:border-accent focus:outline-none transition-colors"
                  placeholder={namePlaceholder || undefined}
                />
              </div>
              <div>
                {emailLabel && (
                  <label htmlFor="email" className="mb-2 block text-sm uppercase tracking-[0.2em] text-foreground/55">
                    {emailLabel}
                  </label>
                )}
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full border border-border bg-input-background px-4 py-3.5 focus:border-accent focus:outline-none transition-colors"
                  placeholder={emailPlaceholder || undefined}
                />
              </div>
            </div>

            <div>
              {projectTypeLabel && (
                <label htmlFor="project" className="mb-2 block text-sm uppercase tracking-[0.2em] text-foreground/55">
                  {projectTypeLabel}
                </label>
              )}
              <select
                id="project"
                name="projectType"
                defaultValue=""
                className="w-full border border-border bg-input-background px-4 py-3.5 focus:border-accent focus:outline-none transition-colors"
              >
                {projectDefaultOption && <option value="" disabled>{projectDefaultOption}</option>}
                {projectOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              {messageLabel && (
                <label htmlFor="message" className="mb-2 block text-sm uppercase tracking-[0.2em] text-foreground/55">
                  {messageLabel}
                </label>
              )}
              <textarea
                id="message"
                name="message"
                rows={7}
                required
                className="w-full resize-none border border-border bg-input-background px-4 py-3.5 focus:border-accent focus:outline-none transition-colors"
                placeholder={messagePlaceholder || undefined}
              />
            </div>

            <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {directContactLabel && <p className="text-xs uppercase tracking-[0.24em] text-foreground/45">{directContactLabel}</p>}
                {directContacts.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1 text-sm text-foreground/72 sm:flex-row sm:gap-3">
                    {directContacts.map((contact, index) => (
                      <span key={`${contact.href}-${index}`} className="flex items-center gap-3">
                        <a href={contact.href} className="transition-colors hover:text-accent">
                          {contact.label}
                        </a>
                        {index < directContacts.length - 1 && <span className="hidden sm:inline text-foreground/35">•</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {submitText && (
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 bg-primary px-8 py-4 text-sm text-primary-foreground transition-colors hover:bg-accent sm:w-auto"
                >
                  {submitText}
                  <ArrowUpRight size={16} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
