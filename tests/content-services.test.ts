import test from 'node:test';
import assert from 'node:assert/strict';
import { getHeroContent, upsertHeroContent } from '../server/hero-content-service';
import { getAboutContent, upsertAboutContent } from '../server/about-content-service';
import { getGalleryContent, upsertGalleryContent } from '../server/gallery-content-service';
import { getJournalContent, upsertJournalContent } from '../server/journal-content-service';
import { getContactContent, upsertContactContent } from '../server/contact-content-service';
import { getCraftsmanshipContent, upsertCraftsmanshipContent } from '../server/craftsmanship-content-service';
import { createContactMessage } from '../server/contact-message-service';
import { HeroContentModel } from '../server/models/HeroContent';
import { AboutContentModel } from '../server/models/AboutContent';
import { GalleryContentModel } from '../server/models/GalleryContent';
import { JournalContentModel } from '../server/models/JournalContent';
import { GalleryCategoryRecordModel } from '../server/models/GalleryCategoryRecord';
import { GallerySubcategoryRecordModel } from '../server/models/GallerySubcategoryRecord';
import { GalleryItemRecordModel } from '../server/models/GalleryItemRecord';
import { JournalPostRecordModel } from '../server/models/JournalPostRecord';
import { ContactContentModel } from '../server/models/ContactContent';
import { CraftsmanshipContentModel } from '../server/models/CraftsmanshipContent';
import { ContactMessageModel } from '../server/models/ContactMessage';
import { defaultHeroContent } from '../src/app/lib/heroContent';
import { defaultAboutContent } from '../src/app/lib/aboutContent';
import { defaultGalleryContent } from '../src/app/lib/gallery';
import { defaultJournalContent } from '../src/app/lib/journal';
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

test('getGalleryContent builds content from gallery settings and ranked records', async () => {
  const originalFindOne = GalleryContentModel.findOne;
  const originalFindCategories = GalleryCategoryRecordModel.find;
  const originalFindSubcategories = GallerySubcategoryRecordModel.find;
  const originalFindItems = GalleryItemRecordModel.find;

  (GalleryContentModel as unknown as { findOne: () => { lean: () => Promise<unknown> } }).findOne = () => ({
    lean: async () => ({
      key: 'primary-gallery',
      previewEyebrow: 'Gallery',
      previewHeading: 'Curated Work',
      previewDescription: 'Preview description',
      pageEyebrow: 'Archive',
      pageHeading: 'Gallery Heading',
      pageDescription: 'Page description',
    }),
  });

  (GalleryCategoryRecordModel as unknown as { find: typeof GalleryCategoryRecordModel.find }).find = (() => ({
    lean: async () => [
      {
        key: 'living-room',
        name: 'Living Room',
        eyebrow: 'Gallery I',
        description: 'Living room description',
        rank: 0,
      },
    ],
  })) as typeof GalleryCategoryRecordModel.find;

  (GallerySubcategoryRecordModel as unknown as { find: typeof GallerySubcategoryRecordModel.find }).find = (() => ({
    lean: async () => [
      {
        key: 'living-room:tables',
        name: 'Tables',
        categoryKey: 'living-room',
        rank: 0,
      },
    ],
  })) as typeof GallerySubcategoryRecordModel.find;

  (GalleryItemRecordModel as unknown as { find: typeof GalleryItemRecordModel.find }).find = (() => ({
    lean: async () => [
      {
        key: 'coffee-table',
        title: 'Coffee Table',
        categoryName: 'Living Room',
        subcategoryName: 'Tables',
        material: 'Walnut',
        note: 'Studio note',
        archiveCount: 1,
        featured: true,
        rank: 0,
        image: { src: '/uploads/coffee.jpg', alt: 'Coffee table' },
        images: [{ src: '/uploads/coffee.jpg', alt: 'Coffee table' }],
      },
    ],
  })) as typeof GalleryItemRecordModel.find;

  try {
    const content = await getGalleryContent();
    assert.equal(content.previewHeading, 'Curated Work');
    assert.equal(content.categories.length, 1);
    assert.equal(content.categories[0].name, 'Living Room');
    assert.deepEqual(content.categories[0].subcategories, ['Tables']);
    assert.equal(content.pieces.length, 1);
    assert.equal(content.pieces[0].title, 'Coffee Table');
    assert.equal(content.pieces[0].rank, 0);
  } finally {
    (GalleryContentModel as unknown as { findOne: typeof GalleryContentModel.findOne }).findOne = originalFindOne;
    (GalleryCategoryRecordModel as unknown as { find: typeof GalleryCategoryRecordModel.find }).find = originalFindCategories;
    (GallerySubcategoryRecordModel as unknown as { find: typeof GallerySubcategoryRecordModel.find }).find = originalFindSubcategories;
    (GalleryItemRecordModel as unknown as { find: typeof GalleryItemRecordModel.find }).find = originalFindItems;
  }
});

test('upsertGalleryContent persists settings and syncs ranked category/item records', async () => {
  const originalFindOneAndUpdate = GalleryContentModel.findOneAndUpdate;
  const originalCategoryFindOneAndUpdate = GalleryCategoryRecordModel.findOneAndUpdate;
  const originalSubcategoryFindOneAndUpdate = GallerySubcategoryRecordModel.findOneAndUpdate;
  const originalItemFindOneAndUpdate = GalleryItemRecordModel.findOneAndUpdate;
  const originalCategoryDeleteMany = GalleryCategoryRecordModel.deleteMany;
  const originalSubcategoryDeleteMany = GallerySubcategoryRecordModel.deleteMany;
  const originalItemDeleteMany = GalleryItemRecordModel.deleteMany;
  const originalFindOne = GalleryContentModel.findOne;
  const originalFindCategories = GalleryCategoryRecordModel.find;
  const originalFindSubcategories = GallerySubcategoryRecordModel.find;
  const originalFindItems = GalleryItemRecordModel.find;
  const input = {
    ...defaultGalleryContent,
    previewHeading: 'Edited Gallery Heading',
    pieces: defaultGalleryContent.pieces.slice(0, 2),
  };

  (GalleryContentModel as unknown as { findOneAndUpdate: (...args: unknown[]) => Promise<unknown> }).findOneAndUpdate = (
    filter: unknown,
    update: unknown,
    options: unknown
  ) => {
    assert.deepEqual(filter, { key: 'primary-gallery' });
    assert.deepEqual(options, { upsert: true, new: true, setDefaultsOnInsert: true });
    assert.equal((update as { key: string }).key, 'primary-gallery');
    return Promise.resolve(null);
  };

  (GalleryCategoryRecordModel as unknown as { findOneAndUpdate: typeof GalleryCategoryRecordModel.findOneAndUpdate }).findOneAndUpdate =
    (() => Promise.resolve(null)) as typeof GalleryCategoryRecordModel.findOneAndUpdate;
  (GallerySubcategoryRecordModel as unknown as { findOneAndUpdate: typeof GallerySubcategoryRecordModel.findOneAndUpdate }).findOneAndUpdate =
    (() => Promise.resolve(null)) as typeof GallerySubcategoryRecordModel.findOneAndUpdate;
  (GalleryItemRecordModel as unknown as { findOneAndUpdate: typeof GalleryItemRecordModel.findOneAndUpdate }).findOneAndUpdate =
    (() => Promise.resolve(null)) as typeof GalleryItemRecordModel.findOneAndUpdate;
  (GalleryCategoryRecordModel as unknown as { deleteMany: typeof GalleryCategoryRecordModel.deleteMany }).deleteMany =
    (() => Promise.resolve(null)) as typeof GalleryCategoryRecordModel.deleteMany;
  (GallerySubcategoryRecordModel as unknown as { deleteMany: typeof GallerySubcategoryRecordModel.deleteMany }).deleteMany =
    (() => Promise.resolve(null)) as typeof GallerySubcategoryRecordModel.deleteMany;
  (GalleryItemRecordModel as unknown as { deleteMany: typeof GalleryItemRecordModel.deleteMany }).deleteMany =
    (() => Promise.resolve(null)) as typeof GalleryItemRecordModel.deleteMany;

  (GalleryContentModel as unknown as { findOne: typeof GalleryContentModel.findOne }).findOne = () => ({
    lean: async () => ({
      key: 'primary-gallery',
      previewEyebrow: 'Preview',
      previewHeading: 'Edited Gallery Heading',
      previewDescription: 'Description',
      pageEyebrow: 'Page',
      pageHeading: 'Heading',
      pageDescription: 'Page description',
    }),
  }) as ReturnType<typeof GalleryContentModel.findOne>;
  (GalleryCategoryRecordModel as unknown as { find: typeof GalleryCategoryRecordModel.find }).find = (() => ({
    lean: async () => input.categories,
  })) as typeof GalleryCategoryRecordModel.find;
  (GallerySubcategoryRecordModel as unknown as { find: typeof GallerySubcategoryRecordModel.find }).find = (() => ({
    lean: async () => input.categories.flatMap((category) =>
      category.subcategories.map((subcategory, rank) => ({
        key: `${category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}:${subcategory.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
        name: subcategory,
        categoryKey: category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        rank,
      }))
    ),
  })) as typeof GallerySubcategoryRecordModel.find;
  (GalleryItemRecordModel as unknown as { find: typeof GalleryItemRecordModel.find }).find = (() => ({
    lean: async () => input.pieces.map((piece, rank) => ({
      key: piece.id,
      title: piece.title,
      categoryName: piece.category,
      subcategoryName: piece.subcategory,
      material: piece.material,
      note: piece.note,
      archiveCount: piece.archiveCount,
      featured: piece.featured,
      rank,
      image: piece.image,
      images: piece.images,
    })),
  })) as typeof GalleryItemRecordModel.find;

  try {
    const saved = await upsertGalleryContent(input);
    assert.equal(saved.previewHeading, 'Edited Gallery Heading');
    assert.equal(saved.pieces.length, 2);
  } finally {
    (GalleryContentModel as unknown as { findOneAndUpdate: typeof GalleryContentModel.findOneAndUpdate }).findOneAndUpdate =
      originalFindOneAndUpdate;
    (GalleryCategoryRecordModel as unknown as { findOneAndUpdate: typeof GalleryCategoryRecordModel.findOneAndUpdate }).findOneAndUpdate = originalCategoryFindOneAndUpdate;
    (GallerySubcategoryRecordModel as unknown as { findOneAndUpdate: typeof GallerySubcategoryRecordModel.findOneAndUpdate }).findOneAndUpdate = originalSubcategoryFindOneAndUpdate;
    (GalleryItemRecordModel as unknown as { findOneAndUpdate: typeof GalleryItemRecordModel.findOneAndUpdate }).findOneAndUpdate = originalItemFindOneAndUpdate;
    (GalleryCategoryRecordModel as unknown as { deleteMany: typeof GalleryCategoryRecordModel.deleteMany }).deleteMany = originalCategoryDeleteMany;
    (GallerySubcategoryRecordModel as unknown as { deleteMany: typeof GallerySubcategoryRecordModel.deleteMany }).deleteMany = originalSubcategoryDeleteMany;
    (GalleryItemRecordModel as unknown as { deleteMany: typeof GalleryItemRecordModel.deleteMany }).deleteMany = originalItemDeleteMany;
    (GalleryContentModel as unknown as { findOne: typeof GalleryContentModel.findOne }).findOne = originalFindOne;
    (GalleryCategoryRecordModel as unknown as { find: typeof GalleryCategoryRecordModel.find }).find = originalFindCategories;
    (GallerySubcategoryRecordModel as unknown as { find: typeof GallerySubcategoryRecordModel.find }).find = originalFindSubcategories;
    (GalleryItemRecordModel as unknown as { find: typeof GalleryItemRecordModel.find }).find = originalFindItems;
  }
});

test('getJournalContent builds content from journal settings and post records', async () => {
  const originalFindOne = JournalContentModel.findOne;
  const originalFindPosts = JournalPostRecordModel.find;

  (JournalContentModel as unknown as { findOne: () => { lean: () => Promise<unknown> } }).findOne = () => ({
    lean: async () => ({
      key: 'primary-journal',
      previewEyebrow: 'Insights',
      previewHeading: 'Edited Journal',
      previewDescription: 'Preview copy',
      pageEyebrow: 'Journal',
      pageHeading: 'Page heading',
      pageDescription: 'Page description',
    }),
  });

  (JournalPostRecordModel as unknown as { find: typeof JournalPostRecordModel.find }).find = (() => ({
    sort: () => ({
      lean: async () => [
        {
          key: 'wood-selection',
          slug: 'wood-selection',
          title: 'Wood Selection',
          excerpt: 'Excerpt',
          category: 'Materials',
          publishedAt: '2026-04-15',
          featured: true,
          published: true,
          rank: 0,
          coverImageUrl: '/uploads/wood.jpg',
          coverImageAlt: 'Wood',
          galleryImageUrls: ['/uploads/wood.jpg'],
          body: 'Body copy',
        },
      ],
    }),
  })) as typeof JournalPostRecordModel.find;

  try {
    const content = await getJournalContent();
    assert.equal(content.previewHeading, 'Edited Journal');
    assert.equal(content.posts.length, 1);
    assert.equal(content.posts[0].slug, 'wood-selection');
    assert.equal(content.posts[0].rank, 0);
  } finally {
    (JournalContentModel as unknown as { findOne: typeof JournalContentModel.findOne }).findOne = originalFindOne;
    (JournalPostRecordModel as unknown as { find: typeof JournalPostRecordModel.find }).find = originalFindPosts;
  }
});

test('upsertJournalContent persists settings and syncs post records', async () => {
  const originalFindOneAndUpdate = JournalContentModel.findOneAndUpdate;
  const originalPostFindOneAndUpdate = JournalPostRecordModel.findOneAndUpdate;
  const originalPostDeleteMany = JournalPostRecordModel.deleteMany;
  const originalFindOne = JournalContentModel.findOne;
  const originalFindPosts = JournalPostRecordModel.find;
  const input = {
    ...defaultJournalContent,
    previewHeading: 'Edited Journal Heading',
    posts: defaultJournalContent.posts.slice(0, 2),
  };

  (JournalContentModel as unknown as { findOneAndUpdate: (...args: unknown[]) => Promise<unknown> }).findOneAndUpdate = (
    filter: unknown,
    update: unknown,
    options: unknown
  ) => {
    assert.deepEqual(filter, { key: 'primary-journal' });
    assert.deepEqual(options, { upsert: true, new: true, setDefaultsOnInsert: true });
    assert.equal((update as { key: string }).key, 'primary-journal');
    return Promise.resolve(null);
  };

  (JournalPostRecordModel as unknown as { findOneAndUpdate: typeof JournalPostRecordModel.findOneAndUpdate }).findOneAndUpdate =
    (() => Promise.resolve(null)) as typeof JournalPostRecordModel.findOneAndUpdate;
  (JournalPostRecordModel as unknown as { deleteMany: typeof JournalPostRecordModel.deleteMany }).deleteMany =
    (() => Promise.resolve(null)) as typeof JournalPostRecordModel.deleteMany;
  (JournalContentModel as unknown as { findOne: typeof JournalContentModel.findOne }).findOne = () => ({
    lean: async () => ({
      key: 'primary-journal',
      previewEyebrow: 'Insights',
      previewHeading: 'Edited Journal Heading',
      previewDescription: 'Preview',
      pageEyebrow: 'Journal',
      pageHeading: 'Page heading',
      pageDescription: 'Page description',
    }),
  }) as ReturnType<typeof JournalContentModel.findOne>;
  (JournalPostRecordModel as unknown as { find: typeof JournalPostRecordModel.find }).find = (() => ({
    sort: () => ({
      lean: async () => input.posts.map((post, rank) => ({
        key: post.id,
        ...post,
        rank,
      })),
    }),
  })) as typeof JournalPostRecordModel.find;

  try {
    const saved = await upsertJournalContent(input);
    assert.equal(saved.previewHeading, 'Edited Journal Heading');
    assert.equal(saved.posts.length, 2);
  } finally {
    (JournalContentModel as unknown as { findOneAndUpdate: typeof JournalContentModel.findOneAndUpdate }).findOneAndUpdate =
      originalFindOneAndUpdate;
    (JournalPostRecordModel as unknown as { findOneAndUpdate: typeof JournalPostRecordModel.findOneAndUpdate }).findOneAndUpdate = originalPostFindOneAndUpdate;
    (JournalPostRecordModel as unknown as { deleteMany: typeof JournalPostRecordModel.deleteMany }).deleteMany = originalPostDeleteMany;
    (JournalContentModel as unknown as { findOne: typeof JournalContentModel.findOne }).findOne = originalFindOne;
    (JournalPostRecordModel as unknown as { find: typeof JournalPostRecordModel.find }).find = originalFindPosts;
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
