import test from 'node:test';
import assert from 'node:assert/strict';
import { getHeroContent, upsertHeroContent } from '../server/hero-content-service';
import { getAboutContent, upsertAboutContent } from '../server/about-content-service';
import { getContactContent, upsertContactContent } from '../server/contact-content-service';
import { getCraftsmanshipContent, upsertCraftsmanshipContent } from '../server/craftsmanship-content-service';
import { createContactMessage } from '../server/contact-message-service';
import { HeroContentModel } from '../server/models/HeroContent';
import { AboutContentModel } from '../server/models/AboutContent';
import { ContactContentModel } from '../server/models/ContactContent';
import { CraftsmanshipContentModel } from '../server/models/CraftsmanshipContent';
import { ContactMessageModel } from '../server/models/ContactMessage';
import { defaultHeroContent } from '../src/app/lib/heroContent';
import { defaultAboutContent } from '../src/app/lib/aboutContent';
import { defaultContactContent } from '../src/app/lib/contactContent';
import { defaultCraftsmanshipContent } from '../src/app/lib/craftsmanshipContent';

test('getHeroContent returns defaults when no document exists', async () => {
  const originalFindOne = HeroContentModel.findOne;

  (HeroContentModel as unknown as { findOne: () => { lean: () => Promise<unknown> } }).findOne = () => ({
    lean: async () => null,
  });

  try {
    const content = await getHeroContent();
    assert.deepEqual(content, defaultHeroContent);
  } finally {
    (HeroContentModel as unknown as { findOne: typeof HeroContentModel.findOne }).findOne = originalFindOne;
  }
});

test('upsertHeroContent persists with fixed key and returns input', async () => {
  const originalFindOneAndUpdate = HeroContentModel.findOneAndUpdate;

  (HeroContentModel as unknown as { findOneAndUpdate: (...args: unknown[]) => Promise<unknown> }).findOneAndUpdate = (
    filter: unknown,
    update: unknown,
    options: unknown
  ) => {
    assert.deepEqual(filter, { key: 'primary-hero' });
    assert.deepEqual(options, { upsert: true, new: true, setDefaultsOnInsert: true });
    assert.equal((update as { key: string }).key, 'primary-hero');
    return Promise.resolve(null);
  };

  const input = {
    eyebrow: 'eyebrow',
    headingLine1: 'line1',
    headingLine2: 'line2',
    description: 'description',
    ctaText: 'cta',
    ctaHref: '#a',
    backgroundImageUrl: 'https://example.com/h.jpg',
    backgroundImageAlt: 'alt',
  };

  try {
    const saved = await upsertHeroContent(input);
    assert.deepEqual(saved, input);
  } finally {
    (HeroContentModel as unknown as { findOneAndUpdate: typeof HeroContentModel.findOneAndUpdate }).findOneAndUpdate =
      originalFindOneAndUpdate;
  }
});

test('getAboutContent maps database document fields', async () => {
  const originalFindOne = AboutContentModel.findOne;
  const doc = {
    key: 'primary-about',
    eyebrow: 'eyebrow',
    heading: 'heading',
    paragraph1: 'p1',
    paragraph2: 'p2',
    paragraph3: 'p3',
    focusPoints: ['f1', 'f2'],
    processEyebrow: 'process',
    processDescription: 'process description',
    imageUrl: 'https://example.com/a.jpg',
    imageAlt: 'alt',
  };

  (AboutContentModel as unknown as { findOne: () => { lean: () => Promise<unknown> } }).findOne = () => ({
    lean: async () => doc,
  });

  try {
    const content = await getAboutContent();
    assert.deepEqual(content, {
      eyebrow: doc.eyebrow,
      heading: doc.heading,
      paragraph1: doc.paragraph1,
      paragraph2: doc.paragraph2,
      paragraph3: doc.paragraph3,
      focusPoints: doc.focusPoints,
      processEyebrow: doc.processEyebrow,
      processDescription: doc.processDescription,
      imageUrl: doc.imageUrl,
      imageAlt: doc.imageAlt,
    });
  } finally {
    (AboutContentModel as unknown as { findOne: typeof AboutContentModel.findOne }).findOne = originalFindOne;
  }
});

test('getAboutContent returns defaults when no document exists', async () => {
  const originalFindOne = AboutContentModel.findOne;

  (AboutContentModel as unknown as { findOne: () => { lean: () => Promise<unknown> } }).findOne = () => ({
    lean: async () => null,
  });

  try {
    const content = await getAboutContent();
    assert.deepEqual(content, defaultAboutContent);
  } finally {
    (AboutContentModel as unknown as { findOne: typeof AboutContentModel.findOne }).findOne = originalFindOne;
  }
});

test('upsertAboutContent persists with fixed key and returns input', async () => {
  const originalFindOneAndUpdate = AboutContentModel.findOneAndUpdate;

  (AboutContentModel as unknown as { findOneAndUpdate: (...args: unknown[]) => Promise<unknown> }).findOneAndUpdate = (
    filter: unknown,
    update: unknown,
    options: unknown
  ) => {
    assert.deepEqual(filter, { key: 'primary-about' });
    assert.deepEqual(options, { upsert: true, new: true, setDefaultsOnInsert: true });
    assert.equal((update as { key: string }).key, 'primary-about');
    return Promise.resolve(null);
  };

  const input = {
    eyebrow: 'eyebrow',
    heading: 'heading',
    paragraph1: 'p1',
    paragraph2: 'p2',
    paragraph3: 'p3',
    focusPoints: ['f1', 'f2'],
    processEyebrow: 'process',
    processDescription: 'process description',
    imageUrl: 'https://example.com/a.jpg',
    imageAlt: 'alt',
  };

  try {
    const saved = await upsertAboutContent(input);
    assert.deepEqual(saved, input);
  } finally {
    (AboutContentModel as unknown as { findOneAndUpdate: typeof AboutContentModel.findOneAndUpdate }).findOneAndUpdate =
      originalFindOneAndUpdate;
  }
});

test('getCraftsmanshipContent returns defaults when no document exists', async () => {
  const originalFindOne = CraftsmanshipContentModel.findOne;

  (CraftsmanshipContentModel as unknown as { findOne: () => { lean: () => Promise<unknown> } }).findOne = () => ({
    lean: async () => null,
  });

  try {
    const content = await getCraftsmanshipContent();
    assert.deepEqual(content, defaultCraftsmanshipContent);
  } finally {
    (CraftsmanshipContentModel as unknown as { findOne: typeof CraftsmanshipContentModel.findOne }).findOne =
      originalFindOne;
  }
});

test('upsertCraftsmanshipContent persists with fixed key and returns input', async () => {
  const originalFindOneAndUpdate = CraftsmanshipContentModel.findOneAndUpdate;

  (CraftsmanshipContentModel as unknown as { findOneAndUpdate: (...args: unknown[]) => Promise<unknown> }).findOneAndUpdate = (
    filter: unknown,
    update: unknown,
    options: unknown
  ) => {
    assert.deepEqual(filter, { key: 'primary-craftsmanship' });
    assert.deepEqual(options, { upsert: true, new: true, setDefaultsOnInsert: true });
    assert.equal((update as { key: string }).key, 'primary-craftsmanship');
    return Promise.resolve(null);
  };

  const input = {
    eyebrow: 'eyebrow',
    heading: 'heading',
    description: 'description',
    items: [
      { title: 'item 1', description: 'description 1' },
      { title: 'item 2', description: 'description 2' },
    ],
  };

  try {
    const saved = await upsertCraftsmanshipContent(input);
    assert.deepEqual(saved, input);
  } finally {
    (CraftsmanshipContentModel as unknown as { findOneAndUpdate: typeof CraftsmanshipContentModel.findOneAndUpdate }).findOneAndUpdate =
      originalFindOneAndUpdate;
  }
});

test('getContactContent returns defaults when no document exists', async () => {
  const originalFindOne = ContactContentModel.findOne;

  (ContactContentModel as unknown as { findOne: () => { lean: () => Promise<unknown> } }).findOne = () => ({
    lean: async () => null,
  });

  try {
    const content = await getContactContent();
    assert.deepEqual(content, defaultContactContent);
  } finally {
    (ContactContentModel as unknown as { findOne: typeof ContactContentModel.findOne }).findOne = originalFindOne;
  }
});

test('upsertContactContent persists with fixed key and returns input', async () => {
  const originalFindOneAndUpdate = ContactContentModel.findOneAndUpdate;

  (ContactContentModel as unknown as { findOneAndUpdate: (...args: unknown[]) => Promise<unknown> }).findOneAndUpdate = (
    filter: unknown,
    update: unknown,
    options: unknown
  ) => {
    assert.deepEqual(filter, { key: 'primary-contact' });
    assert.deepEqual(options, { upsert: true, new: true, setDefaultsOnInsert: true });
    assert.equal((update as { key: string }).key, 'primary-contact');
    return Promise.resolve(null);
  };

  const input = {
    eyebrow: 'eyebrow',
    heading: 'heading',
    description: 'description',
    nameLabel: 'name',
    namePlaceholder: 'name p',
    emailLabel: 'email',
    emailPlaceholder: 'email p',
    projectTypeLabel: 'project',
    projectDefaultOption: 'default',
    projectOptions: ['a', 'b'],
    messageLabel: 'message',
    messagePlaceholder: 'message p',
    submitText: 'submit',
    directContactLabel: 'direct',
    directContacts: [{ href: 'mailto:a@example.com', label: 'a@example.com' }],
  };

  try {
    const saved = await upsertContactContent(input);
    assert.deepEqual(saved, input);
  } finally {
    (ContactContentModel as unknown as { findOneAndUpdate: typeof ContactContentModel.findOneAndUpdate }).findOneAndUpdate =
      originalFindOneAndUpdate;
  }
});

test('createContactMessage persists payload and metadata', async () => {
  const originalCreate = ContactMessageModel.create;

  (ContactMessageModel as unknown as { create: (doc: unknown) => Promise<unknown> }).create = async (doc: unknown) => {
    assert.deepEqual(doc, {
      name: 'Jane',
      email: 'jane@example.com',
      projectType: 'Furniture',
      message: 'Hello',
      ipAddress: '10.0.0.1',
      userAgent: 'agent',
    });

    return doc;
  };

  try {
    await createContactMessage(
      {
        name: 'Jane',
        email: 'jane@example.com',
        projectType: 'Furniture',
        message: 'Hello',
      },
      {
        ipAddress: '10.0.0.1',
        userAgent: 'agent',
      }
    );
  } finally {
    (ContactMessageModel as unknown as { create: typeof ContactMessageModel.create }).create = originalCreate;
  }
});
