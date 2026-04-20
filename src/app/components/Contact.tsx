import { useState, type FormEvent } from 'react';
import type { ContactContent } from '../lib/contactContent';
import type { ContactMessageInput } from '../lib/contactMessage';

type ContactProps = {
  content: ContactContent;
};

export function Contact({ content }: ContactProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitStatus(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: ContactMessageInput = {
      name: String(formData.get('name') ?? '').trim(),
      email: String(formData.get('email') ?? '').trim(),
      projectType: String(formData.get('projectType') ?? '').trim(),
      message: String(formData.get('message') ?? '').trim(),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || 'Unable to send your message right now.');
      }

      setSubmitStatus({ type: 'success', message: 'Thanks. Your message has been sent.' });
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send your message right now.';
      setSubmitStatus({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  }

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

        <form className="space-y-6" onSubmit={handleSubmit}>
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
              disabled={isSubmitting}
              className="w-full md:w-auto px-12 py-4 bg-primary text-primary-foreground hover:bg-accent transition-colors"
            >
              {isSubmitting ? 'Sending...' : submitText}
            </button>
          )}

          {submitStatus && (
            <p className={submitStatus.type === 'error' ? 'text-red-600' : 'text-green-700'}>{submitStatus.message}</p>
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
