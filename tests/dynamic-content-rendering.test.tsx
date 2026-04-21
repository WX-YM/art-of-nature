import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import App from '../src/app/App';
import { render as renderEntryServer } from '../src/entry-server';
import type { HeroContent } from '../src/app/lib/heroContent';
import type { AboutContent } from '../src/app/lib/aboutContent';
import type { ContactContent } from '../src/app/lib/contactContent';
import type { CraftsmanshipContent } from '../src/app/lib/craftsmanshipContent';

function createHeroContent(): HeroContent {
  return {
    eyebrow: 'TEST HERO EYEBROW',
    headingLine1: 'Hero Line One',
    headingLine2: 'Hero Line Two',
    description: 'Hero description text for assertion.',
    ctaText: 'Hero CTA',
    ctaHref: '#hero-test',
    backgroundImageUrl: 'https://example.com/hero.jpg',
    backgroundImageAlt: 'Hero Alt',
  };
}

function createAboutContent(): AboutContent {
  return {
    eyebrow: 'TEST ABOUT EYEBROW',
    heading: 'About Dynamic Heading',
    paragraph1: 'About paragraph one.',
    paragraph2: 'About paragraph two.',
    paragraph3: 'About paragraph three.',
    focusPoints: ['Focus One', 'Focus Two', 'Focus Three'],
    processEyebrow: 'Process Test',
    processDescription: 'Process test description.',
    imageUrl: 'https://example.com/about.jpg',
    imageAlt: 'About Alt',
  };
}

function createCraftsmanshipContent(): CraftsmanshipContent {
  return {
    eyebrow: 'CRAFT EYEBROW',
    heading: 'Craft Heading',
    description: 'Craft description',
    items: [
      { title: 'Craft Box One', description: 'Craft Box One Description' },
      { title: 'Craft Box Two', description: 'Craft Box Two Description' },
    ],
  };
}

function createContactContent(): ContactContent {
  return {
    eyebrow: 'TEST CONTACT EYEBROW',
    heading: 'Contact Dynamic Heading',
    description: 'Contact dynamic description.',
    nameLabel: 'Dynamic Name',
    namePlaceholder: 'Dynamic Name Placeholder',
    emailLabel: 'Dynamic Email',
    emailPlaceholder: 'Dynamic Email Placeholder',
    projectTypeLabel: 'Dynamic Project Type',
    projectDefaultOption: 'Pick one',
    projectOptions: ['Dynamic Option A', 'Dynamic Option B'],
    messageLabel: 'Dynamic Message',
    messagePlaceholder: 'Dynamic Message Placeholder',
    submitText: 'Dynamic Submit',
    directContactLabel: 'Dynamic Direct Contact',
    directContacts: [
      { href: 'mailto:test@example.com', label: 'test@example.com' },
      { href: 'tel:+201111111111', label: '+201111111111' },
    ],
  };
}

test('App renders dynamic hero/about/contact text from props', () => {
  const heroContent = createHeroContent();
  const aboutContent = createAboutContent();
  const contactContent = createContactContent();
  const craftsmanshipContent = createCraftsmanshipContent();

  const html = renderToStaticMarkup(
    <App
      heroContent={heroContent}
      aboutContent={aboutContent}
      contactContent={contactContent}
      craftsmanshipContent={craftsmanshipContent}
    />
  );

  assert.ok(html.includes(heroContent.eyebrow));
  assert.ok(html.includes(heroContent.headingLine1));
  assert.ok(html.includes(heroContent.headingLine2));
  assert.ok(html.includes(aboutContent.heading));
  assert.ok(html.includes(aboutContent.paragraph1));
  assert.ok(html.includes(contactContent.heading));
  assert.ok(html.includes(contactContent.nameLabel));
  assert.ok(html.includes(contactContent.submitText));
  assert.ok(html.includes(contactContent.projectOptions[0]));
  assert.ok(html.includes(craftsmanshipContent.heading));
  assert.ok(html.includes(craftsmanshipContent.items[0].title));
  assert.ok(html.includes(aboutContent.focusPoints[0]));
  assert.ok(html.includes(aboutContent.processDescription));
});

test('Contact section keeps dynamic form field text and direct contacts', () => {
  const heroContent = createHeroContent();
  const aboutContent = createAboutContent();
  const contactContent = createContactContent();
  const craftsmanshipContent = createCraftsmanshipContent();

  const html = renderToStaticMarkup(
    <App
      heroContent={heroContent}
      aboutContent={aboutContent}
      contactContent={contactContent}
      craftsmanshipContent={craftsmanshipContent}
    />
  );

  assert.ok(html.includes(contactContent.emailLabel));
  assert.ok(html.includes(contactContent.projectTypeLabel));
  assert.ok(html.includes(contactContent.messageLabel));
  assert.ok(html.includes(contactContent.directContactLabel));
  assert.ok(html.includes(contactContent.directContacts[0].label));
});

test('SSR entry render includes dynamic content values', () => {
  const heroContent = createHeroContent();
  const aboutContent = createAboutContent();
  const contactContent = createContactContent();
  const craftsmanshipContent = createCraftsmanshipContent();

  const html = renderEntryServer(heroContent, aboutContent, contactContent, craftsmanshipContent);

  assert.ok(html.includes(heroContent.description));
  assert.ok(html.includes(aboutContent.paragraph2));
  assert.ok(html.includes(contactContent.description));
  assert.ok(html.includes(contactContent.projectOptions[1]));
  assert.ok(html.includes(craftsmanshipContent.items[1].description));
});

test('App trims dynamic content and skips empty dynamic contact entries', () => {
  const heroContent: HeroContent = {
    ...createHeroContent(),
    eyebrow: '  TRIMMED HERO EYEBROW  ',
  };

  const aboutContent = createAboutContent();
  const craftsmanshipContent: CraftsmanshipContent = {
    ...createCraftsmanshipContent(),
    items: [
      { title: '  Craft Trimmed  ', description: '  Craft Description  ' },
      { title: '   ', description: '   ' },
    ],
  };

  const contactContent: ContactContent = {
    ...createContactContent(),
    emailLabel: '  Dynamic Email Label  ',
    projectOptions: ['  Option Kept  ', '   '],
    directContacts: [
      { href: '  mailto:trimmed@example.com  ', label: '  trimmed@example.com  ' },
      { href: '   ', label: 'Should Not Render' },
    ],
  };

  const html = renderToStaticMarkup(
    <App
      heroContent={heroContent}
      aboutContent={aboutContent}
      contactContent={contactContent}
      craftsmanshipContent={craftsmanshipContent}
    />
  );

  assert.ok(html.includes('TRIMMED HERO EYEBROW'));
  assert.ok(html.includes('Dynamic Email Label'));
  assert.ok(html.includes('Option Kept'));
  assert.ok(html.includes('trimmed@example.com'));
  assert.ok(html.includes('Craft Trimmed'));
  assert.ok(!html.includes('Should Not Render'));
});
