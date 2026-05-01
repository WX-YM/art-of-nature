import { Facebook, Instagram, Mail, MessageCircle, Phone } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ContactContent } from '../lib/contactContent';
import { resolveContactLinks } from '../lib/contactLinks';

type ContactProps = {
  content: ContactContent;
};

export function Contact({ content }: ContactProps) {
  const [submissionState, setSubmissionState] = useState<null | 'success' | 'error' | 'rate-limit'>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const status = searchParams.get('contact');

    if (status === 'success' || status === 'error' || status === 'rate-limit') {
      setSubmissionState(status);
      return;
    }

    setSubmissionState(null);
  }, []);

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
  const directContacts = resolveContactLinks(content.directContacts);
  const primaryDirectContacts = directContacts.filter((contact) => contact.kind === 'email' || contact.kind === 'phone');

  const iconByKind = {
    email: Mail,
    phone: Phone,
    whatsapp: MessageCircle,
    instagram: Instagram,
    facebook: Facebook,
    link: Mail,
  } as const;

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

        {submissionState ? (
          <div
            className={`mb-8 border px-5 py-4 text-sm leading-7 sm:px-6 ${
              submissionState === 'success'
                ? 'border-[#c9d9cc] bg-[#eef5ef] text-[#365340]'
                : 'border-[#e2c2bb] bg-[#fbefec] text-[#7f4338]'
            }`}
          >
            {submissionState === 'success'
              ? 'Your inquiry has been sent successfully. The studio can now review the details and get back to you.'
              : submissionState === 'rate-limit'
                ? 'Too many inquiries were sent in a short time. Please wait a little and try again.'
                : 'Something was missing or invalid in the form. Please review the details and send it again.'}
          </div>
        ) : null}

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
            <div>
              <label htmlFor="phone" className="block mb-2">Phone (optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-4 py-3 bg-input-background border border-border focus:outline-none focus:border-accent transition-colors"
                placeholder="Your phone number"
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
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 justify-center items-center opacity-80">
                {primaryDirectContacts.map((contact, index) => (
                  <span key={`${contact.href}-${index}`} className="contents">
                    <a href={contact.href} className="hover:text-accent transition-colors">
                      {contact.label}
                    </a>
                    {index < primaryDirectContacts.length - 1 && <span className="hidden md:inline opacity-30">·</span>}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 opacity-80">
                {directContacts.map((contact) => {
                  const Icon = iconByKind[contact.kind];

                  return (
                    <a
                      key={`${contact.kind}-${contact.href}`}
                      href={contact.href}
                      aria-label={contact.kind === 'whatsapp' ? 'WhatsApp' : contact.label}
                      title={contact.kind === 'whatsapp' ? 'WhatsApp' : contact.label}
                      className="inline-flex h-11 w-11 items-center justify-center border border-border bg-white text-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
