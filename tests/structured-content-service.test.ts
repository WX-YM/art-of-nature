import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deleteGalleryCategoryRecord,
  deriveStructuredContentSeedFromDefaults,
  getRankedGalleryCategories,
  normalizeGalleryCategoryPayload,
  normalizeRank,
  upsertGalleryCategoryStructure,
  upsertGalleryCategoryRecord,
} from '../server/structured-content-service';
import { GalleryCategoryRecordModel } from '../server/models/GalleryCategoryRecord';
import { GallerySubcategoryRecordModel } from '../server/models/GallerySubcategoryRecord';
import { GalleryItemRecordModel } from '../server/models/GalleryItemRecord';
import { defaultGalleryContent } from '../src/app/lib/gallery';
import { defaultJournalContent } from '../src/app/lib/journal';

test('deriveStructuredContentSeedFromDefaults maps lib defaults into ranked collections', () => {
  const seed = deriveStructuredContentSeedFromDefaults();

  assert.equal(seed.categories.length, defaultGalleryContent.categories.length);
  assert.equal(seed.subcategories.length, defaultGalleryContent.categories.reduce((sum, category) => sum + category.subcategories.length, 0));
  assert.equal(seed.galleryItems.length, defaultGalleryContent.pieces.length);
  assert.equal(seed.journalPosts.length, defaultJournalContent.posts.length);

  assert.equal(seed.categories[0].rank, 0);
  assert.equal(seed.categories[0].name, defaultGalleryContent.categories[0].name);
  assert.equal(seed.subcategories[0].rank, 0);
  assert.equal(seed.galleryItems[0].rank, 0);
  assert.equal(seed.galleryItems[0].key, defaultGalleryContent.pieces[0].id);
  assert.equal(seed.journalPosts[0].rank, 0);
  assert.equal(seed.journalPosts[0].key, defaultJournalContent.posts[0].id);
});

test('normalizeGalleryCategoryPayload trims values and derives slug/key', () => {
  const normalized = normalizeGalleryCategoryPayload({
    name: '  Dining Room  ',
    eyebrow: '  Gallery II  ',
    description: '  Hosting pieces.  ',
    rank: 4,
  });

  assert.deepEqual(normalized, {
    key: 'dining-room',
    slug: 'dining-room',
    name: 'Dining Room',
    eyebrow: 'Gallery II',
    description: 'Hosting pieces.',
    rank: 4,
  });
});

test('normalizeRank accepts numeric strings for manual database edits', () => {
  assert.equal(normalizeRank('0', 8), 0);
  assert.equal(normalizeRank(' 12 ', 8), 12);
  assert.equal(normalizeRank('not-a-number', 8), 8);
});

test('getRankedGalleryCategories sorts ranked categories ascending', async () => {
  const originalFind = GalleryCategoryRecordModel.find;

  (GalleryCategoryRecordModel as unknown as {
    find: typeof GalleryCategoryRecordModel.find;
  }).find = (() => ({
    lean: async () => [{ key: 'b', rank: '6', name: 'Living Room' }, { key: 'a', rank: '0', name: 'Test 7' }],
  })) as typeof GalleryCategoryRecordModel.find;

  try {
    const result = await getRankedGalleryCategories();
    assert.deepEqual(result, [
      { key: 'a', rank: 0, name: 'Test 7' },
      { key: 'b', rank: 6, name: 'Living Room' },
    ]);
  } finally {
    (GalleryCategoryRecordModel as unknown as {
      find: typeof GalleryCategoryRecordModel.find;
    }).find = originalFind;
  }
});

test('upsertGalleryCategoryRecord persists a normalized ranked category', async () => {
  const originalCountDocuments = GalleryCategoryRecordModel.countDocuments;
  const originalFindOneAndUpdate = GalleryCategoryRecordModel.findOneAndUpdate;

  (GalleryCategoryRecordModel as unknown as {
    countDocuments: typeof GalleryCategoryRecordModel.countDocuments;
  }).countDocuments = (async () => 6) as typeof GalleryCategoryRecordModel.countDocuments;

  (GalleryCategoryRecordModel as unknown as {
    findOneAndUpdate: typeof GalleryCategoryRecordModel.findOneAndUpdate;
  }).findOneAndUpdate = ((filter: unknown, update: unknown, options: unknown) => {
    assert.deepEqual(filter, { key: 'restroom' });
    assert.deepEqual(options, { upsert: true, new: true, setDefaultsOnInsert: true, lean: true });
    assert.deepEqual(update, {
      key: 'restroom',
      slug: 'restroom',
      name: 'Restroom',
      eyebrow: 'Gallery IV',
      description: 'Compact interventions.',
      rank: 6,
    });
    return Promise.resolve(update);
  }) as typeof GalleryCategoryRecordModel.findOneAndUpdate;

  try {
    const result = await upsertGalleryCategoryRecord({
      name: 'Restroom',
      eyebrow: 'Gallery IV',
      description: 'Compact interventions.',
    });

    assert.equal(result.rank, 6);
    assert.equal(result.slug, 'restroom');
  } finally {
    (GalleryCategoryRecordModel as unknown as {
      countDocuments: typeof GalleryCategoryRecordModel.countDocuments;
      findOneAndUpdate: typeof GalleryCategoryRecordModel.findOneAndUpdate;
    }).countDocuments = originalCountDocuments;
    (GalleryCategoryRecordModel as unknown as {
      findOneAndUpdate: typeof GalleryCategoryRecordModel.findOneAndUpdate;
    }).findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test('upsertGalleryCategoryStructure stores a category with ranked subcategories', async () => {
  const originalCountDocuments = GalleryCategoryRecordModel.countDocuments;
  const originalCategoryFindOneAndUpdate = GalleryCategoryRecordModel.findOneAndUpdate;
  const originalSubcategoryFind = GallerySubcategoryRecordModel.find;
  const originalSubcategoryFindOneAndUpdate = GallerySubcategoryRecordModel.findOneAndUpdate;
  const originalSubcategoryDeleteMany = GallerySubcategoryRecordModel.deleteMany;
  const originalUpdateMany = GalleryItemRecordModel.updateMany;

  (GalleryCategoryRecordModel as unknown as {
    countDocuments: typeof GalleryCategoryRecordModel.countDocuments;
  }).countDocuments = (async () => 7) as typeof GalleryCategoryRecordModel.countDocuments;

  (GalleryCategoryRecordModel as unknown as {
    findOneAndUpdate: typeof GalleryCategoryRecordModel.findOneAndUpdate;
  }).findOneAndUpdate = ((filter: unknown, update: unknown) => {
    assert.deepEqual(filter, { key: 'test-7' });
    assert.deepEqual(update, {
      key: 'test-7',
      slug: 'test-7',
      name: 'Test 7',
      eyebrow: 'Gallery VII',
      description: 'Experimental room edits.',
      rank: 0,
    });
    return Promise.resolve(update);
  }) as typeof GalleryCategoryRecordModel.findOneAndUpdate;

  (GallerySubcategoryRecordModel as unknown as {
    find: typeof GallerySubcategoryRecordModel.find;
  }).find = (() => ({
    lean: async () => [],
  })) as typeof GallerySubcategoryRecordModel.find;

  const savedSubcategories: unknown[] = [];
  (GallerySubcategoryRecordModel as unknown as {
    findOneAndUpdate: typeof GallerySubcategoryRecordModel.findOneAndUpdate;
  }).findOneAndUpdate = ((_filter: unknown, update: unknown) => {
    savedSubcategories.push(update);
    return Promise.resolve(update);
  }) as typeof GallerySubcategoryRecordModel.findOneAndUpdate;

  (GallerySubcategoryRecordModel as unknown as {
    deleteMany: typeof GallerySubcategoryRecordModel.deleteMany;
  }).deleteMany = ((filter: unknown) => {
    assert.deepEqual(filter, {
      categoryKey: 'test-7',
      key: { $nin: ['test-7:seating', 'test-7:lighting'] },
    });
    return Promise.resolve({ acknowledged: true, deletedCount: 0 });
  }) as typeof GallerySubcategoryRecordModel.deleteMany;

  (GalleryItemRecordModel as unknown as {
    updateMany: typeof GalleryItemRecordModel.updateMany;
  }).updateMany = ((filter: unknown, update: unknown) => {
    assert.deepEqual(filter, { categoryKey: 'test-7' });
    assert.deepEqual(update, {
      $set: {
        categoryName: 'Test 7',
        categorySlug: 'test-7',
      },
    });
    return Promise.resolve({ acknowledged: true, modifiedCount: 0 });
  }) as typeof GalleryItemRecordModel.updateMany;

  try {
    const result = await upsertGalleryCategoryStructure({
      name: 'Test 7',
      eyebrow: 'Gallery VII',
      description: 'Experimental room edits.',
      rank: '0',
      subcategories: ['Seating', 'Lighting'],
    });

    assert.equal(result.category.rank, 0);
    assert.deepEqual(savedSubcategories, [
      {
        key: 'test-7:seating',
        slug: 'seating',
        name: 'Seating',
        categoryKey: 'test-7',
        categorySlug: 'test-7',
        categoryName: 'Test 7',
        rank: 0,
      },
      {
        key: 'test-7:lighting',
        slug: 'lighting',
        name: 'Lighting',
        categoryKey: 'test-7',
        categorySlug: 'test-7',
        categoryName: 'Test 7',
        rank: 1,
      },
    ]);
  } finally {
    (GalleryCategoryRecordModel as unknown as {
      countDocuments: typeof GalleryCategoryRecordModel.countDocuments;
      findOneAndUpdate: typeof GalleryCategoryRecordModel.findOneAndUpdate;
    }).countDocuments = originalCountDocuments;
    (GalleryCategoryRecordModel as unknown as {
      findOneAndUpdate: typeof GalleryCategoryRecordModel.findOneAndUpdate;
    }).findOneAndUpdate = originalCategoryFindOneAndUpdate;
    (GallerySubcategoryRecordModel as unknown as {
      find: typeof GallerySubcategoryRecordModel.find;
      findOneAndUpdate: typeof GallerySubcategoryRecordModel.findOneAndUpdate;
      deleteMany: typeof GallerySubcategoryRecordModel.deleteMany;
    }).find = originalSubcategoryFind;
    (GallerySubcategoryRecordModel as unknown as {
      findOneAndUpdate: typeof GallerySubcategoryRecordModel.findOneAndUpdate;
    }).findOneAndUpdate = originalSubcategoryFindOneAndUpdate;
    (GallerySubcategoryRecordModel as unknown as {
      deleteMany: typeof GallerySubcategoryRecordModel.deleteMany;
    }).deleteMany = originalSubcategoryDeleteMany;
    (GalleryItemRecordModel as unknown as {
      updateMany: typeof GalleryItemRecordModel.updateMany;
    }).updateMany = originalUpdateMany;
  }
});

test('deleteGalleryCategoryRecord removes the category and cascades to subcategories and items', async () => {
  const originalFindOneAndDelete = GalleryCategoryRecordModel.findOneAndDelete;
  const originalDeleteSubcategories = GallerySubcategoryRecordModel.deleteMany;
  const originalDeleteItems = GalleryItemRecordModel.deleteMany;

  (GalleryCategoryRecordModel as unknown as {
    findOneAndDelete: typeof GalleryCategoryRecordModel.findOneAndDelete;
  }).findOneAndDelete = (() => ({
    lean: async () => ({ key: 'living-room', slug: 'living-room', name: 'Living Room' }),
  })) as typeof GalleryCategoryRecordModel.findOneAndDelete;

  (GallerySubcategoryRecordModel as unknown as {
    deleteMany: typeof GallerySubcategoryRecordModel.deleteMany;
  }).deleteMany = ((filter: unknown) => {
    assert.deepEqual(filter, { categoryKey: 'living-room' });
    return Promise.resolve({ acknowledged: true, deletedCount: 3 });
  }) as typeof GallerySubcategoryRecordModel.deleteMany;

  (GalleryItemRecordModel as unknown as {
    deleteMany: typeof GalleryItemRecordModel.deleteMany;
  }).deleteMany = ((filter: unknown) => {
    assert.deepEqual(filter, { categoryKey: 'living-room' });
    return Promise.resolve({ acknowledged: true, deletedCount: 9 });
  }) as typeof GalleryItemRecordModel.deleteMany;

  try {
    const deleted = await deleteGalleryCategoryRecord('Living Room');
    assert.equal(deleted.key, 'living-room');
  } finally {
    (GalleryCategoryRecordModel as unknown as {
      findOneAndDelete: typeof GalleryCategoryRecordModel.findOneAndDelete;
    }).findOneAndDelete = originalFindOneAndDelete;
    (GallerySubcategoryRecordModel as unknown as {
      deleteMany: typeof GallerySubcategoryRecordModel.deleteMany;
    }).deleteMany = originalDeleteSubcategories;
    (GalleryItemRecordModel as unknown as {
      deleteMany: typeof GalleryItemRecordModel.deleteMany;
    }).deleteMany = originalDeleteItems;
  }
});
